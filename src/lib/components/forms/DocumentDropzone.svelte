<script lang="ts">
	import type { Attachment } from '#lib/server/db/schema.ts';

	let {
		attachments = [],
		label = 'Zulassungsbescheinigung Teil I (Fahrzeugschein)',
		error,
		onUpload,
		onDelete
	}: {
		attachments: Attachment[];
		label?: string;
		error?: string;
		onUpload?: (meta: { filename: string; sizeBytes: number; mimeType: string }) => Promise<void>;
		onDelete?: (id: number) => Promise<void>;
	} = $props();

	let isDragging = $state(false);
	let localError = $state<string | null>(null);

	const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
	const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	async function handleFiles(files: FileList | null) {
		localError = null;
		if (!files || files.length === 0) return;

		const file = files[0];
		if (!ALLOWED_MIMES.includes(file.type) || !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
			localError = 'Ungültiges Dateiformat. Erlaubt sind PDF, JPG und PNG.';
			return;
		}

		if (file.size <= 0 || file.size > MAX_BYTES) {
			localError = 'Die Datei ist leer oder zu groß (maximal 5 MB erlaubt).';
			return;
		}

		if (onUpload) {
			await onUpload({
				filename: file.name,
				sizeBytes: file.size,
				mimeType: file.type || 'application/pdf'
			});
		}
	}

	async function onDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			await handleFiles(e.dataTransfer.files);
		}
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function onDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	async function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		await handleFiles(input.files);
		input.value = '';
	}
</script>

<div class="space-y-4">
	<label for="file-upload-input" class="field-label">
		{label}
	</label>
	<p class="field-hint" id="file-upload-hint">
		Laden Sie die Vorderseite der Zulassungsbescheinigung Teil I (Fahrzeugschein) als PDF, JPG oder
		PNG hoch (max. 5 MB). Demo: Es werden nur Dateiname und Metadaten gespeichert, keine
		Dateiinhalte.
	</p>

	<!-- Drop area -->
	<div
		class="relative flex flex-col items-center justify-center border-2 border-dashed p-6 text-center transition-colors {isDragging
			? 'border-amt-700 bg-amt-50'
			: 'border-rule bg-sheet hover:border-amt-500'}"
		ondrop={onDrop}
		ondragover={onDragOver}
		ondragleave={onDragLeave}
		role="region"
		aria-label="Dokument-Upload-Bereich"
	>
		<p class="text-sm font-bold text-ink">Datei hierher ziehen oder durchsuchen</p>
		<p class="mt-1 text-xs text-ink-soft">PDF, JPG oder PNG bis maximal 5 MB</p>

		<input
			id="file-upload-input"
			type="file"
			accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
			class="mt-3 max-w-full"
			onchange={onFileChange}
			aria-describedby="file-upload-hint"
		/>
	</div>

	{#if localError || error}
		<p class="field-error" role="alert">{localError || error}</p>
	{/if}

	<!-- Uploaded attachments list -->
	{#if attachments.length > 0}
		<div class="mt-4">
			<h4 class="text-sm font-bold text-ink">Hochgeladene Nachweise ({attachments.length})</h4>
			<ul class="mt-2 divide-y divide-rule border border-rule bg-sheet">
				{#each attachments as att (att.id)}
					<li class="flex items-center justify-between p-3 text-sm">
						<div class="flex flex-col">
							<span class="font-bold text-ink">{att.filename}</span>
							<span class="text-xs text-ink-soft">
								{att.label} • {formatBytes(att.sizeBytes)}
							</span>
						</div>
						{#if onDelete}
							<button
								type="button"
								class="btn btn-ghost btn-sm text-signal-800"
								onclick={() => onDelete(att.id)}
							>
								Entfernen
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
