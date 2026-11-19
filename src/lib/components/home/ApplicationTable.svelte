<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';
	import { formatDate } from '#lib/format.ts';
	import type { DashApplication } from './types.ts';

	let { applications, decidedCount }: { applications: DashApplication[]; decidedCount: number } =
		$props();

	const href = (a: DashApplication) =>
		a.wizardSlug ? `/antrag/${a.wizardSlug}/${a.id}` : '/antrag';

	const action = (a: DashApplication) =>
		a.status === 'entwurf'
			? 'Entwurf fortsetzen'
			: a.status === 'nachforderung'
				? 'Nachweise nachreichen'
				: 'Stand ansehen';
</script>

<section aria-labelledby="antraege-h">
	<div class="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
		<h2 id="antraege-h" class="text-2xl">Offene Anträge</h2>
		<a href="/antrag" class="font-bold">Alle Anträge ansehen</a>
	</div>

	{#if applications.length === 0}
		<EmptyState title="Sie haben keine offenen Anträge">
			Meldebescheinigung, Anwohnerparkausweis oder Briefwahl: Sie können jeden Antrag online stellen
			und den Stand hier verfolgen.
			{#snippet actions()}
				<a href="/antrag" class="btn btn-primary">Antrag stellen</a>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="panel overflow-x-auto">
			<table class="w-full text-left">
				<caption class="visually-hidden">Ihre offenen Anträge</caption>
				<thead class="border-b border-ink bg-amt-50 text-sm">
					<tr>
						<th scope="col" class="px-4 py-2">Antrag</th>
						<th scope="col" class="px-4 py-2">Stand</th>
						<th scope="col" class="px-4 py-2">Zuletzt geändert</th>
						<th scope="col" class="px-4 py-2"><span class="visually-hidden">Aktion</span></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-rule">
					{#each applications as app (app.id)}
						<tr>
							<th scope="row" class="px-4 py-3 font-normal">
								<span class="block font-bold">{app.serviceName}</span>
								<span class="aktenzeichen text-sm text-ink-soft">{app.reference}</span>
							</th>
							<td class="px-4 py-3"><StatusStempel status={app.status} /></td>
							<td class="px-4 py-3 whitespace-nowrap">{formatDate(app.updatedAt)}</td>
							<td class="px-4 py-3 text-right">
								<a href={href(app)} class="btn btn-sm">
									{action(app)}<span class="visually-hidden">: {app.serviceName}</span>
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if decidedCount > 0}
			<p class="mt-3 text-ink-soft">
				{decidedCount === 1
					? 'Ein weiterer Antrag ist entschieden.'
					: `${decidedCount} weitere Anträge sind entschieden.`}
				Die Bescheide liegen in Ihrem <a href="/postkorb">Postkorb</a>.
			</p>
		{/if}
	{/if}
</section>
