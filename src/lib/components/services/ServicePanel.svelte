<script lang="ts">
	import type { Snippet } from 'svelte';

	/** Accordion panel on native <details>/<summary>: works without JavaScript. */
	let {
		id,
		title,
		open = false,
		children
	}: { id: string; title: string; open?: boolean; children: Snippet } = $props();
</script>

<details {id} class="panel group" {open}>
	<summary
		class="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2 font-display text-lg font-bold group-open:border-b group-open:border-ink hover:bg-amt-50"
		style="font-stretch: 105%"
	>
		<span>{title}</span>
		<span class="font-sans text-sm font-normal text-amt-700 underline" aria-hidden="true">
			<span class="group-open:hidden">Anzeigen</span>
			<span class="hidden group-open:inline">Ausblenden</span>
		</span>
	</summary>
	<div class="p-4">
		{@render children()}
	</div>
</details>
