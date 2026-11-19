<script lang="ts">
	/** Progress through a multi-step form. Steps are a real sequence, so they are numbered. */
	let { steps, current }: { steps: string[]; current: number } = $props();
</script>

<nav aria-label="Fortschritt">
	<p class="visually-hidden">Schritt {current + 1} von {steps.length}: {steps[current]}</p>
	<ol class="grid gap-2" style:grid-template-columns="repeat({steps.length}, minmax(0, 1fr))">
		{#each steps as step, i (step)}
			<li
				class="border-t-8 pt-2 text-sm {i < current
					? 'border-status-600'
					: i === current
						? 'border-amt-700 font-bold'
						: 'border-rule text-ink-soft'}"
				aria-current={i === current ? 'step' : undefined}
			>
				<span class="font-display font-bold tabular-nums">{i + 1}</span>
				<span class="hidden sm:inline">{step}</span>
				{#if i < current}<span class="visually-hidden">(erledigt)</span>{/if}
			</li>
		{/each}
	</ol>
</nav>
