<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { page } from '$app/state';
	import { onDestroy, tick } from 'svelte';

	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import TrustBadge from '#lib/components/ui/TrustBadge.svelte';
	import { formatDateTime } from '#lib/format.ts';
	import { TRUST_LABELS, TRUST_METHODS } from '#lib/trust.ts';

	let { data, form }: PageProps = $props();

	type Transfer = {
		provider: string;
		url: string;
		at: string;
		fields: { label: string; value: string }[];
	};

	const service = $derived(data.service);
	const provider = $derived(service.efaProvider);
	const loginHref = $derived(
		`/auth/login?${new URLSearchParams({ min: service.requiredTrust, redirectTo: page.url.pathname })}` as const
	);

	/* The handoff is simulated: consent → progress screen → provider landing view. */
	let transfer = $state.raw<Transfer | null>(null);
	let progressing = $state(false);
	let heading: HTMLElement | undefined = $state();
	let timer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(timer));

	// Without JavaScript the action result arrives as `form` and goes straight to the landing view.
	const transferred = $derived(
		transfer ?? (form && 'transferred' in form ? (form.transferred as Transfer) : null)
	);
	const view = $derived(transferred ? (progressing ? 'progress' : 'landing') : 'consent');
	const consentError = $derived(form && 'consentError' in form ? form.consentError : null);

	async function showView(next: 'progress' | 'landing') {
		progressing = next === 'progress';
		await tick();
		heading?.focus();
	}

	const submit: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success' && result.data?.transferred) {
				transfer = result.data.transferred as Transfer;
				await showView('progress');
				timer = setTimeout(() => void showView('landing'), 2600);
			} else {
				await update({ reset: false });
			}
		};
	};
</script>

<svelte:head>
	<title>Weiterleitung: {service.name} – Bürgerportal Musterstadt</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<PageHeader
		title={service.name}
		lead="Einer für Alle: Diesen Online-Dienst betreibt ein anderes Land oder eine andere Kommune für ganz Deutschland."
		crumbs={[
			{ label: 'Start', href: '/' },
			{ label: 'Behördenwegweiser', href: '/dienste' },
			{ label: service.name, href: `/dienste/${service.slug}` },
			{ label: 'Weiterleitung' }
		]}
	/>

	{#if view === 'consent'}
		<div class="mb-6">
			<Alert tone="info" title="Demonstration ohne Datenübermittlung">
				Die Weiterleitung wird nur simuliert. Es werden keine Daten an Dritte gesendet.
			</Alert>
		</div>
		<section class="mb-8" aria-labelledby="wer-h">
			<h2 id="wer-h" class="mb-3" tabindex="-1" bind:this={heading}>Wer betreibt diesen Dienst?</h2>
			<div class="grid max-w-prose gap-3 text-lg">
				<p>
					Den Online-Dienst für „{service.name}“ betreibt nicht Musterstadt, sondern
					<strong>{provider}</strong>. Dieses Prinzip heißt „Einer für Alle“ (EfA): Ein Land
					entwickelt den Dienst, viele Kommunen nutzen ihn.
				</p>
				<p>
					Wenn Sie weitergehen, wechseln Sie auf die Seite dieses Anbieters. Zuständig für Ihren
					Fall bleibt das {service.officeName}.
				</p>
			</div>
		</section>

		<section class="panel mb-8" aria-labelledby="daten-h">
			<div class="panel-head">
				<h2 id="daten-h" class="!text-base !font-bold">Diese Daten würden übermittelt</h2>
				{#if data.trust}<TrustBadge level={data.trust} prefix="Ihr Niveau:" />{/if}
			</div>

			{#if data.persona}
				<p class="border-b border-rule px-4 py-3">
					Sie sind als <strong>{data.persona}</strong> angemeldet. Welche Angaben {provider} erhält, hängt
					von Ihrem Vertrauensniveau ab.
				</p>
				<dl class="divide-y divide-rule">
					{#each data.fields as field (field.key)}
						<div class="grid gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
							<dt class="font-bold">{field.label}</dt>
							<dd class="grid gap-1">
								{#if field.value}
									<span>{field.value}</span>
									<span><Stempel tone="info">Wird übermittelt</Stempel></span>
								{:else}
									<span class="text-ink-soft">{field.withheldHint}</span>
									<span><Stempel tone="neutral">Wird nicht übermittelt</Stempel></span>
								{/if}
							</dd>
						</div>
					{/each}
				</dl>
			{:else}
				<div class="px-4 py-3">
					<p class="max-w-prose">
						Je nach Vertrauensniveau übermitteln wir an {provider}: bei <strong>Basis</strong>
						Ihren Namen, bei <strong>Substanziell</strong> zusätzlich Ihre Anschrift, bei
						<strong>Hoch</strong> zusätzlich Ihr Geburtsdatum.
					</p>
				</div>
			{/if}
		</section>

		{#if !data.persona}
			<Alert tone="warn" title="Bitte melden Sie sich zuerst an">
				Ohne Anmeldung können wir keine Daten übergeben. Dieser Dienst verlangt mindestens das
				Vertrauensniveau <strong>{TRUST_LABELS[service.requiredTrust]}</strong>.
				{#snippet actions()}
					<a href={resolve(loginHref)} class="btn btn-primary">Mit BundID anmelden</a>
					<a href={resolve('/dienste/[slug]', { slug: service.slug })} class="btn">
						Zurück zur Leistung
					</a>
				{/snippet}
			</Alert>
		{:else if data.stepUpNeeded}
			<Alert tone="warn" title="Höheres Vertrauensniveau erforderlich">
				Dieser Dienst verlangt das Vertrauensniveau <strong>
					{TRUST_LABELS[service.requiredTrust]}
				</strong>. Sie bestätigen Ihre Identität einmalig mit: {TRUST_METHODS[
					service.requiredTrust
				]}.
				{#snippet actions()}
					<a href={resolve(loginHref)} class="btn btn-primary">Vertrauensniveau erhöhen</a>
					<a href={resolve('/dienste/[slug]', { slug: service.slug })} class="btn">
						Zurück zur Leistung
					</a>
				{/snippet}
			</Alert>
		{:else}
			<form method="POST" use:enhance={submit} class="panel" aria-labelledby="zustimmung-h">
				<div class="panel-head">
					<h2 id="zustimmung-h" class="!text-base !font-bold">Ihre Zustimmung</h2>
				</div>
				<div class="grid gap-4 p-4">
					<div>
						<div class="flex items-start gap-3">
							<input
								id="consent"
								name="consent"
								type="checkbox"
								class="mt-3 shrink-0"
								aria-required="true"
								aria-invalid={consentError ? 'true' : undefined}
								aria-describedby={consentError ? 'consent-error' : undefined}
							/>
							<label for="consent" class="flex min-h-11 items-center py-1">
								Ich bin einverstanden, dass die oben genannten Daten an {provider} übermittelt werden.
							</label>
						</div>
						{#if consentError}
							<p id="consent-error" class="field-error" role="alert">{consentError}</p>
						{/if}
					</div>
					<div class="flex flex-wrap gap-3">
						<button type="submit" class="btn btn-primary">Weiter zu {provider}</button>
						<a href={resolve('/dienste/[slug]', { slug: service.slug })} class="btn">Abbrechen</a>
					</div>
				</div>
			</form>
		{/if}
	{:else if view === 'progress'}
		<section class="panel p-8" aria-labelledby="progress-h" role="status">
			<h2 id="progress-h" class="mb-3" tabindex="-1" bind:this={heading}>
				Sie werden weitergeleitet …
			</h2>
			<p class="mb-4 max-w-prose text-lg">
				Wir übergeben Ihre Angaben an {provider}. Bitte lassen Sie dieses Fenster geöffnet.
			</p>
			<progress class="h-3 w-full max-w-md accent-amt-700" aria-label="Weiterleitung läuft"
			></progress>
		</section>
	{:else if transferred}
		<section aria-labelledby="landing-h">
			<div class="mb-4">
				<Alert tone="info" title="Simulierte Weiterleitung">
					Dies ist eine Demonstration. Sie haben das Bürgerportal nicht verlassen und es wurden
					keine Daten an Dritte gesendet. So sähe der Anfang beim Anbieter aus.
				</Alert>
			</div>

			<div class="panel">
				<div class="panel-head">
					<span>{transferred.provider}</span>
					<Stempel tone="warn">Simulation</Stempel>
				</div>
				<div class="grid gap-4 p-5">
					<p class="text-sm break-all text-ink-soft">
						Adresse beim Anbieter: <code class="text-ink">{transferred.url}</code>
					</p>
					<h2 id="landing-h" tabindex="-1" bind:this={heading}>
						Willkommen beim Online-Dienst „{service.name}“
					</h2>
					<p class="max-w-prose">
						Musterstadt hat Ihnen am {formatDateTime(transferred.at)} diese Angaben übergeben:
					</p>
					<dl class="divide-y divide-rule border-y border-rule">
						{#each transferred.fields as field (field.label)}
							<div class="grid gap-x-4 py-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
								<dt class="font-bold">{field.label}</dt>
								<dd>{field.value}</dd>
							</div>
						{/each}
					</dl>
					<p class="max-w-prose text-ink-soft">
						An dieser Stelle würden Sie den Antrag beim Anbieter ausfüllen. Die Demonstration endet
						hier.
					</p>
				</div>
			</div>

			<div class="mt-6 flex flex-wrap gap-3">
				<a href={resolve('/dienste/[slug]', { slug: service.slug })} class="btn btn-primary">
					Zurück zum Portal
				</a>
				<a href={resolve('/dienste')} class="btn">Zum Behördenwegweiser</a>
			</div>
		</section>
	{/if}
</div>
