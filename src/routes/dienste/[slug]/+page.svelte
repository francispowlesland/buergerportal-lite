<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import TrustBadge from '#lib/components/ui/TrustBadge.svelte';
	import ServicePanel from '#lib/components/services/ServicePanel.svelte';
	import ServiceRow from '#lib/components/services/ServiceRow.svelte';
	import { feeText } from '#lib/components/services/search.ts';
	import { formatFee } from '#lib/format.ts';
	import { LEBENSLAGEN } from '#lib/labels.ts';
	import { TRUST_LABELS, TRUST_METHODS, meetsTrust } from '#lib/trust.ts';

	let { data }: PageProps = $props();

	const service = $derived(data.service);
	const office = $derived(service.office);
	const paragraphs = $derived(service.description.split(/\n{2,}/).filter(Boolean));

	/** What the primary button does, or null when the service is information only. */
	const primary = $derived.by(() => {
		if (service.action === 'antrag' && service.wizardSlug) {
			return {
				href: resolve('/antrag/[wizard]', { wizard: service.wizardSlug }),
				label: 'Antrag online starten'
			};
		}
		if (service.action === 'termin') {
			return { href: resolve(`/termine/buchen?dienst=${service.slug}`), label: 'Termin buchen' };
		}
		if (service.action === 'efa') {
			return {
				href: resolve('/dienste/[slug]/efa', { slug: service.slug }),
				label: 'Zum Online-Dienst'
			};
		}
		return null;
	});

	// Step-up hint: only for services that can be started online.
	const stepUp = $derived(primary !== null && !meetsTrust(data.trust, service.requiredTrust));
	const loginHref = $derived(
		`/auth/login?${new URLSearchParams({ min: service.requiredTrust, redirectTo: page.url.pathname })}` as const
	);

	const addressLine = (l: { street: string; postalCode: string; city: string }) =>
		`${l.street}, ${l.postalCode} ${l.city}`;
</script>

<svelte:head>
	<title>{service.name} – Behördenwegweiser – Bürgerportal Musterstadt</title>
</svelte:head>

<PageHeader
	title={service.name}
	lead={service.summary}
	crumbs={[
		{ label: 'Start', href: '/' },
		{ label: 'Behördenwegweiser', href: '/dienste' },
		{ label: service.name }
	]}
>
	{#snippet actions()}
		<Stempel tone="info">{office.name}</Stempel>
		{#if service.action === 'efa'}
			<Stempel tone="neutral">
				EfA<span class="visually-hidden">
					(Einer für Alle: wird von einem anderen Land betrieben)
				</span>
			</Stempel>
		{/if}
	{/snippet}
</PageHeader>

<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
	<!-- Auf einen Blick: first in reading order so the action is never buried. -->
	<aside aria-labelledby="blick-h" class="grid gap-4 lg:col-start-2 lg:row-start-1">
		<section class="panel">
			<div class="panel-head">
				<h2 id="blick-h" class="!text-base !font-bold">Auf einen Blick</h2>
			</div>
			<dl class="divide-y divide-rule">
				<div class="px-4 py-3">
					<dt class="text-sm font-bold">Zuständig</dt>
					<dd>{office.name}</dd>
				</div>
				<div class="px-4 py-3">
					<dt class="text-sm font-bold">Gebühr</dt>
					<dd>{feeText(service.feeCents, service.feeNote)}</dd>
				</div>
				<div class="px-4 py-3">
					<dt class="text-sm font-bold">Bearbeitungsdauer</dt>
					<dd>{service.processingTime}</dd>
				</div>
				<div class="px-4 py-3">
					<dt class="mb-1 text-sm font-bold">Erforderliches Vertrauensniveau</dt>
					<dd><TrustBadge level={service.requiredTrust} /></dd>
				</div>
				{#if service.lebenslagen.length > 0}
					<div class="px-4 py-3">
						<dt class="text-sm font-bold">Lebenslagen</dt>
						<dd>
							<ul class="flex flex-wrap gap-x-3 gap-y-1">
								{#each service.lebenslagen as key (key)}
									<li>
										<a href={resolve(`/dienste?lebenslage=${key}`)}>{LEBENSLAGEN[key] ?? key}</a>
									</li>
								{/each}
							</ul>
						</dd>
					</div>
				{/if}
			</dl>

			<div class="grid gap-3 border-t border-ink p-4">
				{#if primary}
					<a href={primary.href} class="btn btn-primary">{primary.label}</a>
					{#if service.action === 'efa'}
						<p class="text-sm text-ink-soft">
							Diese Leistung betreibt {service.efaProvider ?? 'ein anderes Land'}. Sie sehen vorher,
							welche Daten übermittelt werden.
						</p>
					{/if}
				{:else}
					<p class="text-sm">
						<strong>Nur zur Information.</strong> Für diese Leistung gibt es keinen Online-Antrag.
					</p>
				{/if}
			</div>
		</section>

		{#if stepUp}
			<Alert
				tone="warn"
				title={data.trust ? 'Höheres Vertrauensniveau erforderlich' : 'Anmeldung erforderlich'}
			>
				{#if data.trust}
					Sie sind mit dem Vertrauensniveau <strong>{TRUST_LABELS[data.trust]}</strong> angemeldet.
					Für diese Leistung brauchen Sie <strong>{TRUST_LABELS[service.requiredTrust]}</strong>.
					Sie bestätigen Ihre Identität dann einmalig mit: {TRUST_METHODS[service.requiredTrust]}.
				{:else}
					Melden Sie sich mit BundID auf dem Vertrauensniveau
					<strong>{TRUST_LABELS[service.requiredTrust]}</strong> an: {TRUST_METHODS[
						service.requiredTrust
					]}.
				{/if}
				{#snippet actions()}
					<a href={resolve(loginHref)} class="btn btn-sm">
						{data.trust ? 'Vertrauensniveau erhöhen' : 'Mit BundID anmelden'}
					</a>
				{/snippet}
			</Alert>
		{/if}
	</aside>

	<div class="grid gap-8 lg:col-start-1 lg:row-start-1">
		<section aria-labelledby="worum-h">
			<h2 id="worum-h" class="mb-3">Worum es geht</h2>
			<div class="grid max-w-prose gap-3 text-lg">
				{#each paragraphs as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>
			{#if !primary}
				<div class="mt-4 max-w-prose">
					<Alert tone="info" title="So erledigen Sie diese Leistung">
						Diese Leistung können Sie nicht online beantragen. Wenden Sie sich an das
						{office.name}: Kontakt, Adresse und Öffnungszeiten finden Sie unter „Zuständige Stelle“.
					</Alert>
				</div>
			{/if}
		</section>

		<section aria-labelledby="details-h" class="grid gap-3">
			<h2 id="details-h">Einzelheiten zur Leistung</h2>

			<ServicePanel id="voraussetzungen" title="Voraussetzungen und Nachweise" open>
				{#if service.documents.length > 0}
					<p class="mb-2">Halten Sie diese Unterlagen bereit:</p>
					<ul class="list-disc space-y-1 pl-5">
						{#each service.documents as document (document)}
							<li>{document}</li>
						{/each}
					</ul>
				{:else}
					<p>Für diese Leistung brauchen Sie keine Nachweise.</p>
				{/if}
			</ServicePanel>

			<ServicePanel id="gebuehren" title="Gebühren">
				<p class="font-bold">{formatFee(service.feeCents)}</p>
				{#if service.feeNote}
					<p class="mt-1 max-w-prose">{service.feeNote}</p>
				{/if}
			</ServicePanel>

			<ServicePanel id="bearbeitungsdauer" title="Bearbeitungsdauer">
				<p>{service.processingTime}</p>
			</ServicePanel>

			<ServicePanel id="rechtsgrundlage" title="Rechtsgrundlage">
				<p>{service.legalBasis}</p>
			</ServicePanel>

			<ServicePanel id="zustaendige-stelle" title="Zuständige Stelle" open={!primary}>
				<h3 class="mb-1">{office.name}</h3>
				<p class="max-w-prose text-ink-soft">{office.shortDescription}</p>

				<dl class="mt-4 grid gap-3 sm:grid-cols-2">
					<div>
						<dt class="text-sm font-bold">Telefon</dt>
						<dd><a href={`tel:${office.phone.replace(/[^\d+]/g, '')}`}>{office.phone}</a></dd>
					</div>
					<div>
						<dt class="text-sm font-bold">E-Mail</dt>
						<dd><a href="mailto:{office.email}">{office.email}</a></dd>
					</div>
					<div class="sm:col-span-2">
						<dt class="text-sm font-bold">Öffnungszeiten</dt>
						<dd>{office.openingHours}</dd>
					</div>
				</dl>

				{#if service.locations.length > 0}
					<h3 class="mt-6 mb-2">
						{service.locations.length === 1 ? 'Standort' : 'Standorte'}
					</h3>
					<ul class="divide-y divide-rule border-y border-rule">
						{#each service.locations as location (location.id)}
							<li class="py-2">
								<p class="font-bold">{location.name}</p>
								<address class="not-italic">{addressLine(location)}</address>
							</li>
						{/each}
					</ul>
				{/if}
			</ServicePanel>
		</section>
	</div>
</div>

{#if data.related.length > 0}
	<section aria-labelledby="related-h" class="mt-12">
		<h2 id="related-h" class="mb-3">Ähnliche Leistungen</h2>
		<ul class="panel px-4">
			{#each data.related as related (related.id)}
				<ServiceRow service={related} />
			{/each}
		</ul>
	</section>
{/if}
