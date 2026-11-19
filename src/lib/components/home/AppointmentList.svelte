<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { formatDateLong, formatTime } from '#lib/format.ts';
	import type { DashAppointment } from './types.ts';

	let { appointments }: { appointments: DashAppointment[] } = $props();
</script>

<section aria-labelledby="termine-h">
	<div class="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
		<h2 id="termine-h" class="text-2xl">Nächste Termine</h2>
		<a href="/termine" class="font-bold">Alle Termine ansehen</a>
	</div>

	{#if appointments.length === 0}
		<EmptyState title="Sie haben keinen Termin gebucht">
			Für Reisepass, Ummeldung oder Kfz-Zulassung buchen Sie eine feste Uhrzeit und sparen sich die
			Wartezeit.
			{#snippet actions()}
				<a href="/termine/buchen" class="btn btn-primary">Termin buchen</a>
			{/snippet}
		</EmptyState>
	{:else}
		<ul class="panel divide-y divide-rule">
			{#each appointments as termin (termin.code)}
				<li class="grid gap-x-6 gap-y-1 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
					<div>
						<p class="font-bold">{termin.serviceName}</p>
						<p class="text-ink-soft">{termin.locationName}, {termin.locationStreet}</p>
					</div>
					<div class="sm:text-right">
						<p class="font-bold">
							<time datetime={termin.startsAt}>{formatDateLong(termin.startsAt)}</time>
						</p>
						<p>
							{formatTime(termin.startsAt)} Uhr,
							<span class="aktenzeichen text-sm text-ink-soft">{termin.code}</span>
						</p>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
