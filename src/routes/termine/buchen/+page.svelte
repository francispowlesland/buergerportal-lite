<script lang="ts">
	import { resolve } from '$app/paths';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { enhance } from '$app/forms';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Stepper from '#lib/components/ui/Stepper.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import BookingCalendar from '#lib/components/appointments/BookingCalendar.svelte';
	import SlotGrid from '#lib/components/appointments/SlotGrid.svelte';
	import { formatDateLong, formatDateTime, formatFee } from '#lib/format.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	function bookingHref(params: Record<string, string | number>) {
		const query = new SvelteURLSearchParams(
			Object.entries(params).map(([key, value]) => [key, String(value)])
		);
		if (data.replaceCode) query.set('replaceCode', data.replaceCode);
		return resolve(`/termine/buchen?${query}`);
	}
	const selection = $derived({
		amt: data.office?.officeSlug ?? '',
		dienst: data.service?.serviceSlug ?? '',
		standort: data.selectedLocation?.id ?? ''
	});
</script>

<svelte:head>
	<title>{data.replacing ? 'Termin verschieben' : 'Termin buchen'} – Bürgerportal Musterstadt</title
	>
</svelte:head>

<PageHeader
	title={data.replacing ? 'Termin verschieben' : 'Termin buchen'}
	lead="Wählen Sie Ihr Anliegen, einen Standort und eine freie Uhrzeit. Die Buchung ist kostenfrei; Gebühren für die Leistung zahlen Sie vor Ort."
	crumbs={[
		{ label: 'Start', href: '/' },
		{ label: 'Termine', href: '/termine' },
		{ label: data.replacing ? 'Termin verschieben' : 'Termin buchen' }
	]}
/>

<div class="grid gap-6">
	<Stepper steps={['Amt', 'Leistung', 'Standort', 'Zeit und Buchung']} current={data.step} />
	{#if data.replacing}
		<Alert title="Ihr bisheriger Termin bleibt zunächst bestehen">
			<p>
				{data.replacing.serviceName}: {formatDateTime(data.replacing.startsAt)} bei {data.replacing
					.locationName}. Erst wenn der neue Termin gebucht ist, sagen wir den bisherigen Termin ab.
			</p>
			<p class="mt-2">
				Wenn Sie den bisherigen Termin in Ihrem Kalender gespeichert haben, entfernen Sie ihn dort
				und laden Sie nach dem Verschieben die neue Kalenderdatei herunter.
			</p>
			<a class="btn mt-3" href={resolve('/termine/[code]', { code: data.replacing.code })}>
				Verschieben abbrechen
			</a>
		</Alert>
	{/if}
	{#if form?.error}<Alert tone="bad" title="Termin nicht gebucht">{form.error}</Alert>{/if}
	{#if data.office}
		<section class="panel-quiet p-4" aria-label="Ihre Auswahl">
			<dl class="grid gap-3 sm:grid-cols-[auto_1fr]">
				<dt class="font-bold">Amt</dt>
				<dd>
					{data.office.officeName}
					{#if !data.replacing}<a class="ml-2 underline" href={resolve('/termine/buchen')}>
							Amt ändern
						</a>{/if}
				</dd>
				{#if data.service}<dt class="font-bold">Leistung</dt>
					<dd>
						{data.service.serviceName}
						{#if !data.replacing}<a
								class="ml-2 underline"
								href={bookingHref({ amt: data.office.officeSlug })}
							>
								Leistung ändern
							</a>{/if}
					</dd>{/if}
				{#if data.selectedLocation}<dt class="font-bold">Standort</dt>
					<dd>
						{data.selectedLocation.name}, {data.selectedLocation.street}
						<a
							class="ml-2 underline"
							href={bookingHref({ amt: selection.amt, dienst: selection.dienst })}
						>
							Standort ändern
						</a>
					</dd>{/if}
			</dl>
		</section>
	{/if}

	{#if data.step === 0}
		<section aria-labelledby="amt-h">
			<h2 id="amt-h" class="mb-4">Bei welchem Amt?</h2>
			<ul class="panel divide-y divide-rule">
				{#each data.bookableOffices as office (office.officeId)}
					<li class="flex flex-wrap items-center justify-between gap-3 p-4">
						<h3>{office.officeName}</h3>
						<a
							class="btn btn-primary"
							href={bookingHref({ amt: office.officeSlug })}
							aria-label="Amt wählen: {office.officeName}"
						>
							Amt wählen
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{:else if data.step === 1 && data.office}
		<section aria-labelledby="leistung-h">
			<h2 id="leistung-h" class="mb-4">Worum geht es?</h2>
			<ul class="panel divide-y divide-rule">
				{#each data.allBookable.filter((s) => s.officeId === data.office?.officeId) as service (service.serviceId)}
					<li class="flex flex-wrap items-center justify-between gap-3 p-4">
						<h3>{service.serviceName}</h3>
						<a
							class="btn btn-primary"
							href={bookingHref({ amt: service.officeSlug, dienst: service.serviceSlug })}
							aria-label="Leistung wählen: {service.serviceName}"
						>
							Leistung wählen
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{:else if data.step === 2 && data.service}
		<section aria-labelledby="standort-h">
			<h2 id="standort-h" class="mb-4">Welcher Standort passt für Sie?</h2>
			<ul class="panel divide-y divide-rule">
				{#each data.availableLocations as location (location.id)}
					<li class="flex flex-wrap items-center justify-between gap-3 p-4">
						<div>
							<h3>{location.name}</h3>
							<p class="mt-1 text-ink-soft">
								{location.street}, {location.postalCode}
								{location.city}
							</p>
						</div>
						<a
							class="btn btn-primary"
							href={bookingHref({
								amt: selection.amt,
								dienst: selection.dienst,
								standort: location.id
							})}
							aria-label="Freie Termine ansehen: {location.name}"
						>
							Freie Termine ansehen
						</a>
					</li>
				{/each}
			</ul>
			{#if data.availableLocations.length === 0}<Alert title="Kein Standort verfügbar">
					Bitte wählen Sie eine andere Leistung.
				</Alert>{/if}
		</section>
	{:else if data.calendarData && data.service && data.selectedLocation}
		<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)]">
			<section aria-labelledby="datum-h" class="min-w-0">
				<h2 id="datum-h" class="mb-4">Datum wählen</h2>
				<BookingCalendar
					month={data.calendarData.month}
					weeks={data.calendarData.calendar}
					previousHref={data.calendarData.prevMonth
						? bookingHref({ ...selection, monat: data.calendarData.prevMonth })
						: null}
					nextHref={data.calendarData.nextMonth
						? bookingHref({ ...selection, monat: data.calendarData.nextMonth })
						: null}
				/>
				<p class="mt-3 text-sm text-ink-soft">
					Termine sind bis zu 28 Tage im Voraus und spätestens 2 Stunden vor Beginn buchbar.
				</p>
			</section>
			<aside class="panel-quiet p-4" aria-labelledby="vorbereitung-h">
				<h2 id="vorbereitung-h" class="text-xl">Für Ihren Besuch</h2>
				<p class="mt-3">Gebühr der Leistung: <strong>{formatFee(data.service.feeCents)}</strong></p>
				{#if data.service.feeNote}<p class="mt-1 text-sm text-ink-soft">
						{data.service.feeNote}
					</p>{/if}
				<h3 class="mt-4 text-base">Bitte mitbringen</h3>
				<ul class="mt-2 list-disc space-y-1 pl-5">
					{#each data.service.documents as document (document)}<li>{document}</li>{/each}
				</ul>
			</aside>
		</div>
		<section id="uhrzeiten" aria-labelledby="uhrzeiten-h">
			<h2 id="uhrzeiten-h" class="mb-4">
				{data.datum ? formatDateLong(`${data.datum}T12:00:00Z`) : 'Uhrzeit wählen'}
			</h2>
			{#if !data.datum}<p>Wählen Sie im Kalender einen Tag mit freien Terminen.</p>
			{:else if !data.calendarData.slots.some((slot) => slot.free)}<Alert
					tone="warn"
					title="Keine freien Uhrzeiten"
				>
					Für diesen Tag ist kein Termin mehr buchbar. Bitte wählen Sie einen anderen Tag.
				</Alert>
			{:else}
				<form method="POST" use:enhance class="panel grid gap-5 p-4 sm:p-6">
					<input type="hidden" name="dienst" value={data.service.serviceSlug} /><input
						type="hidden"
						name="standort"
						value={data.selectedLocation.id}
					/><input type="hidden" name="datum" value={data.datum} />
					{#if data.replaceCode}<input
							type="hidden"
							name="replaceCode"
							value={data.replaceCode}
						/>{/if}
					<SlotGrid slots={data.calendarData.slots} />
					<p class="max-w-prose text-sm text-ink-soft">
						Die Uhrzeit wird erst mit Ihrer Buchung verbindlich reserviert. Sie erhalten
						anschließend Ihren Termin-Code und eine Bestätigung im Postkorb.
					</p>
					<button class="btn btn-primary justify-self-start" type="submit">
						{data.replacing ? 'Termin verschieben' : 'Termin buchen'}
					</button>
				</form>
			{/if}
		</section>
	{/if}
</div>
