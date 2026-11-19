import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, desc, eq, ne } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import {
	applications,
	attachments,
	bescheide,
	db,
	messages,
	offices,
	services
} from '#lib/server/db/index.ts';
import { addEvent, notify } from '#lib/server/domain.ts';
import { loadOwnedMessage, lockedSubject } from '../access.server.ts';
import { meetsTrust } from '#lib/trust.ts';
import {
	UPLOAD_LIMITS,
	formatBytes,
	requestedDocument,
	validateReply,
	type ReplyResult
} from '#lib/components/postkorb/types.ts';

export const load: PageServerLoad = async ({ locals, url, params }) => {
	const { user, trust, message, locked } = await loadOwnedMessage({ locals, url }, params.id);

	// Joined case data (null for messages without a case, e.g. Terminbestätigungen).
	const [row] = message.applicationId
		? await db
				.select({ app: applications, service: services, office: offices })
				.from(applications)
				.innerJoin(services, eq(services.id, applications.serviceId))
				.innerJoin(offices, eq(offices.id, services.officeId))
				.where(and(eq(applications.id, message.applicationId), eq(applications.userId, user.id)))
				.limit(1)
		: [];

	const reference = row?.app.reference ?? null;

	// Locked: metadata only. Neither body nor Bescheid nor the real subject leave the server.
	if (locked) {
		return {
			locked: true as const,
			trust,
			maxTrust: user.maxTrust,
			head: {
				id: message.id,
				kind: message.kind,
				subject: lockedSubject(message.kind, reference),
				fromName: message.fromName,
				requiredTrust: message.requiredTrust,
				createdAt: message.createdAt,
				reference
			}
		};
	}

	// Opening a message marks it read. Own sent messages are always "read".
	const wasUnread = message.readAt === null && !message.fromCitizen;
	if (wasUnread) {
		await db.update(messages).set({ readAt: new Date() }).where(eq(messages.id, message.id));
	}

	const [bescheid] =
		message.kind === 'bescheid' && row
			? await db
					.select()
					.from(bescheide)
					.where(and(eq(bescheide.messageId, message.id), eq(bescheide.applicationId, row.app.id)))
					.limit(1)
			: [];

	const related = row
		? await db
				.select({
					id: messages.id,
					kind: messages.kind,
					subject: messages.subject,
					requiredTrust: messages.requiredTrust,
					fromCitizen: messages.fromCitizen,
					createdAt: messages.createdAt
				})
				.from(messages)
				.where(
					and(
						eq(messages.userId, user.id),
						eq(messages.applicationId, row.app.id),
						ne(messages.id, message.id)
					)
				)
				.orderBy(desc(messages.createdAt), desc(messages.id))
		: [];

	// shortcut: files have no trust column; use the strongest thread gate until per-file trust exists.
	const canReadCaseDetails =
		row &&
		meetsTrust(trust, row.service.requiredTrust) &&
		related.every((m) => meetsTrust(trust, m.requiredTrust));
	const caseFiles = canReadCaseDetails
		? await db
				.select()
				.from(attachments)
				.where(eq(attachments.applicationId, row.app.id))
				.orderBy(asc(attachments.createdAt), asc(attachments.id))
		: [];

	const open = row
		? ['eingereicht', 'in_pruefung', 'nachforderung'].includes(row.app.status)
		: false;

	return {
		locked: false as const,
		message: {
			id: message.id,
			kind: message.kind,
			subject: message.subject,
			body: message.body,
			fromName: message.fromName,
			requiredTrust: message.requiredTrust,
			fromCitizen: message.fromCitizen,
			createdAt: message.createdAt,
			wasUnread
		},
		trust,
		case: row
			? {
					reference: row.app.reference,
					status: canReadCaseDetails ? row.app.status : null,
					serviceName: row.service.name,
					officeName: row.office.name
				}
			: null,
		files: caseFiles.map((a) => ({
			id: a.id,
			label: a.label,
			filename: a.filename,
			sizeBytes: a.sizeBytes,
			createdAt: a.createdAt
		})),
		related: related.slice(0, 8).map((m) => ({
			...m,
			locked: !meetsTrust(trust, m.requiredTrust),
			subject: meetsTrust(trust, m.requiredTrust) ? m.subject : lockedSubject(m.kind, reference)
		})),
		bescheid: bescheid
			? {
					number: bescheid.number,
					decision: bescheid.decision,
					bodyText: bescheid.bodyText,
					rechtsbehelf: bescheid.rechtsbehelf,
					verificationCode: bescheid.verificationCode,
					issuedAt: bescheid.issuedAt
				}
			: null,
		recipient: {
			name: `${user.firstName} ${user.lastName}`,
			street: user.street,
			postalCode: user.postalCode,
			city: user.city
		},
		canReply: !message.fromCitizen && open,
		replyBlockedReason: message.fromCitizen
			? 'Dies ist Ihre eigene Nachricht. Antworten Sie auf die letzte Nachricht der Behörde.'
			: !row
				? 'Zu dieser Nachricht gehört kein Antrag. Eine Antwort ist deshalb nicht möglich.'
				: open
					? null
					: 'Der Antrag ist abgeschlossen. Unterlagen können nicht mehr nachgereicht werden.',
		requestedDocument: message.kind === 'nachforderung' ? requestedDocument(message.subject) : null,
		limits: { maxFiles: UPLOAD_LIMITS.maxFiles, maxBytes: UPLOAD_LIMITS.maxBytes }
	};
};

function reply(result: Partial<ReplyResult> & Pick<ReplyResult, 'ok' | 'message'>): ReplyResult {
	return { errors: {}, text: '', dokumente: 0, ...result };
}

export const actions: Actions = {
	/** Marks the message as unread again and returns to the list. Locked messages are untouched. */
	ungelesen: async ({ locals, url, params }) => {
		const { message, locked } = await loadOwnedMessage({ locals, url }, params.id);
		if (locked) error(403, 'Für diese Nachricht ist ein höheres Vertrauensniveau erforderlich.');
		if (!message.fromCitizen) {
			await db.update(messages).set({ readAt: null }).where(eq(messages.id, message.id));
		}
		redirect(303, '/postkorb');
	},

	/** Citizen reply with optional supplemental documents, attached to the case of this message. */
	antworten: async ({ request, locals, url, params }) => {
		const { user, message, locked } = await loadOwnedMessage({ locals, url }, params.id);

		// Server-side trust gate: a low session level must not be able to write into a protected thread.
		if (locked) {
			return fail(403, {
				reply: reply({
					ok: false,
					message: 'Für diese Nachricht ist ein höheres Vertrauensniveau erforderlich.'
				})
			});
		}
		if (message.fromCitizen || !message.applicationId) {
			return fail(400, {
				reply: reply({ ok: false, message: 'Auf diese Nachricht ist keine Antwort möglich.' })
			});
		}

		// Ownership: the case must belong to the signed-in citizen.
		const [row] = await db
			.select({ app: applications, office: offices })
			.from(applications)
			.innerJoin(services, eq(services.id, applications.serviceId))
			.innerJoin(offices, eq(offices.id, services.officeId))
			.where(and(eq(applications.id, message.applicationId), eq(applications.userId, user.id)))
			.limit(1);
		if (!row) error(404, 'Der zugehörige Antrag wurde nicht gefunden.');
		if (!['eingereicht', 'in_pruefung', 'nachforderung'].includes(row.app.status)) {
			return fail(400, {
				reply: reply({
					ok: false,
					message: 'Der Antrag ist abgeschlossen. Unterlagen können nicht mehr nachgereicht werden.'
				})
			});
		}

		let form: FormData;
		try {
			form = await request.formData();
		} catch {
			return fail(400, {
				reply: reply({
					ok: false,
					message: 'Die Formulardaten sind ungültig. Bitte senden Sie Ihre Antwort erneut.'
				})
			});
		}
		const { text, valid, errors } = validateReply(form);
		if (errors.text || errors.dokumente) {
			return fail(400, {
				reply: reply({
					ok: false,
					message: 'Ihre Antwort wurde nicht gesendet. Bitte prüfen Sie Ihre Eingaben.',
					errors,
					text
				})
			});
		}

		const label = (message.kind === 'nachforderung' && requestedDocument(message.subject)) || null;
		const names = valid.map((f) => f.filename);
		const body = [text, valid.length ? `Anlagen:\n${names.map((n) => `– ${n}`).join('\n')}` : '']
			.filter(Boolean)
			.join('\n\n');

		const rejected = await db.transaction(async (tx) => {
			// Recheck under a row lock: a concurrent decision must not be overwritten by an upload.
			const [current] = await tx
				.select({ status: applications.status })
				.from(applications)
				.where(and(eq(applications.id, row.app.id), eq(applications.userId, user.id)))
				.for('update');
			if (!current) error(404, 'Der zugehörige Antrag wurde nicht gefunden.');
			if (!['eingereicht', 'in_pruefung', 'nachforderung'].includes(current.status)) {
				return fail(400, {
					reply: reply({
						ok: false,
						message:
							'Der Antrag ist abgeschlossen. Unterlagen können nicht mehr nachgereicht werden.',
						text
					})
				});
			}
			if (valid.length) {
				await tx.insert(attachments).values(
					valid.map((f) => ({
						applicationId: row.app.id,
						uploadedById: user.id,
						label: label ?? 'Ergänzender Nachweis',
						filename: f.filename,
						sizeBytes: f.sizeBytes,
						mimeType: f.mimeType
					}))
				);
			}

			// Replies and receipts inherit the source gate, including any quoted content or filenames.
			await tx.insert(messages).values({
				userId: user.id,
				applicationId: row.app.id,
				kind: 'nachricht',
				subject: valid.length
					? `Ihre Unterlagen zu Antrag ${row.app.reference}`
					: `Ihre Antwort zu Antrag ${row.app.reference}`,
				body,
				fromName: `${user.firstName} ${user.lastName}`,
				requiredTrust: message.requiredTrust,
				fromCitizen: true,
				readAt: new Date()
			});

			await addEvent(
				tx,
				row.app.id,
				valid.length ? 'nachgereicht' : 'nachricht',
				[text, valid.length ? `Dokumente: ${names.join(', ')}` : ''].filter(Boolean).join(' | '),
				user.id
			);

			if (valid.length) {
				// Documents delivered: the case goes back to the caseworker.
				if (current.status === 'nachforderung') {
					await tx
						.update(applications)
						.set({ status: 'in_pruefung', updatedAt: new Date() })
						.where(eq(applications.id, row.app.id));
				} else {
					await tx
						.update(applications)
						.set({ updatedAt: new Date() })
						.where(eq(applications.id, row.app.id));
				}
				await notify(tx, {
					userId: user.id,
					applicationId: row.app.id,
					kind: 'status',
					subject: `Ihre Unterlagen zu Antrag ${row.app.reference} sind eingegangen`,
					body: `Guten Tag,\n\nwir haben ${valid.length === 1 ? 'ein Dokument' : `${valid.length} Dokumente`} (${valid
						.map((f) => `${f.filename}, ${formatBytes(f.sizeBytes)}`)
						.join(
							'; '
						)}) zu Ihrem Antrag ${row.app.reference} erhalten. Die Sachbearbeitung prüft die Unterlagen und meldet sich bei Rückfragen.\n\nFreundliche Grüße\n${row.office.name}`,
					fromName: row.office.name,
					requiredTrust: message.requiredTrust
				});
			}
			return null;
		});
		if (rejected) return rejected;

		return {
			reply: reply({
				ok: true,
				message: valid.length
					? `Ihre Unterlagen wurden gesendet (${valid.length === 1 ? 'ein Dokument' : `${valid.length} Dokumente`}). Der Antrag ${row.app.reference} ist wieder in Prüfung.`
					: 'Ihre Nachricht wurde an die Behörde gesendet.',
				dokumente: valid.length
			})
		};
	}
};
