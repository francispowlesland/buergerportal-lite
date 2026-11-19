<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import type { QueueRow, ScopeInfo } from './types.ts';
	import { scopeHref } from './scope.ts';
	import { ageText } from './helpers.ts';
	import { formatDate } from '#lib/format.ts';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';

	let {
		rows,
		scope,
		caption,
		showOffice = false
	}: { rows: QueueRow[]; scope: ScopeInfo; caption: string; showOffice?: boolean } = $props();
</script>

<div class="overflow-x-auto">
	<table class="w-full min-w-176 border-collapse text-left text-[0.9688rem]">
		<caption class="visually-hidden">{caption}</caption>
		<thead>
			<tr class="border-b-2 border-ink bg-paper">
				<th scope="col" class="px-3 py-2">Aktenzeichen</th>
				<th scope="col" class="px-3 py-2">Antragsteller/in</th>
				<th scope="col" class="px-3 py-2">Leistung</th>
				<th scope="col" class="px-3 py-2">Status</th>
				<th scope="col" class="px-3 py-2">Eingereicht</th>
				<th scope="col" class="px-3 py-2">Bearbeitung</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.id)}
				<tr class="border-b border-rule align-top">
					<th scope="row" class="px-3 py-2 font-normal">
						<a
							href={scopeHref(`/sachbearbeiter/antraege/${row.id}`, scope)}
							class="aktenzeichen inline-flex min-h-11 items-center"
						>
							{row.reference}
						</a>
					</th>
					<td class="px-3 py-2">{row.citizenName}</td>
					<td class="px-3 py-2">
						{row.serviceName}
						{#if showOffice}<span class="block text-sm text-ink-soft">{row.officeName}</span>{/if}
					</td>
					<td class="px-3 py-2"><StatusStempel status={row.status} /></td>
					<td class="px-3 py-2">
						{#if row.submittedAt}
							{formatDate(row.submittedAt)}
							<span class="block text-sm text-ink-soft">
								vor {ageText(row.ageDays ?? 0)}
							</span>
							{#if row.overdue}
								<span class="mt-1 inline-block"><Stempel tone="bad">Überfällig</Stempel></span>
							{/if}
						{:else}
							–
						{/if}
					</td>
					<td class="px-3 py-2">{row.assigneeName ?? 'nicht zugewiesen'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
