<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ApplicationStatus } from '#lib/server/db/schema.ts';
	import type { FormState } from './types.ts';
	import { canMoveApplication, TEXT_MAX, TEXT_MIN } from './rules.ts';
	import Alert from '#lib/components/ui/Alert.svelte';

	let {
		status,
		canDecide,
		officeName,
		form
	}: {
		status: ApplicationStatus;
		canDecide: boolean;
		officeName: string;
		form: FormState;
	} = $props();

	const uid = $props.id();

	const closed = $derived(status === 'bewilligt' || status === 'abgelehnt');
	const can = $derived({
		uebernehmen: canMoveApplication(status, 'in_pruefung'),
		nachforderung: canMoveApplication(status, 'nachforderung'),
		bewilligen: canMoveApplication(status, 'bewilligt'),
		ablehnen: canMoveApplication(status, 'abgelehnt')
	});

	const error = (action: string, field: string) =>
		form && !form.ok && form.action === action ? form.errors?.[field] : undefined;
	const value = (action: string, field: string) =>
		form && !form.ok && form.action === action ? (form.values?.[field] ?? '') : '';
	const generalError = (action: string) =>
		form && !form.ok && form.action === action && !form.errors ? form.message : undefined;
</script>

<div class="grid gap-6">
	{#if form?.ok}
		<Alert tone="ok" title="Gespeichert">{form.message}</Alert>
	{/if}

	{#if !canDecide}
		<Alert tone="warn" title="Nur Lesezugriff">
			Dieser Antrag gehört zum {officeName}. Sie können ihn einsehen, aber nicht entscheiden.
		</Alert>
	{:else if closed}
		<Alert tone="info" title="Der Antrag ist entschieden">
			Eine weitere Bearbeitung ist nicht möglich. Der Bescheid liegt im Postkorb der Antragstellerin
			oder des Antragstellers.
		</Alert>
	{:else}
		{#if can.uebernehmen && status !== 'in_pruefung'}
			<section class="panel" aria-labelledby="{uid}-uebernehmen-h">
				<h2 class="panel-head" id="{uid}-uebernehmen-h">Bearbeitung beginnen</h2>
				<form method="POST" action="?/uebernehmen" use:enhance class="grid gap-3 p-4">
					<p>
						{status === 'nachforderung'
							? 'Setzen Sie den Antrag wieder in Prüfung, sobald die Nachweise vorliegen.'
							: 'Der Antrag wird Ihnen zugewiesen und in Prüfung gesetzt.'}
					</p>
					{#if generalError('uebernehmen')}
						<p class="field-error" role="alert">{generalError('uebernehmen')}</p>
					{/if}
					<div><button class="btn btn-primary">Antrag in Prüfung nehmen</button></div>
				</form>
			</section>
		{/if}

		<section class="panel" aria-labelledby="{uid}-nachforderung-h">
			<h2 class="panel-head" id="{uid}-nachforderung-h">Nachweise nachfordern</h2>
			<form method="POST" action="?/nachforderung" use:enhance class="grid gap-3 p-4">
				<div>
					<label class="field-label" for="{uid}-nachricht">Nachricht an den Postkorb</label>
					<span class="field-hint" id="{uid}-nachricht-hint">
						Benennen Sie die fehlenden Unterlagen. Mindestens {TEXT_MIN} Zeichen.
					</span>
					<textarea
						id="{uid}-nachricht"
						name="nachricht"
						rows="4"
						maxlength={TEXT_MAX}
						required
						disabled={!can.nachforderung}
						value={value('nachforderung', 'nachricht')}
						aria-invalid={error('nachforderung', 'nachricht') ? 'true' : undefined}
						aria-describedby="{uid}-nachricht-hint{error('nachforderung', 'nachricht')
							? ` ${uid}-nachricht-err`
							: ''}"></textarea>
					{#if error('nachforderung', 'nachricht')}
						<p class="field-error" id="{uid}-nachricht-err" role="alert">
							{error('nachforderung', 'nachricht')}
						</p>
					{/if}
					{#if generalError('nachforderung')}
						<p class="field-error" role="alert">{generalError('nachforderung')}</p>
					{/if}
				</div>
				<div>
					<button class="btn" disabled={!can.nachforderung}>Nachforderung senden</button>
				</div>
			</form>
		</section>

		<section class="panel" aria-labelledby="{uid}-bewilligen-h">
			<h2 class="panel-head" id="{uid}-bewilligen-h">Bewilligen und Bescheid erteilen</h2>
			<form method="POST" action="?/bewilligen" use:enhance class="grid gap-3 p-4">
				<div>
					<label class="field-label" for="{uid}-hinweis">Hinweis im Bescheid (optional)</label>
					<span class="field-hint" id="{uid}-hinweis-hint">
						Der Text erscheint im Bescheid. Der Bescheid ist im Postkorb erst mit Vertrauensniveau
						Hoch lesbar.
					</span>
					<textarea
						id="{uid}-hinweis"
						name="hinweis"
						rows="3"
						maxlength="1000"
						disabled={!can.bewilligen}
						value={value('bewilligen', 'hinweis')}
						aria-invalid={error('bewilligen', 'hinweis') ? 'true' : undefined}
						aria-describedby="{uid}-hinweis-hint{error('bewilligen', 'hinweis')
							? ` ${uid}-hinweis-err`
							: ''}"></textarea>
					{#if error('bewilligen', 'hinweis')}
						<p class="field-error" id="{uid}-hinweis-err" role="alert">
							{error('bewilligen', 'hinweis')}
						</p>
					{/if}
					{#if generalError('bewilligen')}
						<p class="field-error" role="alert">{generalError('bewilligen')}</p>
					{/if}
				</div>
				<div>
					<button class="btn btn-primary" disabled={!can.bewilligen}>
						Antrag bewilligen und Bescheid erteilen
					</button>
				</div>
			</form>
		</section>

		<section class="panel" aria-labelledby="{uid}-ablehnen-h">
			<h2 class="panel-head" id="{uid}-ablehnen-h">Ablehnen</h2>
			<form method="POST" action="?/ablehnen" use:enhance class="grid gap-3 p-4">
				<div>
					<label class="field-label" for="{uid}-begruendung">Begründung (Pflichtfeld)</label>
					<span class="field-hint" id="{uid}-begruendung-hint">
						Die Begründung wird wörtlich in den Bescheid übernommen. Mindestens {TEXT_MIN} Zeichen.
					</span>
					<textarea
						id="{uid}-begruendung"
						name="begruendung"
						rows="4"
						maxlength={TEXT_MAX}
						required
						disabled={!can.ablehnen}
						value={value('ablehnen', 'begruendung')}
						aria-invalid={error('ablehnen', 'begruendung') ? 'true' : undefined}
						aria-describedby="{uid}-begruendung-hint{error('ablehnen', 'begruendung')
							? ` ${uid}-begruendung-err`
							: ''}"></textarea>
					{#if error('ablehnen', 'begruendung')}
						<p class="field-error" id="{uid}-begruendung-err" role="alert">
							{error('ablehnen', 'begruendung')}
						</p>
					{/if}
					{#if generalError('ablehnen')}
						<p class="field-error" role="alert">{generalError('ablehnen')}</p>
					{/if}
				</div>
				<div>
					<button class="btn btn-danger" disabled={!can.ablehnen}>
						Antrag ablehnen und Bescheid erteilen
					</button>
				</div>
			</form>
		</section>
	{/if}
</div>
