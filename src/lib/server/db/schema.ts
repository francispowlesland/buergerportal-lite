import {
	boolean,
	doublePrecision,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { TRUST_LEVELS } from '../../trust';

/* ───────────── Enums ───────────── */

export const trustLevelEnum = pgEnum('trust_level', TRUST_LEVELS);
export const roleEnum = pgEnum('role', ['citizen', 'caseworker']);
export const serviceActionEnum = pgEnum('service_action', ['antrag', 'termin', 'efa', 'info']);
export const applicationStatusEnum = pgEnum('application_status', [
	'entwurf',
	'eingereicht',
	'in_pruefung',
	'nachforderung',
	'bewilligt',
	'abgelehnt'
]);
export const messageKindEnum = pgEnum('message_kind', [
	'status',
	'bescheid',
	'nachforderung',
	'nachricht'
]);
export const appointmentStatusEnum = pgEnum('appointment_status', ['gebucht', 'storniert']);
export const defectStatusEnum = pgEnum('defect_status', ['gemeldet', 'in_bearbeitung', 'behoben']);
export const defectCategoryEnum = pgEnum('defect_category', [
	'schlagloch',
	'strassenbeleuchtung',
	'graffiti',
	'illegale_muellablagerung',
	'spielplatz',
	'sonstiges'
]);

/* ───────────── Verwaltung ───────────── */

/** Amt, e.g. Bürgeramt, Standesamt, Kfz-Zulassung. */
export const offices = pgTable('offices', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	slug: varchar({ length: 64 }).notNull().unique(),
	name: text().notNull(),
	shortDescription: text().notNull(),
	phone: text().notNull(),
	email: text().notNull(),
	openingHours: text().notNull()
});

/** Physical Standort of an Amt; appointments are booked per location. */
export const locations = pgTable('locations', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	officeId: integer()
		.notNull()
		.references(() => offices.id),
	name: text().notNull(),
	street: text().notNull(),
	postalCode: varchar({ length: 5 }).notNull(),
	city: text().notNull().default('Musterstadt'),
	lat: doublePrecision().notNull(),
	lng: doublePrecision().notNull()
});

/** Leistung in the Behördenwegweiser. */
export const services = pgTable(
	'services',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		slug: varchar({ length: 96 }).notNull().unique(),
		name: text().notNull(),
		summary: text().notNull(),
		description: text().notNull(),
		officeId: integer()
			.notNull()
			.references(() => offices.id),
		/** Lebenslagen: geburt, umzug, heirat, auto, wahl, bauen, kinder, tod, wohnen, umwelt … */
		lebenslagen: text()
			.array()
			.notNull()
			.default(sql`'{}'::text[]`),
		keywords: text()
			.array()
			.notNull()
			.default(sql`'{}'::text[]`),
		/** Required documents (Nachweise). */
		documents: text()
			.array()
			.notNull()
			.default(sql`'{}'::text[]`),
		legalBasis: text().notNull(),
		feeCents: integer().notNull().default(0),
		feeNote: text(),
		processingTime: text().notNull(),
		requiredTrust: trustLevelEnum().notNull().default('basis'),
		/** What the primary button does. */
		action: serviceActionEnum().notNull().default('info'),
		/** Wizard route segment under /antrag/[wizard] when action = 'antrag'. */
		wizardSlug: varchar({ length: 64 }),
		/** Einer-für-Alle: operated by another Land/Kommune. */
		efaProvider: text(),
		efaUrl: text()
	},
	(t) => [index('services_office_idx').on(t.officeId)]
);

/* ───────────── Identität ───────────── */

export const users = pgTable('users', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	slug: varchar({ length: 32 }).notNull().unique(),
	role: roleEnum().notNull().default('citizen'),
	firstName: text().notNull(),
	lastName: text().notNull(),
	email: text().notNull(),
	steuerId: varchar({ length: 11 }),
	/** ISO date, YYYY-MM-DD. */
	birthDate: varchar({ length: 10 }),
	street: text(),
	postalCode: varchar({ length: 5 }),
	city: text(),
	/** Highest level this persona can authenticate with. */
	maxTrust: trustLevelEnum().notNull().default('basis'),
	/** Caseworkers belong to one Amt. */
	officeId: integer().references(() => offices.id),
	jobTitle: text()
});

export const sessions = pgTable('sessions', {
	/** Random opaque token stored in the `sid` cookie. */
	id: varchar({ length: 64 }).primaryKey(),
	userId: integer()
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	trustLevel: trustLevelEnum().notNull(),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	expiresAt: timestamp({ withTimezone: true }).notNull()
});

/* ───────────── Anträge ───────────── */

export const applications = pgTable(
	'applications',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		/** Aktenzeichen, e.g. MS-2026-004711. */
		reference: varchar({ length: 24 }).notNull().unique(),
		userId: integer()
			.notNull()
			.references(() => users.id),
		serviceId: integer()
			.notNull()
			.references(() => services.id),
		status: applicationStatusEnum().notNull().default('entwurf'),
		/** Wizard form data. */
		data: jsonb().$type<Record<string, unknown>>().notNull().default({}),
		/** Last wizard step reached (for drafts). */
		step: integer().notNull().default(0),
		assignedToId: integer().references(() => users.id),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		submittedAt: timestamp({ withTimezone: true }),
		decidedAt: timestamp({ withTimezone: true })
	},
	(t) => [
		index('applications_user_idx').on(t.userId),
		index('applications_status_idx').on(t.status)
	]
);

/** Audit trail of everything that happens to an application. */
export const applicationEvents = pgTable('application_events', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	applicationId: integer()
		.notNull()
		.references(() => applications.id, { onDelete: 'cascade' }),
	actorId: integer().references(() => users.id),
	/** 'erstellt' | 'eingereicht' | 'in_pruefung' | 'nachforderung' | 'nachgereicht' | 'bewilligt' | 'abgelehnt' | 'nachricht' */
	kind: varchar({ length: 32 }).notNull(),
	note: text(),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow()
});

/** Uploaded files are simulated: only metadata is stored. */
export const attachments = pgTable('attachments', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	applicationId: integer()
		.notNull()
		.references(() => applications.id, { onDelete: 'cascade' }),
	uploadedById: integer().references(() => users.id),
	/** Label of the requested proof, e.g. "Fahrzeugschein". */
	label: text().notNull(),
	filename: text().notNull(),
	sizeBytes: integer().notNull(),
	mimeType: text().notNull().default('application/pdf'),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow()
});

/* ───────────── Postkorb ───────────── */

export const messages = pgTable(
	'messages',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		userId: integer()
			.notNull()
			.references(() => users.id),
		applicationId: integer().references(() => applications.id, { onDelete: 'set null' }),
		kind: messageKindEnum().notNull(),
		subject: text().notNull(),
		body: text().notNull(),
		fromName: text().notNull(),
		/** Trust level needed to open. Lower-level sessions must step up. */
		requiredTrust: trustLevelEnum().notNull().default('basis'),
		/** Set when a message is a reply sent BY the citizen. */
		fromCitizen: boolean().notNull().default(false),
		readAt: timestamp({ withTimezone: true }),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow()
	},
	(t) => [index('messages_user_idx').on(t.userId)]
);

export const bescheide = pgTable('bescheide', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	applicationId: integer()
		.notNull()
		.references(() => applications.id, { onDelete: 'cascade' }),
	messageId: integer().references(() => messages.id, { onDelete: 'set null' }),
	decision: varchar({ length: 16 }).notNull(), // 'bewilligt' | 'abgelehnt'
	/** Aktenzeichen of the Bescheid, e.g. B-2026-004711. */
	number: varchar({ length: 24 }).notNull().unique(),
	bodyText: text().notNull(),
	rechtsbehelf: text().notNull(),
	/** Printed verification code, e.g. 7KQ2-M9XD-41LP. */
	verificationCode: varchar({ length: 16 }).notNull().unique(),
	issuedById: integer().references(() => users.id),
	issuedAt: timestamp({ withTimezone: true }).notNull().defaultNow()
});

/* ───────────── Termine ───────────── */

export const appointments = pgTable(
	'appointments',
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		/** Termin-Code shown to the citizen and encoded in the QR code, e.g. T-7KQ2M9. */
		code: varchar({ length: 16 }).notNull().unique(),
		userId: integer()
			.notNull()
			.references(() => users.id),
		serviceId: integer()
			.notNull()
			.references(() => services.id),
		locationId: integer()
			.notNull()
			.references(() => locations.id),
		startsAt: timestamp({ withTimezone: true }).notNull(),
		durationMin: integer().notNull().default(15),
		status: appointmentStatusEnum().notNull().default('gebucht'),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		/** Slot locking: only one active booking per location and start time. */
		uniqueIndex('appointments_active_slot_uq')
			.on(t.locationId, t.startsAt)
			.where(sql`${t.status} = 'gebucht'`),
		index('appointments_user_idx').on(t.userId)
	]
);

/* ───────────── Mängelmelder ───────────── */

export const defects = pgTable('defects', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	/** Public reference, e.g. M-2026-0042. */
	reference: varchar({ length: 24 }).notNull().unique(),
	category: defectCategoryEnum().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	address: text().notNull(),
	lat: doublePrecision().notNull(),
	lng: doublePrecision().notNull(),
	status: defectStatusEnum().notNull().default('gemeldet'),
	reporterId: integer().references(() => users.id),
	photoName: text(),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow()
});

export const defectUpdates = pgTable('defect_updates', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	defectId: integer()
		.notNull()
		.references(() => defects.id, { onDelete: 'cascade' }),
	status: defectStatusEnum().notNull(),
	note: text().notNull(),
	authorName: text().notNull(),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow()
});

/* ───────────── Types ───────────── */

export type Office = typeof offices.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Service = typeof services.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type ApplicationEvent = typeof applicationEvents.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Bescheid = typeof bescheide.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Defect = typeof defects.$inferSelect;
export type DefectUpdate = typeof defectUpdates.$inferSelect;
export type ApplicationStatus = Application['status'];
export type DefectStatus = Defect['status'];
export type DefectCategory = Defect['category'];
