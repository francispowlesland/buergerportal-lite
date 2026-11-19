import type { TrustLevel } from '#lib/trust.ts';

export type MessageKind = 'status' | 'bescheid' | 'nachforderung' | 'nachricht';

/** One row of the Postkorb list. Contains no message body, so locked messages leak nothing. */
export type InboxItem = {
	id: number;
	kind: MessageKind;
	subject: string;
	fromName: string;
	requiredTrust: TrustLevel;
	fromCitizen: boolean;
	unread: boolean;
	/** The live session level is too low to open this message. */
	locked: boolean;
	/** Open Nachforderung: the case waits for the citizen. */
	actionRequired: boolean;
	createdAt: Date;
	reference: string | null;
};

export const FILTERS = [
	{ key: 'alle', label: 'Alle' },
	{ key: 'ungelesen', label: 'Ungelesen' },
	{ key: 'nachforderung', label: 'Nachforderungen' },
	{ key: 'bescheid', label: 'Bescheide' },
	{ key: 'status', label: 'Statusmeldungen' },
	{ key: 'nachricht', label: 'Nachrichten' },
	{ key: 'gesendet', label: 'Gesendet' }
] as const;

export type FilterKey = (typeof FILTERS)[number]['key'];

export function matchesFilter(item: InboxItem, key: FilterKey): boolean {
	switch (key) {
		case 'alle':
			return true;
		case 'ungelesen':
			return item.unread;
		case 'gesendet':
			return item.fromCitizen;
		default:
			return !item.fromCitizen && item.kind === key;
	}
}

/** Result of the reply form action. Same shape for success and failure. */
export type ReplyResult = {
	ok: boolean;
	message: string;
	errors: { text?: string; dokumente?: string };
	text: string;
	/** Number of documents attached to the case. */
	dokumente: number;
};

export type UploadMeta = {
	filename: string;
	sizeBytes: number;
	mimeType: string;
	label: string;
};

export const UPLOAD_LIMITS = {
	maxFiles: 5,
	maxBytes: 5 * 1024 * 1024,
	maxText: 2000,
	extensions: { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' }
} as const;

export function extensionOf(filename: string): string {
	const dot = filename.lastIndexOf('.');
	return dot < 0 ? '' : filename.slice(dot + 1).toLowerCase();
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/** "Nachforderung zu Antrag MS-2026-004738: Fahrzeugschein" → "Fahrzeugschein". */
export function requestedDocument(subject: string): string | null {
	const m = /^Nachforderung zu Antrag [^:]+:\s*(.+)$/.exec(subject);
	return m ? m[1].trim() : null;
}

/** Sanitised, simulated upload as sent by the dropzone (metadata only, no file content). */
export function validateUpload(
	raw: unknown
): { ok: true; file: UploadMeta } | { ok: false; error: string } {
	if (typeof raw !== 'object' || raw === null)
		return { ok: false, error: 'Ungültige Dateiangabe.' };
	const r = raw as Record<string, unknown>;
	const filename =
		typeof r.filename === 'string'
			? r.filename
					// eslint-disable-next-line no-control-regex
					.replace(/[\u0000-\u001f\u007f/\\]/g, '')
					.trim()
					.slice(0, 120)
			: '';
	if (!filename) return { ok: false, error: 'Der Dateiname fehlt.' };
	const extension = extensionOf(filename);
	if (!Object.hasOwn(UPLOAD_LIMITS.extensions, extension))
		return {
			ok: false,
			error: `„${filename}“ hat ein ungültiges Format. Erlaubt sind PDF, JPG und PNG.`
		};
	const mimeType = UPLOAD_LIMITS.extensions[extension as keyof typeof UPLOAD_LIMITS.extensions];
	if (r.mimeType && r.mimeType !== mimeType && r.mimeType !== 'application/octet-stream')
		return { ok: false, error: `„${filename}“ hat einen unpassenden Dateityp.` };
	const sizeBytes = typeof r.sizeBytes === 'number' ? r.sizeBytes : NaN;
	if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1)
		return { ok: false, error: `„${filename}“ ist leer.` };
	if (sizeBytes > UPLOAD_LIMITS.maxBytes)
		return { ok: false, error: `„${filename}“ ist größer als 5 MB.` };
	return { ok: true, file: { filename, sizeBytes, mimeType, label: '' } };
}

/** Validate the real multipart fields; posted user/case ids are deliberately ignored. */
export function validateReply(form: FormData) {
	const rawText = form.get('text');
	const text = typeof rawText === 'string' ? rawText.replace(/\r\n/g, '\n').trim() : '';
	const entries = form.getAll('datei');
	const files = entries.filter(
		(f): f is File => f instanceof File && !(f.name === '' && f.size === 0)
	);
	const errors: ReplyResult['errors'] = {};
	if (rawText !== null && typeof rawText !== 'string') {
		errors.text = 'Bitte geben Sie Ihre Nachricht als Text ein.';
	} else if (text.length > UPLOAD_LIMITS.maxText) {
		errors.text = `Ihre Nachricht ist zu lang (höchstens ${UPLOAD_LIMITS.maxText} Zeichen).`;
	}
	if (entries.some((entry) => typeof entry === 'string')) {
		errors.dokumente = 'Bitte wählen Sie eine Datei aus.';
	} else if (files.length > UPLOAD_LIMITS.maxFiles) {
		errors.dokumente = `Sie können höchstens ${UPLOAD_LIMITS.maxFiles} Dokumente gleichzeitig senden.`;
	}
	const valid: UploadMeta[] = [];
	for (const file of files.slice(0, UPLOAD_LIMITS.maxFiles)) {
		const result = validateUpload({
			filename: file.name,
			sizeBytes: file.size,
			mimeType: file.type
		});
		if (result.ok) valid.push(result.file);
		else errors.dokumente ??= result.error;
	}
	if (!text && !valid.length && !errors.text && !errors.dokumente) {
		errors.text = 'Bitte schreiben Sie eine Nachricht oder fügen Sie ein Dokument hinzu.';
	}
	return { text, valid, errors };
}
