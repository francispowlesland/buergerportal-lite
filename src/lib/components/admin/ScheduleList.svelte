<script lang="ts">
	import type { ScheduleDay } from './types.ts';
	import { formatTime } from '#lib/format.ts';
	import Stempel from '#lib/components/ui/Stempel.svelte';

	let { days }: { days: ScheduleDay[] } = $props();
</script>

<div class="grid gap-5">
	{#each days as day (day.key)}
		<section aria-label={day.label}>
			<h3 class="mb-2 flex items-center gap-2 text-base">
				{day.label}
				{#if day.isToday}<Stempel tone="info">Heute</Stempel>{/if}
			</h3>
			{#if day.items.length === 0}
				<p class="text-ink-soft">Heute sind keine Termine gebucht.</p>
			{:else}
				<ul class="divide-y divide-rule border-y border-rule">
					{#each day.items as item (item.id)}
						<li class="grid grid-cols-[5.5rem_1fr] gap-x-3 py-2">
							<span class="font-bold tabular-nums">
								{formatTime(item.startsAt)}–{formatTime(item.endsAt)}
							</span>
							<span>
								{item.serviceName}
								<span class="block text-sm text-ink-soft">
									{item.citizenName}, {item.locationName}
								</span>
								<span class="aktenzeichen text-sm text-ink-soft">{item.code}</span>
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
</div>
