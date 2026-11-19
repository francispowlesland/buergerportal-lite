<script lang="ts">
	import { enhance } from '$app/forms';
	import type { DefectRow, FormState } from './types.ts';
	import { DEFECT_TRANSITIONS } from './rules.ts';
	import { DEFECT_CATEGORY, DEFECT_STATUS } from '#lib/labels.ts';
	import { ageText } from './helpers.ts';
	import { formatDateTime } from '#lib/format.ts';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';

	let { row, form }: { row: DefectRow; form: FormState } = $props();

	const uid = $props.id();

	const mine = $derived(form && form.action === `defect-${row.id}` ? form : null);
	const targets = $derived(DEFECT_TRANSITIONS[row.status]);
	const statusError = $derived(mine && !mine.ok ? mine.errors?.status : undefined);
	const noteError = $derived(mine && !mine.ok ? mine.errors?.note : undefined);
	const generalError = $derived(mine && !mine.ok && !mine.errors ? mine.message : undefined);
</script>

<tr class="border-b border-rule align-top">
	<th scope="row" class="px-3 py-3 font-normal">
		<span class="aktenzeichen">{row.reference}</span>
		<span class="block text-sm text-ink-soft">vor {ageText(row.ageDays)}</span>
	</th>
	<td class="px-3 py-3">
		<p class="font-bold">{row.title}</p>
		<p class="text-sm text-ink-soft">{DEFECT_CATEGORY[row.category]}, {row.address}</p>
		{#if row.lastUpdateNote}
			<p class="mt-1 text-sm">
				Letzter Eintrag{row.lastUpdateAt ? ` (${formatDateTime(row.lastUpdateAt)})` : ''}: {row.lastUpdateNote}
			</p>
		{/if}
	</td>
	<td class="px-3 py-3"><StatusStempel status={row.status} kind="defect" /></td>
	<td class="px-3 py-3">
		<form method="POST" action="?/status" use:enhance class="grid gap-2">
			<input type="hidden" name="id" value={row.id} />
			<div>
				<label class="field-label" for="{uid}-status">Neuer Status</label>
				<select
					id="{uid}-status"
					name="status"
					required
					aria-invalid={statusError ? 'true' : undefined}
					aria-describedby={statusError ? `${uid}-status-err` : undefined}
				>
					<option value="">Bitte wählen</option>
					{#each targets as target (target)}
						<option value={target}>{DEFECT_STATUS[target].label}</option>
					{/each}
				</select>
				{#if statusError}
					<p class="field-error" id="{uid}-status-err" role="alert">{statusError}</p>
				{/if}
			</div>
			<div>
				<label class="field-label" for="{uid}-note">Öffentliche Notiz (optional)</label>
				<textarea
					id="{uid}-note"
					name="note"
					rows="2"
					maxlength="500"
					value={mine && !mine.ok ? (mine.values?.note ?? '') : ''}
					aria-invalid={noteError ? 'true' : undefined}
					aria-describedby={noteError ? `${uid}-note-err` : undefined}></textarea>
				{#if noteError}
					<p class="field-error" id="{uid}-note-err" role="alert">{noteError}</p>
				{/if}
			</div>
			{#if generalError}<p class="field-error" role="alert">{generalError}</p>{/if}
			{#if mine?.ok}<p class="font-bold text-status-800" role="status">{mine.message}</p>{/if}
			<div><button class="btn btn-sm">Status speichern</button></div>
		</form>
	</td>
</tr>
