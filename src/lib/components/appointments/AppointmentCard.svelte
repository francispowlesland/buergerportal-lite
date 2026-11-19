<script lang="ts">
	import { resolve } from '$app/paths';
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import { formatDateLong, formatTime } from '#lib/format.ts';
	import type { AppointmentView } from './types.ts';

	let { appt, compact = false }: { appt: AppointmentView; compact?: boolean } = $props();
</script>

<article class="panel p-4 sm:p-5">
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<h3><a href={resolve('/termine/[code]', { code: appt.code })}>{appt.serviceName}</a></h3>
			<p class="mt-2 font-bold">
				<time datetime={appt.startsAt}>
					{formatDateLong(appt.startsAt)}, {formatTime(appt.startsAt)} Uhr
				</time>
			</p>
			<p>{appt.locationName}</p>
			{#if !compact}<p class="text-ink-soft">{appt.locationAddress}</p>{/if}
		</div>
		<Stempel tone={appt.phase === 'aktiv' ? 'ok' : 'neutral'}>
			{appt.phase === 'aktiv' ? 'Gebucht' : appt.phase === 'storniert' ? 'Abgesagt' : 'Vergangen'}
		</Stempel>
	</div>
	<div class="mt-4 flex flex-wrap items-center gap-3 border-t border-rule pt-3">
		<p>Termin-Code: <span class="aktenzeichen">{appt.code}</span></p>
		<a class="btn" href={resolve('/termine/[code]', { code: appt.code })}>Termindetails</a>
		{#if appt.phase === 'aktiv' && !compact}
			<a class="btn" href={resolve(`/termine/buchen?replaceCode=${appt.code}`)}>
				Termin verschieben
			</a>
			<a class="btn btn-ghost" href={resolve('/termine/[code]#absagen', { code: appt.code })}>
				Termin absagen
			</a>
		{/if}
	</div>
</article>
