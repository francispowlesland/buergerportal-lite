<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import TrustBadge from '#lib/components/ui/TrustBadge.svelte';
	import { MESSAGE_KIND } from '#lib/labels.ts';
	import { formatDateTime } from '#lib/format.ts';
	import { TRUST_LABELS } from '#lib/trust.ts';
	import { FILTERS } from '#lib/components/postkorb/types.ts';

	let { data }: PageProps = $props();

	const unreadTotal = $derived(data.counts.ungelesen);
	const filterLabel = $derived(FILTERS.find((f) => f.key === data.filter)?.label ?? 'Alle');
</script>

<svelte:head>
	<title>Postkorb – Bürgerportal Musterstadt</title>
</svelte:head>

<PageHeader
	title="Postkorb"
	lead="Hier erhalten Sie Nachrichten, Nachforderungen und Bescheide zu Ihren Anträgen. Sie können direkt antworten und fehlende Unterlagen nachreichen."
	crumbs={[{ label: 'Startseite', href: '/' }, { label: 'Postkorb' }]}
>
	{#snippet actions()}
		{#if unreadTotal > 0}
			<form method="POST" action="?/alleGelesen" use:enhance>
				<button class="btn btn-sm">Alle lesbaren Nachrichten als gelesen markieren</button>
			</form>
		{/if}
	{/snippet}
</PageHeader>

<div class="space-y-6">
	{#if data.openRequests > 0}
		<Alert tone="warn" title="Es fehlen Unterlagen zu Ihrem Antrag">
			{data.openRequests === 1
				? 'Eine Nachforderung wartet auf Ihre Antwort.'
				: `${data.openRequests} Nachforderungen warten auf Ihre Antwort.`}
			Solange die Unterlagen fehlen, kann die Behörde Ihren Antrag nicht abschließen.
			<a href={resolve('/postkorb?filter=nachforderung')}>Nachforderungen anzeigen</a>
		</Alert>
	{/if}

	{#if data.lockedUnread > 0}
		<Alert tone="info" title="Geschützte Nachrichten">
			{data.lockedUnread === 1
				? 'Eine ungelesene Nachricht erfordert'
				: `${data.lockedUnread} ungelesene Nachrichten erfordern`}
			ein höheres Vertrauensniveau als Ihre aktuelle Anmeldung ({TRUST_LABELS[data.trust]}). Beim
			Öffnen werden Sie zur zusätzlichen Bestätigung aufgefordert.
		</Alert>
	{/if}

	<nav aria-label="Nachrichten filtern">
		<ul class="flex flex-wrap gap-2">
			{#each FILTERS as f (f.key)}
				{@const active = data.filter === f.key}
				<li>
					<a
						href={f.key === 'alle' ? resolve('/postkorb') : resolve(`/postkorb?filter=${f.key}`)}
						class="btn btn-sm {active ? 'btn-primary' : ''}"
						aria-current={active ? 'page' : undefined}
					>
						{f.label}
						<span class="font-normal">({data.counts[f.key]})</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<section aria-labelledby="liste-heading">
		<h2 id="liste-heading" class="visually-hidden">{filterLabel}</h2>

		{#if data.items.length === 0}
			{#if data.counts.alle === 0}
				<EmptyState title="Ihr Postkorb ist leer">
					Sobald Sie einen Antrag stellen, erhalten Sie hier Eingangsbestätigungen, Nachforderungen
					und Bescheide.
					{#snippet actions()}
						<a href={resolve('/antrag')} class="btn btn-primary">Antrag starten</a>
					{/snippet}
				</EmptyState>
			{:else}
				<EmptyState title="Keine Nachrichten in dieser Ansicht">
					Für den Filter „{filterLabel}“ liegt nichts vor.
					{#snippet actions()}
						<a href={resolve('/postkorb')} class="btn">Alle Nachrichten anzeigen</a>
					{/snippet}
				</EmptyState>
			{/if}
		{:else}
			<ul class="divide-y divide-rule border-2 border-ink bg-sheet">
				{#each data.items as m (m.id)}
					<li class={m.unread ? 'bg-amt-50' : ''}>
						<a
							href={resolve('/postkorb/[id]', { id: String(m.id) })}
							data-sveltekit-preload-data="false"
							class="grid gap-x-4 gap-y-1 p-4 no-underline hover:bg-amt-100 sm:grid-cols-[1fr_auto]"
						>
							<span class="flex min-w-0 flex-wrap items-center gap-2">
								{#if m.fromCitizen}
									<Stempel tone="neutral">Gesendet</Stempel>
								{:else}
									<Stempel tone={MESSAGE_KIND[m.kind].tone}>{MESSAGE_KIND[m.kind].label}</Stempel>
								{/if}
								{#if m.unread}
									<span class="stempel stempel-info">Neu</span>
								{/if}
								{#if m.actionRequired}
									<span class="stempel stempel-bad">Antwort erforderlich</span>
								{/if}
								{#if m.requiredTrust !== 'basis'}
									<TrustBadge
										level={m.requiredTrust}
										prefix={m.locked ? 'Erfordert' : 'Geschützt'}
									/>
								{/if}
							</span>
							<span class="text-sm text-ink-soft sm:text-right">
								<time datetime={m.createdAt.toISOString()}>{formatDateTime(m.createdAt)}</time>
							</span>
							<span class="min-w-0 sm:col-span-2">
								<span class="block {m.unread ? 'font-bold' : ''} text-ink">
									{m.subject}
									{#if m.unread}<span class="visually-hidden">(ungelesen)</span>{/if}
								</span>
								<span class="block text-sm text-ink-soft">
									{m.fromCitizen ? 'Ihre Antwort' : `Von ${m.fromName}`}
									{#if m.reference}
										, Aktenzeichen <span class="aktenzeichen">{m.reference}</span>
									{/if}
								</span>
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
