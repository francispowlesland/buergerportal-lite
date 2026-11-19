<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- callers supply portal-relative breadcrumb URLs */
	let { items }: { items: { label: string; href?: string }[] } = $props();
</script>

<nav aria-label="Brotkrumen" class="text-sm">
	<ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-soft">
		{#each items as item, i (item.label + i)}
			<li class="flex items-center gap-2">
				{#if item.href && i < items.length - 1}
					<a href={item.href}>{item.label}</a>
					<span aria-hidden="true">/</span>
				{:else}
					<span aria-current="page" class="font-bold text-ink">{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
