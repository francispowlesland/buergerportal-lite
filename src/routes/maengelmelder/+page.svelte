<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path configured; links are root-relative */
	import { page } from '$app/state';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import DefectMap from '#lib/components/map/DefectMap.svelte';
	import { DEFECT_CATEGORY } from '#lib/labels.ts';
	import { formatDate } from '#lib/format.ts';
	import type { DefectCategory, DefectStatus } from '#lib/server/db/schema.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedPinId = $state<number | null>(null);

	const selectedDefect = $derived(
		selectedPinId ? (data.defects.find((d) => d.id === selectedPinId) ?? null) : null
	);

	function updateFilter(key: string, value: string | null) {
		const url = new URL(page.url.href);
		if (value) {
			url.searchParams.set(key, value);
		} else {
			url.searchParams.delete(key);
		}
		return url.pathname + url.search;
	}

	function handleSelectPin(id: number) {
		selectedPinId = selectedPinId === id ? null : id;
	}

	const categories: { key: DefectCategory; label: string }[] = [
		{ key: 'schlagloch', label: 'Schlagloch' },
		{ key: 'strassenbeleuchtung', label: 'Straßenbeleuchtung' },
		{ key: 'graffiti', label: 'Graffiti' },
		{ key: 'illegale_muellablagerung', label: 'Illegale Müllablagerung' },
		{ key: 'spielplatz', label: 'Spielplatz' },
		{ key: 'sonstiges', label: 'Sonstiges' }
	];

	const statuses: { key: DefectStatus; label: string }[] = [
		{ key: 'gemeldet', label: 'Gemeldet' },
		{ key: 'in_bearbeitung', label: 'In Bearbeitung' },
		{ key: 'behoben', label: 'Behoben' }
	];
</script>

<svelte:head>
	<title>Mängelmelder – Bürgerportal Musterstadt</title>
</svelte:head>

{#snippet headerActions()}
	<a href="/maengelmelder/melden" class="btn btn-primary">
		<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
		</svg>
		Mangel melden
	</a>
{/snippet}

<PageHeader
	title="Mängelmelder Musterstadt"
	lead="Schäden, Störungen und Verunreinigungen im Stadtgebiet direkt an die Stadtverwaltung melden und den Bearbeitungsstand transparent nachverfolgen."
	crumbs={[{ label: 'Startseite', href: '/' }, { label: 'Mängelmelder' }]}
	actions={headerActions}
/>

<!-- Filter & Control Bar -->
<section class="mb-6 space-y-4" aria-label="Filter für Meldungen">
	<!-- Status Pills / Filter Tabs -->
	<div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-rule pb-4">
		<div class="flex flex-wrap items-center gap-2">
			<span class="mr-2 text-sm font-bold text-ink">Status:</span>
			<a
				href={updateFilter('status', null)}
				class="btn btn-sm {data.selectedStatus === null ? 'btn-primary' : ''}"
				aria-current={data.selectedStatus === null ? 'page' : undefined}
			>
				Alle ({data.stats.total})
			</a>
			{#each statuses as st (st.key)}
				{@const count =
					st.key === 'gemeldet'
						? data.stats.gemeldet
						: st.key === 'in_bearbeitung'
							? data.stats.inBearbeitung
							: data.stats.behoben}
				<a
					href={updateFilter('status', st.key)}
					class="btn btn-sm {data.selectedStatus === st.key ? 'btn-primary' : ''}"
					aria-current={data.selectedStatus === st.key ? 'page' : undefined}
				>
					{st.label} ({count})
				</a>
			{/each}
		</div>

		<!-- View Switcher (Map vs List) -->
		<div
			class="flex items-center gap-1 border border-ink bg-sheet p-0.5"
			role="group"
			aria-label="Ansicht wählen"
		>
			<a
				href={updateFilter('view', 'map')}
				class="flex items-center gap-1.5 px-3 py-1 text-sm font-bold no-underline {data.view ===
				'map'
					? 'bg-ink text-white'
					: 'text-ink hover:bg-amt-50'}"
				aria-current={data.view === 'map' ? 'page' : undefined}
			>
				<svg
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
					/>
				</svg>
				Karte
			</a>
			<a
				href={updateFilter('view', 'list')}
				class="flex items-center gap-1.5 px-3 py-1 text-sm font-bold no-underline {data.view ===
				'list'
					? 'bg-ink text-white'
					: 'text-ink hover:bg-amt-50'}"
				aria-current={data.view === 'list' ? 'page' : undefined}
			>
				<svg
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 10h16M4 14h16M4 18h16"
					/>
				</svg>
				Liste ({data.defects.length})
			</a>
		</div>
	</div>

	<!-- Category Filters -->
	<div class="flex flex-wrap items-center gap-2">
		<span class="text-xs font-bold text-ink-soft">Kategorie:</span>
		<a
			href={updateFilter('category', null)}
			class="border px-2 py-1 text-xs font-bold no-underline {data.selectedCategory === null
				? 'border-ink bg-ink text-white'
				: 'border-rule bg-sheet text-ink hover:border-ink'}"
			aria-current={data.selectedCategory === null ? 'page' : undefined}
		>
			Alle Kategorien
		</a>
		{#each categories as cat (cat.key)}
			<a
				href={updateFilter('category', cat.key)}
				class="border px-2 py-1 text-xs font-bold no-underline {data.selectedCategory === cat.key
					? 'border-ink bg-ink text-white'
					: 'border-rule bg-sheet text-ink hover:border-ink'}"
				aria-current={data.selectedCategory === cat.key ? 'page' : undefined}
			>
				{cat.label}
			</a>
		{/each}
	</div>
</section>

{#if data.defects.length === 0}
	<EmptyState title="Keine Meldungen gefunden">
		<p>Für die gewählten Filter liegen aktuell keine Meldungen vor.</p>
		{#snippet actions()}
			<a href="/maengelmelder" class="btn btn-sm">Filter zurücksetzen</a>
		{/snippet}
	</EmptyState>
{:else if data.view === 'map'}
	<!-- Map View with selected item highlight drawer -->
	<div class="space-y-6">
		<DefectMap pins={data.defects} selectedId={selectedPinId} onSelectPin={handleSelectPin} />

		{#if selectedDefect}
			<!-- Selected Defect Quick View Panel -->
			<div
				class="panel border-2 border-amt-700 bg-amt-50 p-5"
				role="region"
				aria-label="Ausgewählte Meldung"
			>
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div class="space-y-1">
						<div class="flex flex-wrap items-center gap-2">
							<span class="aktenzeichen text-sm font-black">{selectedDefect.reference}</span>
							<StatusStempel status={selectedDefect.status} kind="defect" />
							<span class="text-xs font-bold text-ink-soft">
								{DEFECT_CATEGORY[selectedDefect.category]}
							</span>
						</div>
						<h2 class="text-xl font-bold text-ink">{selectedDefect.title}</h2>
						<p class="text-sm text-ink-soft">{selectedDefect.address}</p>
					</div>

					<div class="flex items-center gap-2">
						<button
							type="button"
							class="btn btn-ghost btn-sm"
							onclick={() => (selectedPinId = null)}
						>
							Schließen
						</button>
						<a href="/maengelmelder/{selectedDefect.reference}" class="btn btn-primary btn-sm">
							Meldung öffnen
						</a>
					</div>
				</div>
				<p class="mt-3 line-clamp-2 max-w-prose text-sm text-ink">{selectedDefect.description}</p>
			</div>
		{/if}

		<!-- Grid of Recent reports underneath map for fast scrolling & discovery -->
		<div class="mt-8">
			<h2 class="mb-4 text-xl font-bold text-ink">Gemeldete Schäden im Stadtgebiet</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.defects as defect (defect.id)}
					<article
						class="panel flex flex-col justify-between p-4 transition-colors hover:border-amt-700"
					>
						<div>
							<div class="mb-2 flex items-center justify-between gap-2">
								<span class="aktenzeichen text-xs font-black">{defect.reference}</span>
								<StatusStempel status={defect.status} kind="defect" />
							</div>
							<h3 class="text-base leading-snug font-bold text-ink">
								<a
									href="/maengelmelder/{defect.reference}"
									class="text-ink no-underline hover:underline"
								>
									{defect.title}
								</a>
							</h3>
							<p class="mt-1 text-xs font-bold text-ink-soft">
								{DEFECT_CATEGORY[defect.category]} • {defect.address}
							</p>
							<p class="mt-2 line-clamp-3 text-xs text-ink">
								{defect.description}
							</p>
						</div>

						<div
							class="mt-4 flex items-center justify-between border-t border-rule pt-3 text-xs text-ink-soft"
						>
							<span>Gemeldet am {formatDate(defect.createdAt)}</span>
							<a
								href="/maengelmelder/{defect.reference}"
								class="font-bold text-amt-700 hover:underline"
							>
								Details ansehen
							</a>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<!-- Accessible List/Table View -->
	<div class="overflow-x-auto border-2 border-ink bg-sheet">
		<table class="w-full text-left text-sm text-ink">
			<thead class="border-b-2 border-ink bg-paper text-xs text-ink uppercase">
				<tr>
					<th scope="col" class="p-3 font-bold">Aktenzeichen</th>
					<th scope="col" class="p-3 font-bold">Kategorie</th>
					<th scope="col" class="p-3 font-bold">Titel & Beschreibung</th>
					<th scope="col" class="p-3 font-bold">Ort</th>
					<th scope="col" class="p-3 font-bold">Status</th>
					<th scope="col" class="p-3 font-bold">Datum</th>
					<th scope="col" class="p-3 text-right font-bold">
						<span class="visually-hidden">Aktionen</span>
					</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-rule">
				{#each data.defects as defect (defect.id)}
					<tr class="hover:bg-amt-50">
						<td class="p-3 font-mono font-bold whitespace-nowrap">
							<a
								href="/maengelmelder/{defect.reference}"
								class="aktenzeichen text-amt-700 hover:underline"
							>
								{defect.reference}
							</a>
						</td>
						<td class="p-3 font-bold whitespace-nowrap">
							{DEFECT_CATEGORY[defect.category]}
						</td>
						<td class="max-w-md p-3">
							<a
								href="/maengelmelder/{defect.reference}"
								class="block font-bold text-ink no-underline hover:underline"
							>
								{defect.title}
							</a>
							<p class="mt-0.5 line-clamp-2 text-xs text-ink-soft">{defect.description}</p>
						</td>
						<td class="p-3 text-xs text-ink-soft">
							{defect.address}
						</td>
						<td class="p-3 whitespace-nowrap">
							<StatusStempel status={defect.status} kind="defect" />
						</td>
						<td class="p-3 text-xs whitespace-nowrap text-ink-soft">
							{formatDate(defect.createdAt)}
						</td>
						<td class="p-3 text-right whitespace-nowrap">
							<a href="/maengelmelder/{defect.reference}" class="btn btn-sm"> Details </a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
