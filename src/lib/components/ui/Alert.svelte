<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Tone } from '#lib/labels.ts';

	let {
		tone = 'info',
		title,
		children,
		actions
	}: { tone?: Tone; title?: string; children?: Snippet; actions?: Snippet } = $props();

	const bar: Record<Tone, string> = {
		neutral: 'border-l-ink-soft',
		info: 'border-l-amt-700',
		ok: 'border-l-status-600',
		warn: 'border-l-warn-700',
		bad: 'border-l-signal-600'
	};
	// Errors are announced immediately; everything else politely.
	const role = $derived(tone === 'bad' ? 'alert' : 'status');
</script>

<div class="panel-quiet border-l-8 p-4 {bar[tone]}" {role}>
	{#if title}<p class="font-bold">{title}</p>{/if}
	{#if children}<div class="text-[0.9688rem]">{@render children()}</div>{/if}
	{#if actions}<div class="mt-3 flex flex-wrap gap-2">{@render actions()}</div>{/if}
</div>
