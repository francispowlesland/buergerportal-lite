<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import StatusStempel from '#lib/components/ui/StatusStempel.svelte';
	import TrustBadge from '#lib/components/ui/TrustBadge.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { formatDateTime, formatFee } from '#lib/format.ts';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Anträge und Online-Dienste – Bürgerportal Musterstadt</title>
</svelte:head>

<PageHeader
	title="Anträge und Online-Dienste"
	lead="Starten Sie einen neuen Antrag oder setzen Sie einen gespeicherten Entwurf fort."
	crumbs={[{ label: 'Startseite', href: '/' }, { label: 'Anträge' }]}
/>

<div class="space-y-12">
	<!-- ABSCHNITT 1: Ihre Anträge -->
	<section aria-labelledby="meine-antraege-heading">
		<div class="mb-4 flex items-center justify-between border-b border-rule pb-2">
			<h2 id="meine-antraege-heading" class="text-xl font-bold text-ink">Ihre Anträge</h2>
			<span class="text-sm text-ink-soft">
				{data.applications.length}
				{data.applications.length === 1 ? 'Eintrag' : 'Einträge'}
			</span>
		</div>

		{#if data.applications.length === 0}
			<EmptyState title="Keine Anträge vorhanden">
				<p>
					Sie haben bisher keine Anträge eingereicht oder Entwürfe gespeichert. Wählen Sie unten
					einen Online-Dienst, um einen Antrag zu starten.
				</p>
			</EmptyState>
		{:else}
			<div class="divide-y divide-rule border border-ink bg-sheet">
				{#each data.applications as { application, service } (application.id)}
					<div class="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
						<div class="space-y-1">
							<div class="flex flex-wrap items-center gap-2">
								<StatusStempel status={application.status} />
								<span class="font-display font-bold text-ink sm:text-lg">
									{service.name}
								</span>
							</div>

							<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
								<span>
									Aktenzeichen: <span class="aktenzeichen font-bold text-ink">
										{application.reference}
									</span>
								</span>
								<span>•</span>
								<span>
									Aktualisiert am: {formatDateTime(application.updatedAt)}
								</span>
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-2">
							{#if application.status === 'entwurf'}
								<a
									href={resolve('/antrag/[wizard]/[id]', {
										wizard: service.wizardSlug!,
										id: String(application.id)
									})}
									class="btn btn-primary btn-sm"
								>
									Entwurf fortsetzen
								</a>
							{:else if application.status === 'bewilligt'}
								<a href={resolve('/postkorb')} class="btn btn-sm"> Bescheid im Postkorb öffnen </a>
								<a
									href={resolve('/antrag/[wizard]/[id]/fertig', {
										wizard: service.wizardSlug!,
										id: String(application.id)
									})}
									class="btn btn-ghost btn-sm"
								>
									Details
								</a>
							{:else}
								<a
									href={resolve('/antrag/[wizard]/[id]/fertig', {
										wizard: service.wizardSlug!,
										id: String(application.id)
									})}
									class="btn btn-sm"
								>
									Details anzeigen
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<!-- ABSCHNITT 2: Neuen Antrag starten -->
	<section aria-labelledby="neue-antraege-heading">
		<div class="mb-4 border-b border-rule pb-2">
			<h2 id="neue-antraege-heading" class="text-xl font-bold text-ink">Neuen Antrag starten</h2>
			<p class="text-sm text-ink-soft">
				Wählen Sie ein Anliegen aus, um den Online-Assistenten zu öffnen.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			{#each data.availableServices as service (service.id)}
				<div class="panel flex flex-col justify-between p-5">
					<div class="space-y-3">
						<div class="flex items-center justify-between gap-2">
							<TrustBadge level={service.requiredTrust} />
							<span class="text-xs font-bold text-ink-soft">{service.processingTime}</span>
						</div>

						<h3 class="text-lg font-bold text-ink">
							{service.name}
						</h3>

						<p class="text-sm text-ink-soft">
							{service.summary}
						</p>

						<div class="border-t border-rule pt-2 text-xs font-medium text-ink-soft">
							Gebühr: <strong class="text-ink">{formatFee(service.feeCents)}</strong>
							{#if service.feeNote}
								<span>({service.feeNote})</span>
							{/if}
						</div>
					</div>

					<div class="mt-6 border-t border-rule pt-4">
						<a
							href={resolve('/antrag/[wizard]', { wizard: service.wizardSlug! })}
							class="btn btn-primary w-full"
						>
							Antrag starten
						</a>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
