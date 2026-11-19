<script lang="ts">
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import TrustBadge from '#lib/components/ui/TrustBadge.svelte';
	import type { TrustLevel } from '#lib/trust.ts';

	/** The small rubber stamps of a service: what you can do online and how sure we must be of you. */
	let {
		service,
		officeName
	}: {
		service: {
			action: 'antrag' | 'termin' | 'efa' | 'info';
			requiredTrust: TrustLevel;
		};
		officeName?: string;
	} = $props();
</script>

<ul class="flex flex-wrap gap-1.5" aria-label="Eigenschaften der Leistung">
	{#if officeName}
		<li><Stempel tone="neutral">{officeName}</Stempel></li>
	{/if}
	{#if service.action === 'antrag'}
		<li><Stempel tone="info">Online beantragen</Stempel></li>
	{:else if service.action === 'termin'}
		<li><Stempel tone="info">Termin</Stempel></li>
	{:else if service.action === 'efa'}
		<li>
			<Stempel tone="neutral">
				EfA<span class="visually-hidden">
					(Einer für Alle: Online-Dienst eines anderen Landes)
				</span>
			</Stempel>
		</li>
	{/if}
	{#if service.requiredTrust !== 'basis'}
		<li><TrustBadge level={service.requiredTrust} /></li>
	{/if}
</ul>
