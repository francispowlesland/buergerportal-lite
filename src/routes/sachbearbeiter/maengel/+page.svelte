<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import DefectTableRow from '#lib/components/admin/DefectTableRow.svelte';
	import { scopeHref } from '#lib/components/admin/scope.ts';

	let { data, form }: PageProps = $props();

	const filters = $derived([
		{ key: 'offen', label: 'Alle offenen', n: data.counts.gemeldet + data.counts.in_bearbeitung },
		{ key: 'gemeldet', label: 'Gemeldet', n: data.counts.gemeldet },
		{ key: 'in_bearbeitung', label: 'In Bearbeitung', n: data.counts.in_bearbeitung },
		{ key: 'behoben', label: 'Behoben', n: data.counts.behoben }
	]);
</script>

<svelte:head><title>Mängelmelder – Sachbearbeitung – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title="Mängelmeldungen verwalten"
	lead="Jede Statusänderung erzeugt einen Eintrag im öffentlichen Verlauf der Meldung."
	crumbs={[
		{ label: 'Sachbearbeitung', href: scopeHref('/sachbearbeiter', data.scope) },
		{ label: 'Mängelmelder' }
	]}
/>

<nav aria-label="Mängelmeldungen filtern" class="mb-6">
	<ul class="flex flex-wrap gap-2">
		{#each filters as f (f.key)}
			<li>
				<a
					href={scopeHref('/sachbearbeiter/maengel', data.scope, { status: f.key })}
					aria-current={data.status === f.key ? 'page' : undefined}
					class="btn btn-sm {data.status === f.key ? 'btn-primary' : ''}"
				>
					{f.label} ({f.n})
				</a>
			</li>
		{/each}
	</ul>
</nav>

{#if data.rows.length === 0}
	<EmptyState title="Keine Mängelmeldungen in dieser Ansicht">
		Wählen Sie einen anderen Filter.
	</EmptyState>
{:else}
	<div class="panel overflow-x-auto">
		<table class="w-full min-w-208 border-collapse text-left text-[0.9688rem]">
			<caption class="visually-hidden">Mängelmeldungen, {data.rows.length} Einträge</caption>
			<thead>
				<tr class="border-b-2 border-ink bg-paper">
					<th scope="col" class="px-3 py-2">Referenz</th>
					<th scope="col" class="px-3 py-2">Meldung</th>
					<th scope="col" class="px-3 py-2">Status</th>
					<th scope="col" class="px-3 py-2">Status ändern</th>
				</tr>
			</thead>
			<tbody>
				{#each data.rows as row (row.id)}
					<DefectTableRow {row} {form} />
				{/each}
			</tbody>
		</table>
	</div>
{/if}
