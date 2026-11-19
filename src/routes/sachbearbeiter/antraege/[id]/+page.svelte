<script lang="ts">
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';
	import AuditTrail from '#lib/components/admin/AuditTrail.svelte';
	import DecisionPanel from '#lib/components/admin/DecisionPanel.svelte';
	import { scopeHref } from '#lib/components/admin/scope.ts';
	import { ageText, formatBytes } from '#lib/components/admin/helpers.ts';
	import { formatDate, formatDateTime } from '#lib/format.ts';

	let { data, form }: PageProps = $props();

	const app = $derived(data.application);
</script>

<svelte:head>
	<title>Antrag {app.reference} – Sachbearbeitung – Bürgerportal Musterstadt</title>
</svelte:head>

<PageHeader
	title="Antrag {app.reference}"
	lead="{data.service.name}, {data.service.officeName}"
	crumbs={[
		{ label: 'Sachbearbeitung', href: scopeHref('/sachbearbeiter', data.scope) },
		{ label: 'Anträge', href: scopeHref('/sachbearbeiter/antraege', data.scope) },
		{ label: app.reference }
	]}
>
	{#snippet actions()}
		<StatusStempel status={app.status} />
	{/snippet}
</PageHeader>

<div class="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
	<div class="grid gap-6">
		<section class="panel" aria-labelledby="antragsteller-h">
			<h2 class="panel-head" id="antragsteller-h">Antragsteller/in</h2>
			<dl class="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-[10rem_1fr]">
				<dt class="text-ink-soft">Name</dt>
				<dd class="font-bold">{data.citizen.name}</dd>
				<dt class="text-ink-soft">Geburtsdatum</dt>
				<dd>{data.citizen.birthDate ?? 'nicht hinterlegt'}</dd>
				<dt class="text-ink-soft">Anschrift</dt>
				<dd>{data.citizen.address || 'nicht hinterlegt'}</dd>
				<dt class="text-ink-soft">E-Mail</dt>
				<dd>{data.citizen.email}</dd>
				<dt class="text-ink-soft">Steuer-ID (gekürzt)</dt>
				<dd class="aktenzeichen">{data.citizen.steuerId}</dd>
			</dl>
		</section>

		<section class="panel" aria-labelledby="angaben-h">
			<h2 class="panel-head" id="angaben-h">Angaben im Antrag</h2>
			{#if data.fields.length === 0}
				<p class="p-4 text-ink-soft">Im Antrag wurden keine Angaben gespeichert.</p>
			{:else}
				<dl class="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-[10rem_1fr]">
					{#each data.fields as field (field.label)}
						<dt class="text-ink-soft">{field.label}</dt>
						<dd>
							{#if Array.isArray(field.value)}
								<ul class="list-disc pl-5">
									{#each field.value as line (line)}<li>{line}</li>{/each}
								</ul>
							{:else}
								{field.value}
							{/if}
						</dd>
					{/each}
				</dl>
			{/if}
			<p class="border-t border-rule px-4 py-3 text-sm text-ink-soft">
				Eingereicht am {app.submittedAt ? formatDateTime(app.submittedAt) : 'unbekannt'}
				{#if app.ageDays !== null}(vor {ageText(app.ageDays)}){/if}. Zuständig: {app.assigneeName ??
					'noch niemand'}.
			</p>
		</section>

		<section class="panel" aria-labelledby="nachweise-h">
			<h2 class="panel-head" id="nachweise-h">Nachweise</h2>
			{#if data.attachments.length === 0}
				<p class="p-4 text-ink-soft">
					Es wurden keine Dokumente hochgeladen.
					{#if data.service.documents.length > 0}
						Laut Leistungsbeschreibung werden üblicherweise verlangt: {data.service.documents.join(
							', '
						)}.
					{/if}
				</p>
			{:else}
				<ul class="divide-y divide-rule">
					{#each data.attachments as att (att.id)}
						<li class="p-4">
							<p class="font-bold">{att.label}</p>
							<p class="text-sm text-ink-soft">
								{att.filename}, {formatBytes(att.sizeBytes)}, hochgeladen am {formatDate(
									att.createdAt
								)}
							</p>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="panel" aria-labelledby="verlauf-h">
			<h2 class="panel-head" id="verlauf-h">Verlauf</h2>
			<div class="p-4"><AuditTrail events={data.events} /></div>
		</section>
	</div>

	<div class="grid gap-6 lg:sticky lg:top-4">
		{#if data.bescheid}
			<section class="panel" aria-labelledby="bescheid-h">
				<h2 class="panel-head" id="bescheid-h">Bescheid {data.bescheid.number}</h2>
				<div class="grid gap-2 p-4">
					<p class="text-sm text-ink-soft">
						Erteilt am {formatDateTime(data.bescheid.issuedAt)}{data.bescheid.issuedByName
							? ` von ${data.bescheid.issuedByName}`
							: ''}. Prüfcode: <span class="aktenzeichen">{data.bescheid.verificationCode}</span>
					</p>
					<p class="font-serif whitespace-pre-line">{data.bescheid.bodyText}</p>
				</div>
			</section>
		{/if}

		{#if app.status === 'entwurf'}
			<Alert tone="warn" title="Entwurf">Entwürfe können nicht bearbeitet werden.</Alert>
		{:else}
			<DecisionPanel
				status={app.status}
				canDecide={data.canDecide}
				officeName={data.service.officeName}
				{form}
			/>
		{/if}
	</div>
</div>
