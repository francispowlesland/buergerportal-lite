<script lang="ts">
	import { enhance, deserialize, applyAction } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import type {
		MeldebescheinigungData,
		AnwohnerparkausweisData,
		BriefwahlData
	} from '#lib/applicationData.ts';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Stepper from '#lib/components/ui/Stepper.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import MeldebescheinigungForm from '#lib/components/forms/MeldebescheinigungForm.svelte';
	import AnwohnerparkausweisForm from '#lib/components/forms/AnwohnerparkausweisForm.svelte';
	import BriefwahlForm from '#lib/components/forms/BriefwahlForm.svelte';

	let { data, form }: PageProps = $props();
	let currentStep = $derived(form?.step ?? data.currentStep);
	let formData = $derived.by(() => {
		const values = $state({ ...data.application.data, ...form?.data });
		return values;
	});
	let fieldErrors = $derived(form?.errors ?? {});
	let atts = $derived(form?.attachments ?? data.attachments);
	let isSubmitting = $state(false);
	let attachmentError = $state('');
	let isLastStep = $derived(currentStep === data.wizard.steps.length - 1);

	function jumpToStep(step: number) {
		currentStep = step;
	}

	async function attachmentAction(action: string, fields: Record<string, string>) {
		attachmentError = '';
		isSubmitting = true;
		const body = new FormData();
		for (const [key, value] of Object.entries(fields)) body.set(key, value);
		body.set('currentStep', String(currentStep));
		body.set('dataPayload', JSON.stringify(formData));
		try {
			const response = await fetch(`?/${action}`, {
				method: 'POST',
				body,
				headers: { accept: 'application/json', 'x-sveltekit-action': 'true' }
			});
			await applyAction(deserialize(await response.text()));
		} catch {
			attachmentError =
				'Der Nachweis konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head><title>{data.wizard.title} – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title={data.wizard.title}
	lead={data.wizard.lead}
	crumbs={[
		{ label: 'Startseite', href: '/' },
		{ label: 'Anträge', href: '/antrag' },
		{ label: data.wizard.title }
	]}
>
	{#snippet actions()}
		<div class="flex flex-wrap items-center gap-2">
			<span class="aktenzeichen text-sm font-bold">{data.application.reference}</span>
			<Stempel tone="neutral">Entwurf</Stempel>
		</div>
	{/snippet}
</PageHeader>

<div class="space-y-6">
	<div class="panel-quiet p-4">
		<Stepper steps={data.wizard.steps.map((step) => step.title)} current={currentStep} />
	</div>
	{#if data.briefwahlDuplicateError}
		<Alert tone="bad" title="Mehrfacher Antrag nicht möglich">
			<p>{data.briefwahlDuplicateError}</p>
		</Alert>
	{/if}
	{#if form?.draftSaved}
		<Alert tone="ok" title="Entwurf gespeichert">
			<p>Sie können Ihren Antrag später in der Antragsübersicht fortsetzen.</p>
		</Alert>
	{/if}
	{#if form?.registrationChecked}
		<Alert tone="ok" title="Simulierte Zulassungsprüfung erfolgreich">
			<p>
				Der Zulassungsnachweis für Ihr Kennzeichen wurde gespeichert. Es wurde kein externes
				Register abgefragt.
			</p>
		</Alert>
	{/if}
	{#if fieldErrors._form || attachmentError}
		<Alert tone="bad" title="Bitte prüfen Sie Ihren Antrag">
			<p>{fieldErrors._form || attachmentError}</p>
		</Alert>
	{/if}
	<form
		class="panel p-4 sm:p-6"
		method="POST"
		action={isLastStep ? '?/submit' : '?/saveStep'}
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				try {
					await update({ reset: false });
				} finally {
					isSubmitting = false;
				}
			};
		}}
	>
		<input type="hidden" name="currentStep" value={currentStep} />
		<input type="hidden" name="nativeFields" value="1" />
		<input type="hidden" name="dataPayload" value={JSON.stringify(formData)} />
		<h2 class="mb-6 border-b border-rule pb-3 text-xl font-bold">
			Schritt {currentStep + 1}: {data.wizard.steps[currentStep].title}
		</h2>
		<fieldset disabled={isSubmitting} class="min-w-0">
			<legend class="visually-hidden">Angaben für {data.wizard.steps[currentStep].title}</legend>
			{#if data.wizardSlug === 'meldebescheinigung'}
				<MeldebescheinigungForm
					step={currentStep}
					bind:data={formData as MeldebescheinigungData}
					errors={fieldErrors}
					user={data.user}
					trust={data.trust}
					feeCents={data.service.feeCents}
					onJumpStep={jumpToStep}
				/>
			{:else if data.wizardSlug === 'anwohnerparkausweis'}
				<AnwohnerparkausweisForm
					step={currentStep}
					bind:data={formData as AnwohnerparkausweisData}
					errors={fieldErrors}
					user={data.user}
					trust={data.trust}
					feeCents={data.service.feeCents}
					attachments={atts}
					parkingZones={data.parkingZones}
					eligibleZone={data.eligibleZone}
					onJumpStep={jumpToStep}
					onUploadAttachment={(meta: { filename: string; sizeBytes: number; mimeType: string }) =>
						attachmentAction('uploadAttachment', {
							filename: meta.filename,
							sizeBytes: String(meta.sizeBytes),
							mimeType: meta.mimeType
						})}
					onDeleteAttachment={(id) =>
						attachmentAction('deleteAttachment', { attachmentId: String(id) })}
				/>
			{:else}
				<BriefwahlForm
					step={currentStep}
					bind:data={formData as BriefwahlData}
					errors={fieldErrors}
					user={data.user}
					trust={data.trust}
					wahlbezirke={data.wahlbezirke}
					onJumpStep={jumpToStep}
				/>
			{/if}
			<div class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-6">
				{#if currentStep > 0}
					<button
						type="submit"
						class="btn"
						formaction="?/saveStep"
						name="targetStep"
						value={currentStep - 1}
					>
						Vorheriger Schritt
					</button>
				{:else}<a href={resolve('/antrag')} class="btn btn-ghost">Zur Antragsübersicht</a>{/if}
				<button type="submit" class="btn btn-ghost" formaction="?/saveDraft">
					Entwurf speichern
				</button>
				<button
					type="submit"
					class="btn btn-primary"
					name="targetStep"
					value={currentStep + 1}
					disabled={Boolean(data.briefwahlDuplicateError)}
				>
					{isSubmitting
						? 'Wird gespeichert …'
						: isLastStep
							? data.wizardSlug === 'briefwahl'
								? 'Wahlschein beantragen'
								: 'Antrag verbindlich absenden'
							: `Zu Schritt ${currentStep + 2}: ${data.wizard.steps[currentStep + 1].title}`}
				</button>
			</div>
		</fieldset>
	</form>
</div>
