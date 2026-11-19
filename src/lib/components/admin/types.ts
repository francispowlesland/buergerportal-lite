import type { ApplicationStatus, DefectCategory, DefectStatus } from '#lib/server/db/schema.ts';

/** Row of an application queue (never contains drafts). */
export type QueueRow = {
	id: number;
	reference: string;
	status: ApplicationStatus;
	citizenName: string;
	serviceName: string;
	officeSlug: string;
	officeName: string;
	submittedAt: Date | null;
	/** Whole days since submission. */
	ageDays: number | null;
	/** Still unprocessed or in progress for more than URGENT_DAYS. */
	overdue: boolean;
	assigneeName: string | null;
};

export type DefectRow = {
	id: number;
	reference: string;
	category: DefectCategory;
	title: string;
	address: string;
	status: DefectStatus;
	createdAt: Date;
	ageDays: number;
	lastUpdateAt: Date | null;
	lastUpdateNote: string | null;
	lastUpdateAuthor: string | null;
};

export type ScheduleItem = {
	id: number;
	code: string;
	startsAt: Date;
	endsAt: Date;
	locationName: string;
	serviceName: string;
	citizenName: string;
};

export type ScheduleDay = {
	key: string;
	label: string;
	isToday: boolean;
	items: ScheduleItem[];
};

export type ScopeOption = { slug: string; name: string };

export type ScopeInfo = {
	/** `alle` or an office slug. */
	slug: string;
	label: string;
	offices: ScopeOption[];
	ownSlug: string | null;
};

/** Result payload shared by all decision forms (`ok: false` = validation or state error). */
export type FormState =
	| {
			ok?: boolean;
			action: string;
			message: string;
			errors?: Record<string, string>;
			values?: Record<string, string>;
	  }
	| null
	| undefined;

export type CitizenInfo = {
	name: string;
	email: string;
	/** Already masked, see `maskSteuerId`. */
	steuerId: string;
	birthDate: string | null;
	address: string;
};

export type EventRow = {
	id: number;
	kind: string;
	note: string | null;
	createdAt: Date;
	actorName: string | null;
	actorRole: 'citizen' | 'caseworker' | null;
};

export type AttachmentRow = {
	id: number;
	label: string;
	filename: string;
	sizeBytes: number;
	mimeType: string;
	createdAt: Date;
};

export type BescheidInfo = {
	number: string;
	decision: string;
	bodyText: string;
	verificationCode: string;
	issuedAt: Date;
	issuedByName: string | null;
};
