<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Tone } from '#lib/labels.ts';

	let { tone = 'neutral', children }: { tone?: Tone; children: Snippet } = $props();
</script>

<span class="stempel stempel-{tone}">{@render children()}</span>
