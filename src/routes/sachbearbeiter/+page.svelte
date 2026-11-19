<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';
	import QueueTable from '#lib/components/admin/QueueTable.svelte';
	import ScheduleList from '#lib/components/admin/ScheduleList.svelte';
	import { scopeHref } from '#lib/components/admin/scope.ts';
	import { ageText } from '#lib/components/admin/helpers.ts';
	import { DEFECT_CATEGORY } from '#lib/labels.ts';

	let { data }: PageProps = $props();

	const scope = $derived(data.scope);
	const kpis = $derived(data.kpis);
	const kpiItems = $derived([
		{
			label: 'Neu eingegangen',
			value: kpis.neu,
			href: scopeHref('/sachbearbeiter/antraege', scope, { status: 'eingereicht' })
		},
		{
			label: 'In Prüfung',
			value: kpis.inPruefung,
			href: scopeHref('/sachbearbeiter/antraege', scope, { status: 'in_pruefung' })
		},
		{
			label: 'Auf Nachweise wartend',
			value: kpis.nachforderung,
			href: scopeHref('/sachbearbeiter/antraege', scope, { status: 'nachforderung' })
		},
		{
			label: 'Überfällig (über 5 Tage)',
			value: kpis.overdue,
			href: scopeHref('/sachbearbeiter/antraege', scope, { status: 'offen' }),
			alert: kpis.overdue > 0
		}
	]);
	const openDefects = $derived(data.defectCounts.gemeldet + data.defectCounts.in_bearbeitung);
</script>

<svelte:head><title>Sachbearbeitung – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title="Sachbearbeitung"
	lead="Angemeldet als {data.caseworker.name}{data.caseworker.jobTitle
		? `, ${data.caseworker.jobTitle}`
		: ''}. Angezeigt wird: {scope.label}."
	crumbs={[{ label: 'Start', href: '/' }, { label: 'Sachbearbeitung' }]}
/>

<div class="grid gap-12">
	<section aria-labelledby="kennzahlen-h">
		<h2 id="kennzahlen-h" class="mb-4">Kennzahlen</h2>
		<dl class="panel grid grid-cols-2 divide-ink md:grid-cols-4 md:divide-x">
			{#each kpiItems as item (item.label)}
				<div class="border-b border-rule p-4 md:border-b-0">
					<dt class="text-sm text-ink-soft">{item.label}</dt>
					<dd class="mt-1">
						<a
							href={item.href}
							class="font-display text-4xl font-bold no-underline hover:underline {item.alert
								? 'text-signal-800'
								: 'text-ink'}"
						>
							{item.value}
						</a>
					</dd>
				</div>
			{/each}
		</dl>
		<p class="mt-3 text-ink-soft">
			{#if kpis.medianDays !== null}
				Entschiedene Anträge: {kpis.decidedCount}, mittlere Bearbeitungszeit {kpis.medianDays.toLocaleString(
					'de-DE'
				)} Tage.
			{:else}
				In diesem Bereich wurden noch keine Anträge entschieden.
			{/if}
		</p>
	</section>

	<section aria-labelledby="antraege-h">
		<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
			<h2 id="antraege-h">Anträge zur Bearbeitung</h2>
			<a href={scopeHref('/sachbearbeiter/antraege', scope)} class="btn btn-sm">
				Alle Anträge anzeigen
			</a>
		</div>
		{#if data.queue.length === 0}
			<EmptyState title="Keine Anträge zur Bearbeitung">
				Sobald Bürgerinnen und Bürger Anträge einreichen, erscheinen sie hier.
			</EmptyState>
		{:else}
			<div class="panel">
				<QueueTable
					rows={data.queue}
					{scope}
					caption="Eingegangene Anträge, älteste zuerst"
					showOffice={scope.slug === 'alle'}
				/>
			</div>
		{/if}

		{#if data.nachforderungen.length > 0}
			<h3 class="mt-8 mb-3">Warten auf Nachweise der Antragsteller</h3>
			<div class="panel">
				<QueueTable
					rows={data.nachforderungen}
					{scope}
					caption="Anträge mit offener Nachforderung"
					showOffice={scope.slug === 'alle'}
				/>
			</div>
		{/if}
	</section>

	<div class="grid gap-12 lg:grid-cols-2">
		<section aria-labelledby="termine-h">
			<h2 id="termine-h" class="mb-4">Termine</h2>
			<div class="panel p-4">
				<ScheduleList days={data.schedule} />
			</div>
		</section>

		<section aria-labelledby="maengel-h">
			<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
				<h2 id="maengel-h">Offene Mängelmeldungen</h2>
				<a href={scopeHref('/sachbearbeiter/maengel', scope)} class="btn btn-sm">
					Mängelmelder verwalten
				</a>
			</div>
			{#if data.defects.length === 0}
				<EmptyState title="Keine offenen Mängelmeldungen">
					Alle gemeldeten Mängel sind behoben.
				</EmptyState>
			{:else}
				<ul class="panel divide-y divide-rule">
					{#each data.defects as defect (defect.id)}
						<li class="p-3">
							<div class="flex flex-wrap items-center justify-between gap-2">
								<span class="aktenzeichen">{defect.reference}</span>
								<StatusStempel status={defect.status} kind="defect" />
							</div>
							<p class="mt-1 font-bold">{defect.title}</p>
							<p class="text-sm text-ink-soft">
								{DEFECT_CATEGORY[defect.category]}, {defect.address}, gemeldet vor {ageText(
									defect.ageDays
								)}
							</p>
						</li>
					{/each}
				</ul>
				<p class="mt-3 text-ink-soft">
					Insgesamt offen: {openDefects}. Davon in Bearbeitung: {data.defectCounts.in_bearbeitung}.
				</p>
			{/if}
		</section>
	</div>
</div>
