<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path configured; links are root-relative */
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import DefectMap from '#lib/components/map/DefectMap.svelte';
	import { DEFECT_CATEGORY } from '#lib/labels.ts';
	import { formatDateTime } from '#lib/format.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const defectPin = $derived([
		{
			id: data.defect.id,
			reference: data.defect.reference,
			title: data.defect.title,
			category: data.defect.category,
			status: data.defect.status,
			address: data.defect.address,
			lat: data.defect.lat,
			lng: data.defect.lng
		}
	]);
</script>

<svelte:head>
	<title>Meldung {data.defect.reference}: {data.defect.title} – Bürgerportal Musterstadt</title>
</svelte:head>

{#snippet headerActions()}
	<a href="/maengelmelder" class="btn btn-ghost"> ← Zurück zur Übersicht </a>
	<a href="/maengelmelder/melden" class="btn btn-primary"> Neuen Mangel melden </a>
{/snippet}

<PageHeader
	title="Meldung {data.defect.reference}"
	lead="Transparenter Bearbeitungsstand und Rückmeldungen der Stadtverwaltung Musterstadt."
	crumbs={[
		{ label: 'Startseite', href: '/' },
		{ label: 'Mängelmelder', href: '/maengelmelder' },
		{ label: data.defect.reference }
	]}
	actions={headerActions}
/>

<div class="mx-auto max-w-4xl space-y-8">
	{#if data.isNew}
		<Alert tone="ok" title="Meldung erfolgreich eingereicht!">
			Vielen Dank für Ihre Mithilfe! Ihre Mängelmeldung wurde unter dem Aktenzeichen
			<strong class="aktenzeichen">{data.defect.reference}</strong> registriert und zur Prüfung an den
			zuständigen Fachbereich weitergeleitet. Sie können diesen Link speichern, um den Status jederzeit
			abzufragen.
		</Alert>
	{/if}

	<!-- Overview Header Card -->
	<div class="panel space-y-6 p-6">
		<div class="flex flex-wrap items-start justify-between gap-4 border-b border-rule pb-4">
			<div>
				<div class="mb-2 flex flex-wrap items-center gap-2">
					<span class="aktenzeichen text-sm font-black">{data.defect.reference}</span>
					<StatusStempel status={data.defect.status} kind="defect" />
					<span class="rounded bg-paper px-2 py-0.5 text-xs font-bold text-ink">
						{DEFECT_CATEGORY[data.defect.category]}
					</span>
				</div>
				<h2 class="text-2xl font-bold text-ink">{data.defect.title}</h2>
			</div>

			<div class="text-right text-xs text-ink-soft">
				<p>Gemeldet am</p>
				<p class="text-sm font-bold text-ink">{formatDateTime(data.defect.createdAt)}</p>
			</div>
		</div>

		<!-- Details & Location Grid -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div class="space-y-4">
				<div>
					<h3 class="text-sm font-bold tracking-wider text-ink-soft uppercase">Beschreibung</h3>
					<p class="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-ink">
						{data.defect.description}
					</p>
				</div>

				<div>
					<h3 class="text-sm font-bold tracking-wider text-ink-soft uppercase">Ort & Adresse</h3>
					<p class="mt-1 text-sm font-bold text-ink">{data.defect.address}</p>
					<p class="text-xs text-ink-soft">
						Koordinaten: <span class="aktenzeichen">
							{data.defect.lat.toFixed(5)}, {data.defect.lng.toFixed(5)}
						</span>
					</p>
				</div>

				{#if data.defect.photoName}
					<div>
						<h3 class="text-sm font-bold tracking-wider text-ink-soft uppercase">
							Angehängtes Foto
						</h3>
						<div class="mt-2 flex items-center gap-3 border border-rule bg-sheet p-3">
							<div
								class="flex h-10 w-10 items-center justify-center border border-ink bg-amt-50 text-amt-700"
							>
								<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<div class="text-xs">
								<p class="font-bold text-ink">{data.defect.photoName}</p>
								<p class="text-ink-soft">Vom Bürger übermittelt</p>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Location Map View -->
			<div>
				<h3 class="mb-2 text-sm font-bold tracking-wider text-ink-soft uppercase">Lageplan</h3>
				<DefectMap pins={defectPin} selectedId={data.defect.id} />
			</div>
		</div>
	</div>

	<!-- Public Status Timeline -->
	<section class="panel space-y-6 p-6" aria-labelledby="timeline-heading">
		<h2 id="timeline-heading" class="border-b border-rule pb-3 text-xl font-bold text-ink">
			Verlauf und städtische Rückmeldungen
		</h2>

		<ol class="relative ml-4 space-y-6 border-l-2 border-amt-700 pb-2" aria-label="Statusverlauf">
			{#each data.updates as update, idx (update.id)}
				<li class="relative pl-6">
					<!-- Dot marker -->
					<span
						class="absolute top-1 -left-[9px] h-4 w-4 rounded-full border-2 border-sheet {idx === 0
							? 'bg-amt-700'
							: 'bg-rule'}"
						aria-hidden="true"
					></span>

					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="flex items-center gap-2">
							<StatusStempel status={update.status} kind="defect" />
							<span class="text-sm font-bold text-ink">{update.authorName}</span>
						</div>
						<time class="text-xs text-ink-soft" datetime={update.createdAt.toISOString()}>
							{formatDateTime(update.createdAt)}
						</time>
					</div>

					<p class="mt-2 border-l-2 border-ink bg-paper p-3 text-sm text-ink-soft">
						{update.note}
					</p>
				</li>
			{/each}
		</ol>
	</section>
</div>
