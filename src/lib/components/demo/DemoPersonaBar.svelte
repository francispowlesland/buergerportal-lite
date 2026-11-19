<script lang="ts">
	import { page } from '$app/state';
	import { PERSONAS } from '#lib/personas.ts';
	import { TRUST_LABELS, type TrustLevel } from '#lib/trust.ts';

	let { slug, trust }: { slug: string | null; trust: TrustLevel | null } = $props();

	let open = $state(false);

	const active = $derived(
		PERSONAS.find((p) => p.slug === slug && p.trust === trust) ?? PERSONAS[0]
	);
</script>

<aside
	class="no-print fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-ink text-paper"
	aria-label="Demo-Rollenwechsel"
>
	<div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-sm">
		<button
			type="button"
			class="flex min-h-10 items-center gap-2 font-bold"
			aria-expanded={open}
			aria-controls="persona-list"
			onclick={() => (open = !open)}
		>
			<span
				class="rounded-sm bg-ortsschild px-1.5 py-0.5 text-xs font-extrabold text-ortsschild-ink"
			>
				DEMO
			</span>
			Angemeldet als: {active.label}
			<span class="font-normal text-paper/75">({active.detail})</span>
			<span aria-hidden="true">{open ? '▾' : '▴'}</span>
		</button>

		{#if open}
			<form id="persona-list" method="POST" action="/auth/persona" class="flex flex-wrap gap-2">
				<input type="hidden" name="redirectTo" value={page.url.pathname + page.url.search} />
				{#each PERSONAS as p (p.key)}
					<button
						name="persona"
						value={p.key}
						aria-pressed={p === active}
						class="min-h-10 border-2 px-3 text-left {p === active
							? 'border-ortsschild bg-ortsschild text-ortsschild-ink'
							: 'border-paper/60 hover:bg-paper/10'}"
					>
						<span class="block leading-tight font-bold">{p.label}</span>
						<span class="block text-xs leading-tight opacity-80">
							{p.trust ? `Vertrauensniveau ${TRUST_LABELS[p.trust]}` : p.detail}
						</span>
					</button>
				{/each}
			</form>
		{/if}
	</div>
</aside>
