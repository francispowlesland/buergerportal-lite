<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ServiceListItem } from '#lib/server/services.ts';
	import ServiceStamps from './ServiceStamps.svelte';
	import { feeText } from './search.ts';

	/** One entry in the A–Z list. */
	let { service }: { service: ServiceListItem } = $props();
</script>

<li
	class="grid gap-x-6 gap-y-2 border-b border-rule py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_18rem]"
>
	<div>
		<h3 class="text-lg">
			<a href={resolve('/dienste/[slug]', { slug: service.slug })}>{service.name}</a>
		</h3>
		<p class="mt-1 max-w-prose text-ink-soft">{service.summary}</p>
		{#if service.action === 'efa' && service.efaProvider}
			<p class="mt-1 text-sm">
				<span class="font-bold">Betrieben von:</span>
				{service.efaProvider}
			</p>
		{/if}
	</div>
	<div class="grid content-start gap-2">
		<ServiceStamps {service} officeName={service.officeName} />
		<dl class="grid gap-y-0.5 text-sm">
			<div class="flex gap-1.5">
				<dt class="font-bold">Gebühr:</dt>
				<dd>{feeText(service.feeCents, service.feeNote)}</dd>
			</div>
			<div class="flex gap-1.5">
				<dt class="font-bold">Dauer:</dt>
				<dd>{service.processingTime}</dd>
			</div>
		</dl>
	</div>
</li>
