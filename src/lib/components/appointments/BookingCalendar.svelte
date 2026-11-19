<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';
	import type { CalendarWeek, DayState } from './types.ts';
	let {
		month,
		weeks,
		previousHref,
		nextHref
	}: {
		month: string;
		weeks: CalendarWeek[];
		previousHref: ResolvedPathname | null;
		nextHref: ResolvedPathname | null;
	} = $props();
	const headingId = $props.id();
	const monthName = $derived(
		new Intl.DateTimeFormat('de-DE', {
			month: 'long',
			year: 'numeric',
			timeZone: 'Europe/Berlin'
		}).format(new Date(`${month}-01T12:00:00Z`))
	);
	const reasons: Record<DayState, string> = {
		frei: 'freie Termine',
		ausgebucht: 'ausgebucht',
		wochenende: 'Wochenende, geschlossen',
		feiertag: 'Feiertag, geschlossen',
		vergangen: 'nicht mehr buchbar',
		ausserhalb: 'noch nicht buchbar'
	};
</script>

<section class="panel" aria-labelledby={headingId}>
	<div class="flex flex-wrap items-center justify-between gap-3 border-b border-rule p-4">
		<h3 id={headingId}>{monthName}</h3>
		<nav aria-label="Kalendermonat" class="flex flex-wrap gap-2">
			{#if previousHref}<a href={previousHref} class="btn" aria-label="Vorheriger Monat">
					Zurück
				</a>{/if}
			{#if nextHref}<a href={nextHref} class="btn" aria-label="Nächster Monat">
					Nächster Monat
				</a>{/if}
		</nav>
	</div>
	<div class="overflow-x-auto" role="region" aria-label="Kalender mit freien Terminen">
		<table class="w-full min-w-[20rem] table-fixed border-collapse text-center">
			<caption class="visually-hidden">
				{monthName}: Wählen Sie einen Tag mit freien Terminen.
			</caption>
			<thead>
				<tr>
					{#each ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] as day (day)}<th
							scope="col"
							class="py-2 text-sm"
						>
							{day}
						</th>{/each}
				</tr>
			</thead>
			<tbody>
				{#each weeks as week (week.cells[0].date)}
					<tr>
						{#each week.cells as cell (cell.date)}
							<td class="border-t border-rule {cell.inMonth ? '' : 'bg-paper'}">
								{#if cell.href}
									<a
										href={resolve(cell.href)}
										class="flex min-h-14 flex-col items-center justify-center font-bold hover:bg-amt-100 {cell.selected
											? 'bg-amt-700 text-white hover:bg-amt-900'
											: 'bg-amt-50'}"
										aria-current={cell.selected ? 'date' : undefined}
										aria-label="{cell.date}: {cell.free} freie Termine{cell.today ? ', heute' : ''}"
									>
										<span>{cell.day}</span><span class="text-xs" aria-hidden="true">
											{cell.selected ? 'gewählt' : `${cell.free} frei`}
										</span>
									</a>
								{:else}
									<span
										class="flex min-h-14 items-center justify-center text-ink-soft"
										aria-label="{cell.date}: {cell.note ?? reasons[cell.state]}"
									>
										{cell.day}
									</span>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="border-t border-rule p-3 text-sm text-ink-soft">
		Blaue Felder zeigen freie Termine. An Wochenenden und Feiertagen ist geschlossen. Alle Uhrzeiten
		gelten für Musterstadt (Europe/Berlin).
	</p>
</section>
