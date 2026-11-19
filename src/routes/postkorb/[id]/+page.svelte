<script lang="ts">
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';
	import TrustBadge from '#lib/components/ui/TrustBadge.svelte';
	import StepUpModal from '#lib/components/auth/StepUpModal.svelte';
	import BescheidViewer from '#lib/components/postkorb/BescheidViewer.svelte';
	import ReplyForm from '#lib/components/postkorb/ReplyForm.svelte';
	import { enhance } from '$app/forms';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { MESSAGE_KIND } from '#lib/labels.ts';
	import { formatDateTime } from '#lib/format.ts';
	import { TRUST_LABELS, trustRank } from '#lib/trust.ts';
	import { formatBytes } from '#lib/components/postkorb/types.ts';

	let { data, form }: PageProps = $props();

	// The step-up dialog opens by itself on a locked message; it can be dismissed and reopened.
	let stepUp = $state(true);
	afterNavigate(() => (stepUp = true));

	const crumbs = [
		{ label: 'Startseite', href: '/' },
		{ label: 'Postkorb', href: '/postkorb' },
		{ label: 'Nachricht' }
	];
</script>

<svelte:head>
	<title>
		{data.locked ? 'Geschützte Nachricht' : data.message.subject} – Postkorb – Bürgerportal Musterstadt
	</title>
</svelte:head>

{#if data.locked}
	{@const head = data.head}
	{@const unreachable = trustRank(data.maxTrust) < trustRank(head.requiredTrust)}
	<PageHeader title={head.subject} {crumbs}>
		{#snippet actions()}
			<a href={resolve('/postkorb')} class="btn">Zurück zum Postkorb</a>
		{/snippet}
	</PageHeader>

	<div class="max-w-prose space-y-6">
		<div class="panel p-5">
			<div class="flex flex-wrap items-center gap-2">
				<Stempel tone={MESSAGE_KIND[head.kind].tone}>{MESSAGE_KIND[head.kind].label}</Stempel>
				<TrustBadge level={head.requiredTrust} prefix="Erfordert" />
			</div>
			<p class="mt-3 text-ink-soft">
				Von {head.fromName}, eingegangen am {formatDateTime(head.createdAt)}.
				{#if head.reference}
					Aktenzeichen <span class="aktenzeichen text-ink">{head.reference}</span>.
				{/if}
			</p>
		</div>

		{#if unreachable}
			<Alert tone="bad" title="Mit diesem Konto nicht abrufbar">
				Diese Nachricht erfordert das Vertrauensniveau {TRUST_LABELS[head.requiredTrust]}. Für Ihr
				Konto ist dieses Niveau nicht freigeschaltet. Bitte aktivieren Sie die
				Online-Ausweisfunktion bei Ihrem Bürgeramt.
			</Alert>
		{:else}
			<Alert tone="warn" title="Zusätzliche Bestätigung erforderlich">
				Sie sind mit dem Vertrauensniveau {TRUST_LABELS[data.trust]} angemeldet. Der Inhalt dieser Nachricht
				ist erst nach einer Bestätigung mit dem Vertrauensniveau
				<strong>{TRUST_LABELS[head.requiredTrust]}</strong> sichtbar.
				{#snippet actions()}
					<button type="button" class="btn btn-primary" onclick={() => (stepUp = true)}>
						Identität mit {TRUST_LABELS[head.requiredTrust]} bestätigen
					</button>
					<a
						href={resolve(
							`/auth/login?${new URLSearchParams({ min: head.requiredTrust, redirectTo: `/postkorb/${head.id}` })}`
						)}
						class="btn"
					>
						Ohne Dialog bestätigen
					</a>
				{/snippet}
			</Alert>
			<StepUpModal bind:open={stepUp} required={head.requiredTrust} />
		{/if}
	</div>
{:else}
	{@const m = data.message}
	<div class="no-print">
		<PageHeader title={m.subject} {crumbs}>
			{#snippet actions()}
				{#if data.bescheid}
					<button type="button" class="btn btn-primary" onclick={() => window.print()}>
						Bescheid drucken
					</button>
				{/if}
				<a href={resolve('/postkorb')} class="btn">Zurück zum Postkorb</a>
			{/snippet}
		</PageHeader>
	</div>

	<div class="space-y-8">
		<section class="no-print panel p-5" aria-label="Angaben zur Nachricht">
			<div class="flex flex-wrap items-center gap-2">
				{#if m.fromCitizen}
					<Stempel tone="neutral">Gesendet</Stempel>
				{:else}
					<Stempel tone={MESSAGE_KIND[m.kind].tone}>{MESSAGE_KIND[m.kind].label}</Stempel>
				{/if}
				{#if m.requiredTrust !== 'basis'}
					<TrustBadge level={m.requiredTrust} prefix="Geschützt:" />
				{/if}
				{#if data.case?.status}<StatusStempel status={data.case.status} />{/if}
			</div>
			<dl class="mt-4 grid max-w-prose grid-cols-[auto_1fr] gap-x-6 gap-y-1">
				<dt class="font-bold">{m.fromCitizen ? 'Absender' : 'Von'}</dt>
				<dd>{m.fromName}</dd>
				<dt class="font-bold">Datum</dt>
				<dd>{formatDateTime(m.createdAt)}</dd>
				{#if data.case}
					<dt class="font-bold">Antrag</dt>
					<dd>
						{data.case.serviceName},
						<span class="aktenzeichen">{data.case.reference}</span>
					</dd>
				{/if}
			</dl>
		</section>

		{#if data.bescheid}
			<BescheidViewer
				bescheid={data.bescheid}
				recipient={data.recipient}
				reference={data.case?.reference ?? null}
			/>
			<div class="no-print mx-auto flex max-w-[44rem] flex-wrap gap-2">
				<button type="button" class="btn btn-primary" onclick={() => window.print()}>
					Bescheid drucken
				</button>
				<p class="self-center text-sm text-ink-soft">
					Beim Drucken werden nur das Schreiben und der Prüfcode ausgegeben.
				</p>
			</div>
		{:else}
			<article class="no-print panel p-5 sm:p-8" aria-label="Nachrichtentext">
				<p class="max-w-prose whitespace-pre-line">{m.body}</p>
				{#if m.kind === 'bescheid'}
					<div class="mt-4">
						<Alert tone="warn" title="Bescheid nicht abrufbar">
							Zu dieser Nachricht liegt kein Bescheiddokument vor. Bitte wenden Sie sich an {data
								.case?.officeName ?? 'die Behörde'}.
						</Alert>
					</div>
				{/if}
			</article>
		{/if}

		{#if data.case && data.files.length > 0}
			<section class="no-print" aria-labelledby="dokumente-h">
				<h2 id="dokumente-h" class="mb-3 text-xl">Dokumente zum Antrag</h2>
				<table class="w-full max-w-3xl border-2 border-ink bg-sheet text-left">
					<thead class="bg-amt-50">
						<tr>
							<th scope="col" class="p-2">Dokument</th>
							<th scope="col" class="p-2">Nachweis</th>
							<th scope="col" class="p-2">Größe</th>
							<th scope="col" class="p-2">Eingereicht am</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-rule">
						{#each data.files as f (f.id)}
							<tr>
								<th scope="row" class="p-2 font-normal break-all">{f.filename}</th>
								<td class="p-2">{f.label}</td>
								<td class="p-2 whitespace-nowrap">{formatBytes(f.sizeBytes)}</td>
								<td class="p-2 whitespace-nowrap">{formatDateTime(f.createdAt)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{/if}

		{#if data.canReply && data.case}
			<div class="no-print max-w-3xl">
				<ReplyForm
					result={form?.reply}
					reference={data.case.reference}
					officeName={data.case.officeName}
					requestedDocument={data.requestedDocument}
				/>
			</div>
		{:else if data.replyBlockedReason}
			<p class="no-print max-w-prose text-ink-soft">{data.replyBlockedReason}</p>
		{/if}

		{#if data.related.length > 0}
			<section class="no-print" aria-labelledby="verlauf-h">
				<h2 id="verlauf-h" class="mb-3 text-xl">Weitere Nachrichten zu diesem Antrag</h2>
				<ul class="max-w-3xl divide-y divide-rule border-2 border-ink bg-sheet">
					{#each data.related as r (r.id)}
						<li>
							<a
								href={resolve('/postkorb/[id]', { id: String(r.id) })}
								data-sveltekit-preload-data="false"
								class="flex flex-wrap items-center justify-between gap-2 p-3 hover:bg-amt-100"
							>
								<span>
									{r.subject}
									{#if r.locked}<span class="text-sm text-ink-soft">(geschützt)</span>{/if}
								</span>
								<span class="text-sm text-ink-soft">{formatDateTime(r.createdAt)}</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if !m.fromCitizen}
			<form method="POST" action="?/ungelesen" class="no-print" use:enhance>
				<button class="btn btn-ghost btn-sm">Als ungelesen markieren</button>
			</form>
		{/if}
	</div>
{/if}
