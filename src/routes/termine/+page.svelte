<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import AppointmentCard from '#lib/components/appointments/AppointmentCard.svelte';

	let { data }: PageProps = $props();

	const future = $derived(data.appointments.filter((a) => a.phase === 'aktiv').toReversed());
	const past = $derived(data.appointments.filter((a) => a.phase !== 'aktiv'));
</script>

<svelte:head><title>Termine – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title="Terminvereinbarung"
	lead="Buchen Sie einen Termin bei einem Amt der Stadt Musterstadt. Wählen Sie zunächst die gewünschte Leistung."
	crumbs={[{ label: 'Start', href: '/' }, { label: 'Termine' }]}
/>

<div class="grid gap-10">
	<!-- Booking entry -->
	<section aria-labelledby="buchen-h">
		<h2 id="buchen-h" class="mb-4 text-xl font-semibold">Neuen Termin buchen</h2>
		<div class="grid gap-4">
			{#each data.officeGroups as group (group.officeSlug)}
				<div class="panel panel-quiet">
					<div class="panel-head">
						<h3 class="font-semibold">{group.officeName}</h3>
					</div>
					<ul class="divide-y divide-rule px-4">
						{#each group.services as svc (svc.serviceId)}
							<li class="flex flex-wrap items-center justify-between gap-4 py-3">
								<span>{svc.serviceName}</span>
								<a
									href={resolve(`/termine/buchen?amt=${svc.officeSlug}&dienst=${svc.serviceSlug}`)}
									class="btn btn-primary shrink-0"
									aria-label="Termin buchen: {svc.serviceName}"
								>
									Termin buchen
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<!-- Upcoming appointments -->
	<section aria-labelledby="meine-termine-h">
		<h2 id="meine-termine-h" class="mb-4 text-xl font-semibold">Meine Termine</h2>
		{#if future.length === 0}
			<EmptyState title="Sie haben keine bevorstehenden Termine">
				Buchen Sie oben einen Termin bei einem Amt.
			</EmptyState>
		{:else}
			<ul class="grid gap-4">
				{#each future as appt (appt.code)}
					<li>
						<AppointmentCard {appt} />
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<!-- Past / cancelled -->
	{#if past.length > 0}
		<section aria-labelledby="vergangen-h">
			<h2 id="vergangen-h" class="mb-4 text-xl font-semibold">Vergangene und abgesagte Termine</h2>
			<ul class="grid gap-3">
				{#each past as appt (appt.code)}
					<li>
						<AppointmentCard {appt} compact />
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
