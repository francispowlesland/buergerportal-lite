<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children, actions }: { title: string; children?: Snippet; actions?: Snippet } =
		$props();
</script>

<div class="panel-quiet border-dashed p-8 text-center">
	<p class="font-display text-xl font-bold">{title}</p>
	{#if children}<div class="mx-auto mt-2 max-w-prose text-ink-soft">{@render children()}</div>{/if}
	{#if actions}<div class="mt-4 flex justify-center gap-2">{@render actions()}</div>{/if}
</div>
