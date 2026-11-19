<script lang="ts">
	import { afterNavigate, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import ServiceFilters from '#lib/components/services/ServiceFilters.svelte';
	import ServiceRow from '#lib/components/services/ServiceRow.svelte';
	import {
		ALPHABET,
		groupByLetter,
		scoreQuery,
		searchIndex
	} from '#lib/components/services/search.ts';
	import { LEBENSLAGEN } from '#lib/labels.ts';

	let { data }: PageProps = $props();

	/* ── Filter options, derived from what is actually in the directory ── */
	const offices = $derived.by(() => {
		const counts: Record<string, { slug: string; name: string; n: number }> = {};
		for (const s of data.services) {
			counts[s.officeSlug] ??= { slug: s.officeSlug, name: s.officeName, n: 0 };
			counts[s.officeSlug].n += 1;
		}
		return Object.values(counts).sort((a, b) => a.name.localeCompare(b.name, 'de'));
	});

	const lebenslagen = $derived.by(() => {
		const used = new Set(data.services.flatMap((s) => s.lebenslagen));
		return Object.entries(LEBENSLAGEN)
			.filter(([key]) => used.has(key))
			.map(([key, label]) => ({ key, label }));
	});

	/* ── Filter state: the URL is the source of truth, local state keeps typing instant ── */
	function fromUrl() {
		const params = page.url.searchParams;
		const amtParam = params.get('amt') ?? '';
		const lageParam = params.getAll('lebenslage').at(-1) ?? '';
		return {
			q: params.get('q') ?? '',
			amt: offices.some((o) => o.slug === amtParam) ? amtParam : '',
			lebenslage: lebenslagen.some((l) => l.key === lageParam) ? lageParam : ''
		};
	}

	const initial = fromUrl();
	let q = $state(initial.q);
	let amt = $state(initial.amt);
	let lebenslage = $state(initial.lebenslage);

	// A link in the header or the browser's back button changes the URL from outside.
	afterNavigate(() => {
		({ q, amt, lebenslage } = fromUrl());
	});

	/* ── Live filtering and ranking ── */
	const indexed = $derived(data.services.map((s) => ({ service: s, index: searchIndex(s) })));
	const searching = $derived(q.trim() !== '');

	const results = $derived.by(() => {
		const hits: { service: (typeof data.services)[number]; score: number }[] = [];
		for (const { service, index } of indexed) {
			if (amt && service.officeSlug !== amt) continue;
			if (lebenslage && !service.lebenslagen.includes(lebenslage)) continue;
			const score = searching ? scoreQuery(index, q) : 1;
			if (score > 0) hits.push({ service, score });
		}
		// The list arrives alphabetically; with a query the best matches come first.
		if (searching) hits.sort((a, b) => b.score - a.score);
		return hits.map((hit) => hit.service);
	});

	const groups = $derived(groupByLetter(results));
	const letters = $derived(new Set(groups.map((g) => g.letter)));
	const filtered = $derived(searching || amt !== '' || lebenslage !== '');

	const countText = $derived.by(() => {
		const total = data.services.length;
		if (results.length === 0) return 'Keine Leistung gefunden';
		if (!filtered) return `${total} Leistungen von A bis Z`;
		return `${results.length} von ${total} Leistungen gefunden`;
	});

	/* ── Keep ?q=, ?amt= and ?lebenslage= in the address bar ── */
	function syncUrl() {
		const next = new SvelteURLSearchParams();
		if (q.trim()) next.set('q', q.trim());
		if (amt) next.set('amt', amt);
		if (lebenslage) next.set('lebenslage', lebenslage);
		void replaceState(
			next.size > 0 ? resolve(`/dienste?${next}`) : resolve('/dienste'),
			page.state
		);
	}

	function reset() {
		q = '';
		amt = '';
		lebenslage = '';
		syncUrl();
		document.querySelector<HTMLInputElement>('form[role=search] input[type=search]')?.focus();
	}

	const anchorOf = (letter: string) => `buchstabe-${letter === '#' ? 'sonstige' : letter}`;
</script>

<svelte:head><title>Leistungen von A bis Z – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title="Leistungen von A bis Z"
	lead="Der Behördenwegweiser der Stadt Musterstadt. Suchen Sie nach einem Stichwort oder grenzen Sie nach Amt und Lebenslage ein."
	crumbs={[{ label: 'Start', href: '/' }, { label: 'Leistungen' }]}
/>

<ServiceFilters
	{q}
	{amt}
	{lebenslage}
	{offices}
	{lebenslagen}
	{countText}
	{filtered}
	onquery={(value: string) => {
		q = value;
		syncUrl();
	}}
	onamt={(value: string) => {
		amt = value;
		syncUrl();
	}}
	onlebenslage={(value: string) => {
		lebenslage = value;
		syncUrl();
	}}
	onreset={reset}
	onsubmit={syncUrl}
/>

{#if results.length === 0}
	<EmptyState title="Dazu haben wir keine Leistung gefunden">
		Prüfen Sie die Schreibweise oder suchen Sie mit einem allgemeineren Begriff, zum Beispiel
		„Ausweis“ statt „Personalausweis verlängern“.
		{#snippet actions()}
			<a
				href={resolve('/dienste')}
				class="btn btn-primary"
				onclick={(event) => {
					event.preventDefault();
					reset();
				}}
			>
				Filter zurücksetzen
			</a>
		{/snippet}
	</EmptyState>
{:else if searching}
	<section aria-labelledby="treffer-h">
		<h2 id="treffer-h" class="mb-3 text-xl">Treffer, beste zuerst</h2>
		<ul class="panel px-4">
			{#each results as service (service.id)}
				<ServiceRow {service} />
			{/each}
		</ul>
	</section>
{:else}
	<nav
		aria-label="Zum Anfangsbuchstaben springen"
		class="mb-6 border-y border-ink bg-paper py-2 md:sticky md:top-0 md:z-10"
	>
		<ul class="flex flex-wrap gap-1">
			{#each ALPHABET as letter (letter)}
				<li>
					{#if letters.has(letter)}
						<a
							href="#{anchorOf(letter)}"
							class="flex min-h-11 min-w-11 items-center justify-center border-2 border-ink bg-sheet px-2 font-display font-bold !text-ink no-underline hover:bg-amt-50"
						>
							{letter}
						</a>
					{:else}
						<span
							aria-hidden="true"
							class="flex min-h-11 min-w-11 items-center justify-center font-display text-rule"
						>
							{letter}
						</span>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>

	<div class="grid gap-8">
		{#each groups as group (group.letter)}
			{@const anchor = anchorOf(group.letter)}
			<section
				id={anchor}
				aria-labelledby="{anchor}-h"
				class="grid gap-x-6 gap-y-2 md:grid-cols-[4.5rem_minmax(0,1fr)]"
			>
				<h2 id="{anchor}-h" class="text-4xl leading-none md:pt-4">
					{group.letter === '#' ? '…' : group.letter}
				</h2>
				<ul class="panel px-4">
					{#each group.items as service (service.id)}
						<ServiceRow {service} />
					{/each}
				</ul>
			</section>
		{/each}
	</div>
{/if}
