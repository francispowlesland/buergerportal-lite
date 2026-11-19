import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { requireCaseworker } from '#lib/server/auth/guards.ts';
import { db, defects, defectUpdates, offices } from '#lib/server/db/index.ts';
import type { DefectStatus } from '#lib/server/db/schema.ts';
import { DEFECT_STATUS } from '#lib/labels.ts';
import { canMoveDefect, checkText, DEFECT_STATUSES, parseId } from '#lib/components/admin/rules.ts';
import type { FormState } from '#lib/components/admin/types.ts';
import { countDefects, loadDefects } from '../data.server.ts';

const OPEN_STATUSES: DefectStatus[] = ['gemeldet', 'in_bearbeitung'];
const FILTERS: Record<string, DefectStatus[]> = {
	offen: ['gemeldet', 'in_bearbeitung'],
	gemeldet: ['gemeldet'],
	in_bearbeitung: ['in_bearbeitung'],
	behoben: ['behoben']
};

export const load: PageServerLoad = async ({ url, locals }) => {
	requireCaseworker({ locals, url });
	const requested = url.searchParams.get('status') ?? 'offen';
	const status = Object.hasOwn(FILTERS, requested) ? requested : 'offen';
	const [rows, counts] = await Promise.all([
		loadDefects(FILTERS[status] ?? OPEN_STATUSES, {
			limit: 200,
			oldestFirst: status !== 'behoben'
		}),
		countDefects()
	]);
	return { rows, counts, status };
};

export const actions: Actions = {
	/** Moves a defect to a new status and appends a public update entry. */
	status: async ({ request, locals, url }) => {
		const { user } = requireCaseworker({ locals, url });
		const form = await request.formData();

		const id = parseId(form.get('id'));
		if (!id) error(400, 'Ungültige Mängelmeldung.');
		const rawTo = form.get('status');
		const to = DEFECT_STATUSES.find((s) => s === rawTo);
		const values = {
			note: typeof form.get('note') === 'string' ? (form.get('note') as string) : ''
		};
		const failure = (status: number, message: string, errors?: Record<string, string>) =>
			fail(status, {
				ok: false,
				action: `defect-${id}`,
				message,
				errors,
				values
			} satisfies FormState);

		if (!to)
			return failure(400, 'Bitte wählen Sie einen neuen Status.', {
				status: 'Bitte wählen Sie einen neuen Status.'
			});

		const note = checkText(form.get('note'), { label: 'Die Notiz', max: 500 });
		if (note.error) return failure(400, note.error, { note: note.error });

		const [office] = user.officeId
			? await db
					.select({ name: offices.name })
					.from(offices)
					.where(eq(offices.id, user.officeId))
					.limit(1)
			: [];
		const authorName = office?.name ?? 'Stadtverwaltung Musterstadt';

		const result = await db.transaction(async (tx) => {
			const [current] = await tx
				.select({ status: defects.status, reference: defects.reference })
				.from(defects)
				.where(eq(defects.id, id))
				.for('update');
			if (!current) return { kind: 'missing' as const };
			if (!canMoveDefect(current.status, to))
				return { kind: 'invalid' as const, from: current.status };

			await tx
				.update(defects)
				.set({ status: to })
				.where(and(eq(defects.id, id), eq(defects.status, current.status)));
			await tx.insert(defectUpdates).values({
				defectId: id,
				status: to,
				note: note.value || `Status geändert auf „${DEFECT_STATUS[to].label}“.`,
				authorName
			});
			return { kind: 'ok' as const, reference: current.reference };
		});

		if (result.kind === 'missing') error(404, 'Die Mängelmeldung wurde nicht gefunden.');
		if (result.kind === 'invalid') {
			return failure(
				409,
				`Der Status „${DEFECT_STATUS[result.from].label}“ kann nicht auf „${DEFECT_STATUS[to].label}“ gesetzt werden. Laden Sie die Seite neu.`
			);
		}
		return {
			ok: true,
			action: `defect-${id}`,
			message: `${result.reference}: Status ist jetzt „${DEFECT_STATUS[to].label}“.`
		} satisfies FormState;
	}
};
