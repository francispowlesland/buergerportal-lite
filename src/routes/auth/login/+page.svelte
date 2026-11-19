<script lang="ts">
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import TrustChallenge from '#lib/components/auth/TrustChallenge.svelte';
	import {
		TRUST_LABELS,
		TRUST_LEVELS,
		TRUST_METHODS,
		trustRank,
		type TrustLevel
	} from '#lib/trust.ts';

	let { data }: PageProps = $props();

	// Start at the level the page asked for (e.g. after being bounced from the Postkorb).
	// svelte-ignore state_referenced_locally
	let level = $state<TrustLevel>(data.required ?? 'basis');

	const identities = $derived(
		data.demoUsers.map((u) => ({ slug: u.slug, name: `${u.firstName} ${u.lastName}` }))
	);

	const blurb: Record<TrustLevel, string> = {
		basis: 'Für Auskünfte, Terminbuchungen und einfache Anträge.',
		substanziell: 'Für Anträge mit persönlichen Daten.',
		hoch: 'Für Bescheide, amtliche Nachweise und Sofortentscheidungen.'
	};
</script>

<svelte:head><title>Anmelden mit BundID – Bürgerportal Musterstadt</title></svelte:head>

<div class="mx-auto max-w-5xl">
	<PageHeader
		title="Anmelden mit BundID"
		lead="Wählen Sie, wie Sie sich ausweisen. Je höher das Vertrauensniveau, desto mehr Leistungen stehen Ihnen offen."
		crumbs={[{ label: 'Start', href: '/' }, { label: 'Anmelden' }]}
	/>

	{#if data.required}
		<div class="mb-6">
			<Alert tone="warn" title="Höheres Vertrauensniveau erforderlich">
				Für die gewünschte Seite brauchen Sie mindestens das Vertrauensniveau
				<strong>{TRUST_LABELS[data.required]}</strong>.
			</Alert>
		</div>
	{/if}

	<div class="grid gap-6 lg:grid-cols-[18rem_1fr]">
		<div role="radiogroup" aria-label="Vertrauensniveau" class="grid content-start gap-2">
			{#each TRUST_LEVELS as l (l)}
				<button
					type="button"
					role="radio"
					aria-checked={level === l}
					onclick={() => (level = l)}
					class="border-2 border-ink p-4 text-left {level === l
						? 'bg-amt-900 text-white'
						: 'bg-sheet hover:bg-amt-50'}"
				>
					<span class="flex items-baseline justify-between gap-2">
						<span class="font-display text-lg font-bold">{TRUST_LABELS[l]}</span>
						<span class="text-sm tabular-nums">
							{'●'.repeat(trustRank(l) + 1)}{'○'.repeat(2 - trustRank(l))}
						</span>
					</span>
					<span class="mt-1 block text-sm font-bold">{TRUST_METHODS[l]}</span>
					<span class="mt-1 block text-sm {level === l ? 'text-white/85' : 'text-ink-soft'}">
						{blurb[l]}
					</span>
				</button>
			{/each}
		</div>

		<section class="panel" aria-labelledby="login-h">
			<div class="panel-head">
				<h2 id="login-h" class="!text-base !font-bold">Vertrauensniveau {TRUST_LABELS[level]}</h2>
			</div>
			<div class="p-5">
				{#key level}
					<TrustChallenge {level} redirectTo={data.redirectTo} {identities} />
				{/key}
			</div>
		</section>
	</div>

	<p class="mt-8 max-w-prose text-sm text-ink-soft">
		Dies ist eine Demonstration. Es werden keine echten BundID-Konten oder Ausweise verwendet.
		Konten zum Ausprobieren: <strong>max</strong> (alle Niveaus), <strong>erika</strong> (nur
		Basis),
		<strong>hans</strong> (Sachbearbeiter).
	</p>
</div>
