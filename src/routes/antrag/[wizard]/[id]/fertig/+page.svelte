<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';
	import { formatDateTime } from '#lib/format.ts';
	let { data }: PageProps = $props();
</script>

<svelte:head><title>Antrag bestätigt – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title="Ihr Antrag ist eingegangen"
	lead={data.service.name}
	crumbs={[
		{ label: 'Startseite', href: '/' },
		{ label: 'Anträge', href: '/antrag' },
		{ label: 'Bestätigung' }
	]}
/>

<div class="max-w-3xl space-y-6">
	<Alert
		tone="ok"
		title={data.application.status === 'bewilligt'
			? 'Ihr Bescheid liegt bereit'
			: 'Eingang bestätigt'}
	>
		<p>
			{data.application.status === 'bewilligt'
				? 'Ihr Antrag wurde bewilligt. Den amtlichen Bescheid finden Sie in Ihrem Postkorb.'
				: 'Sie erhalten Nachrichten und den Bescheid zu Ihrem Antrag in Ihrem Postkorb.'}
		</p>
	</Alert>
	<section class="panel p-5" aria-labelledby="receipt-heading">
		<h2 id="receipt-heading" class="mb-4 text-xl">Antragsbestätigung</h2>
		<dl class="grid gap-4 sm:grid-cols-2">
			<div>
				<dt class="field-label">Aktenzeichen</dt>
				<dd class="aktenzeichen">{data.application.reference}</dd>
			</div>
			<div>
				<dt class="field-label">Status</dt>
				<dd><StatusStempel status={data.application.status} /></dd>
			</div>
			<div>
				<dt class="field-label">Antragsteller/in</dt>
				<dd>{data.user.firstName} {data.user.lastName}</dd>
			</div>
			<div>
				<dt class="field-label">Eingereicht am</dt>
				<dd>
					{data.application.submittedAt
						? formatDateTime(data.application.submittedAt)
						: 'Eingang erfasst'}
				</dd>
			</div>
			{#if data.service.wizardSlug === 'anwohnerparkausweis'}
				<div>
					<dt class="field-label">Kennzeichen und Parkzone</dt>
					<dd>
						{String(data.application.data.kennzeichen)} – Zone {String(
							data.application.data.parkzone
						)}
					</dd>
				</div>
				<div>
					<dt class="field-label">Nachweise</dt>
					<dd>{data.attachments.length} Dokument(e)</dd>
				</div>
			{:else if data.service.wizardSlug === 'briefwahl'}
				<div>
					<dt class="field-label">Zustellung</dt>
					<dd>
						{data.application.data.zustellung === 'abweichend'
							? 'An die angegebene abweichende Anschrift'
							: 'An Ihre Meldeanschrift'}
					</dd>
				</div>
			{/if}
		</dl>
	</section>
	<div class="flex flex-wrap gap-3">
		<a
			class="btn btn-primary"
			href={data.messageId
				? resolve('/postkorb/[id]', { id: String(data.messageId) })
				: resolve('/postkorb')}
		>
			Nachricht im Postkorb öffnen
		</a>
		<a class="btn" href={resolve('/antrag')}>Zur Antragsübersicht</a>
	</div>
</div>
