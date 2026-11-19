<script lang="ts">
	import type { EventRow } from './types.ts';
	import { eventLabel } from './helpers.ts';
	import { formatDateTime } from '#lib/format.ts';

	let { events }: { events: EventRow[] } = $props();
</script>

<ol class="border-l-2 border-ink pl-4">
	{#each events as event (event.id)}
		<li class="relative pb-4 last:pb-0">
			<span class="absolute top-2 -left-5.25 size-2 bg-ink" aria-hidden="true"></span>
			<p class="font-bold">{eventLabel(event.kind)}</p>
			<p class="text-sm text-ink-soft">
				{formatDateTime(event.createdAt)}{#if event.actorName}, {event.actorName}{event.actorRole ===
					'caseworker'
						? ' (Sachbearbeitung)'
						: ''}{/if}
			</p>
			{#if event.note}<p class="mt-1 max-w-prose">{event.note}</p>{/if}
		</li>
	{/each}
</ol>
