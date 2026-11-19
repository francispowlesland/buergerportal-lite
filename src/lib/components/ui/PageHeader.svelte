<script lang="ts">
	import type { Snippet } from 'svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';

	/** Standard page top: breadcrumbs, H1, optional lead text and actions. One per page. */
	let {
		title,
		lead,
		crumbs,
		actions
	}: {
		title: string;
		lead?: string;
		crumbs?: { label: string; href?: string }[];
		actions?: Snippet;
	} = $props();
</script>

<header class="mb-8 border-b-2 border-ink pb-6">
	{#if crumbs}<div class="mb-4"><Breadcrumbs items={crumbs} /></div>{/if}
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="max-w-3xl">
			<h1>{title}</h1>
			{#if lead}<p class="mt-3 max-w-prose text-lg text-ink-soft">{lead}</p>{/if}
		</div>
		{#if actions}<div class="flex flex-wrap gap-2">{@render actions()}</div>{/if}
	</div>
</header>
