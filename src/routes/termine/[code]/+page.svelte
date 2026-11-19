<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import { formatDateLong, formatTime, formatFee } from '#lib/format.ts';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
	const appt = $derived(data.appointment);
</script>

<svelte:head>
	<title
		>{appt.phase === 'aktiv' ? 'Terminbestätigung' : 'Termindetails'} – Bürgerportal Musterstadt</title
	>
</svelte:head>

<PageHeader
	title={appt.phase === 'aktiv' ? 'Ihr Termin ist gebucht' : 'Ihr Termin'}
	lead={appt.phase === 'aktiv'
		? 'Bringen Sie Ihren Termin-Code und die unten genannten Unterlagen mit. Bitte kommen Sie zehn Minuten vor Beginn.'
		: 'Den aktuellen Stand Ihres Termins sehen Sie auf diesem Terminzettel.'}
	crumbs={[
		{ label: 'Start', href: '/' },
		{ label: 'Termine', href: '/termine' },
		{ label: appt.code }
	]}
/>

<div class="grid gap-6">
	{#if form?.error}<Alert tone="bad" title="Termin nicht abgesagt">{form.error}</Alert>{/if}
	{#if form?.cancelled}<Alert tone="ok" title="Termin abgesagt">
			Der Termin ist freigegeben. Sie finden die Absage auch in Ihrem Postkorb.
		</Alert>{/if}
	<article class="panel p-5 sm:p-8" aria-labelledby="terminzettel-h">
		<div class="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-5">
			<div>
				<h2 id="terminzettel-h">Terminzettel</h2>
				<p class="mt-2">Stadt Musterstadt</p>
			</div>
			<Stempel tone={appt.phase === 'aktiv' ? 'ok' : 'neutral'}>
				{appt.phase === 'aktiv' ? 'Gebucht' : appt.phase === 'storniert' ? 'Abgesagt' : 'Vergangen'}
			</Stempel>
		</div>
		<div class="mt-6 grid gap-6 sm:grid-cols-[minmax(0,1fr)_12rem]">
			<div>
				<p>Ihr Termin-Code</p>
				<p class="aktenzeichen mt-1 text-3xl font-bold break-all">{appt.code}</p>
				<dl class="mt-6 grid gap-1">
					<dt class="font-bold">Anliegen</dt>
					<dd class="mb-3">{appt.serviceName}</dd>
					<dt class="font-bold">Wann</dt>
					<dd class="mb-3">
						<time datetime={appt.startsAt}>
							{formatDateLong(appt.startsAt)}, {formatTime(appt.startsAt)} Uhr
						</time><br />Dauer: {appt.durationMin} Minuten
					</dd>
					<dt class="font-bold">Wo</dt>
					<dd class="mb-3">{appt.locationName}<br />{appt.locationAddress}</dd>
					<dt class="font-bold">Für</dt>
					<dd>{data.citizenName}</dd>
				</dl>
			</div>
			{#if data.qr}<figure>
					<img src={data.qr} width="192" height="192" alt="QR-Code mit Termin-Code {appt.code}" />
					<figcaption class="mt-2 text-sm text-ink-soft">
						Diesen Code können Sie am Empfang vorzeigen. Alternativ nennen Sie Ihren Termin-Code.
					</figcaption>
				</figure>{/if}
		</div>
		{#if appt.phase === 'aktiv'}
			<div class="mt-6 border-t border-rule pt-5">
				<h3>Bitte mitbringen</h3>
				<ul class="mt-2 list-disc space-y-1 pl-5">
					{#each data.documents as document (document)}<li>{document}</li>{/each}
				</ul>
				<p class="mt-4">Gebühr der Leistung: <strong>{formatFee(data.feeCents)}</strong></p>
				{#if data.feeNote}<p class="text-sm text-ink-soft">{data.feeNote}</p>{/if}
			</div>
		{/if}
	</article>
	<div class="no-print flex flex-wrap gap-3">
		{#if appt.phase === 'aktiv'}<a
				class="btn btn-primary"
				href={resolve('/termine/[code]/kalender.ics', { code: appt.code })}
				download
			>
				Kalenderdatei herunterladen (ICS)
			</a><button class="btn" type="button" onclick={() => window.print()}>
				Terminzettel drucken
			</button><a class="btn" href={resolve(`/termine/buchen?replaceCode=${appt.code}`)}>
				Termin verschieben
			</a>{/if}
		<a class="btn" href={resolve('/termine')}>Meine Termine ansehen</a>
	</div>
	{#if appt.phase === 'aktiv'}
		<section id="absagen" class="panel-quiet no-print p-5" aria-labelledby="absagen-h">
			<h2 id="absagen-h" class="text-xl">Termin absagen</h2>
			<details class="mt-3">
				<summary class="min-h-11 cursor-pointer py-2 font-bold text-signal-800">
					Ich kann den Termin nicht wahrnehmen
				</summary>
				<p class="mt-2 max-w-prose">
					Mit „Termin verbindlich absagen“ geben Sie diesen Termin frei. Diese Absage können Sie
					nicht rückgängig machen. Wenn Sie eine andere Uhrzeit brauchen, wählen Sie stattdessen
					„Termin verschieben“.
				</p>
				<form method="POST" action="?/cancel" use:enhance class="mt-4">
					<button class="btn btn-danger" type="submit">Termin verbindlich absagen</button>
				</form>
			</details>
		</section>
	{:else if appt.phase === 'storniert'}<Alert title="Dieser Termin findet nicht statt">
			<p>Bereits gespeicherte Kalendereinträge müssen Sie selbst entfernen.</p>
			Sie können bei Bedarf einen neuen Termin buchen.<a
				class="underline"
				href={resolve('/termine/buchen')}
			>
				Termin buchen
			</a>
		</Alert>{/if}
</div>

<style>
	@media print {
		article {
			break-inside: avoid;
		}
	}
</style>
