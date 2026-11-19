<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	let { lebenslagen }: { lebenslagen: { key: string; label: string; count: number }[] } = $props();
</script>

<ul class="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
	{#each lebenslagen as lage (lage.key)}
		<li class="border-b border-rule">
			<a
				href="/dienste?lebenslage={lage.key}"
				class="flex min-h-11 items-baseline justify-between gap-3 py-3 font-bold"
			>
				<span>{lage.label}</span>
				<span class="text-sm font-normal whitespace-nowrap text-ink-soft">
					{lage.count}
					{lage.count === 1 ? 'Leistung' : 'Leistungen'}
				</span>
			</a>
		</li>
	{/each}
</ul>
