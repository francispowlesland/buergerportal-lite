<script lang="ts">
	import { a11y } from '#lib/a11y.svelte.ts';

	/** Renders the standard text, or the Leichte-Sprache variant when that mode is on. */
	let { standard, leicht }: { standard: string; leicht: string } = $props();
</script>

{a11y.leicht ? leicht : standard}
