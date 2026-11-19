<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import QueueTable from '#lib/components/admin/QueueTable.svelte';
	import { scopeHref } from '#lib/components/admin/scope.ts';

	let { data }: PageProps = $props();

	const filters = [
		{ key: 'offen', label: 'Alle offenen' },
		{ key: 'eingereicht', label: 'Neu eingegangen' },
		{ key: 'in_pruefung', label: 'In Prüfung' },
		{ key: 'nachforderung', label: 'Nachweise fehlen' },
		{ key: 'entschieden', label: 'Entschieden' }
	];
</script>

<svelte:head><title>Anträge – Sachbearbeitung – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title="Anträge"
	lead="Eingereichte Anträge im Bereich {data.scope
		.label}. Entwürfe der Antragsteller werden nicht angezeigt."
	crumbs={[
		{ label: 'Sachbearbeitung', href: scopeHref('/sachbearbeiter', data.scope) },
		{ label: 'Anträge' }
	]}
/>

<nav aria-label="Anträge filtern" class="mb-6">
	<ul class="flex flex-wrap gap-2">
		{#each filters as f (f.key)}
			<li>
				<a
					href={scopeHref('/sachbearbeiter/antraege', data.scope, { status: f.key })}
					aria-current={data.status === f.key ? 'page' : undefined}
					class="btn btn-sm {data.status === f.key ? 'btn-primary' : ''}"
				>
					{f.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

{#if data.rows.length === 0}
	<EmptyState title="Keine Anträge in dieser Ansicht">
		Wählen Sie einen anderen Filter oder einen anderen Zuständigkeitsbereich.
	</EmptyState>
{:else}
	<div class="panel">
		<QueueTable
			rows={data.rows}
			scope={data.scope}
			caption="Anträge, {data.rows.length} Einträge"
			showOffice={data.scope.slug === 'alle'}
		/>
	</div>
{/if}
