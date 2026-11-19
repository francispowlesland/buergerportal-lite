<script lang="ts">
	import type { PageProps } from './$types';
	import { a11y } from '#lib/a11y.svelte.ts';
	import AppointmentList from '#lib/components/home/AppointmentList.svelte';
	import ApplicationTable from '#lib/components/home/ApplicationTable.svelte';
	import InboxSummary from '#lib/components/home/InboxSummary.svelte';
	import QuickLinks from '#lib/components/home/QuickLinks.svelte';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import TrustBadge from '#lib/components/ui/TrustBadge.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Mein Bürgerportal – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title="Guten Tag, {data.firstName} {data.lastName}"
	lead={a11y.leicht
		? 'Hier sehen Sie, was offen ist. Anträge. Termine. Neue Post vom Amt.'
		: 'Hier sehen Sie, was bei Ihnen offen ist: Anträge, Termine und neue Post vom Amt.'}
	crumbs={[{ label: 'Start', href: '/' }, { label: 'Mein Bürgerportal' }]}
>
	{#snippet actions()}
		<TrustBadge level={data.trust} prefix="Angemeldet mit Vertrauensniveau" />
	{/snippet}
</PageHeader>

<div class="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
	<div class="grid gap-10">
		<InboxSummary unreadCount={data.unreadCount} messages={data.unreadMessages} />
		<ApplicationTable applications={data.applications} decidedCount={data.decidedCount} />
		<AppointmentList appointments={data.appointments} />
	</div>
	<aside aria-label="Weitere Wege" class="lg:sticky lg:top-4">
		<QuickLinks />
	</aside>
</div>
