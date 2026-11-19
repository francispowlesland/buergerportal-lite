<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import type { PageProps } from './$types';
	import Leicht from '#lib/components/ui/Leicht.svelte';
	import Ortsschild from '#lib/components/ui/Ortsschild.svelte';
	import EntryPoints from '#lib/components/home/EntryPoints.svelte';
	import LebenslagenList from '#lib/components/home/LebenslagenList.svelte';
	import ServiceSearch from '#lib/components/home/ServiceSearch.svelte';
	import { HOME } from '#lib/personas.ts';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Startseite – Bürgerportal Musterstadt</title></svelte:head>

<section aria-labelledby="start-h" class="mb-10 border-b-2 border-ink pb-8">
	<Ortsschild size="lg" />
	<h1 id="start-h" class="mt-6 max-w-3xl">
		<Leicht
			standard="Behördengänge von zu Hause erledigen"
			leicht="Ämter-Sachen online erledigen"
		/>
	</h1>
	<p class="mt-3 max-w-prose text-lg text-ink-soft">
		<Leicht
			standard="Im Bürgerportal der Stadt Musterstadt finden Sie {data.serviceCount} Leistungen der Verwaltung. Sie suchen, beantragen, buchen Termine und lesen Ihre Bescheide an einem Ort."
			leicht="Hier finden Sie {data.serviceCount} Leistungen der Stadt Musterstadt. Sie können Anträge stellen. Sie können Termine machen. Sie können Post vom Amt lesen."
		/>
	</p>
	{#if data.session}
		<p class="mt-5">
			<a href={HOME[data.session.role]} class="btn btn-primary">
				{data.session.role === 'caseworker' ? 'Zur Sachbearbeitung' : 'Zu Mein Bürgerportal'}
			</a>
		</p>
	{:else}
		<p class="mt-5 flex flex-wrap items-center gap-3">
			<a href="/auth/login?redirectTo=%2Fmein-buergerportal" class="btn btn-primary">
				Mit BundID anmelden
			</a>
			<span class="text-ink-soft">
				<Leicht
					standard="Suchen und Mängel melden geht auch ohne Anmeldung."
					leicht="Suchen geht ohne Anmeldung. Mängel melden geht auch ohne Anmeldung."
				/>
			</span>
		</p>
	{/if}
</section>

<div class="mb-10">
	<ServiceSearch />
</div>

<section aria-labelledby="direkt-h" class="mb-10">
	<h2 id="direkt-h" class="mb-1 text-2xl">
		<Leicht standard="Direkt erledigen" leicht="Das können Sie hier tun" />
	</h2>
	<p class="mb-4 max-w-prose text-ink-soft">
		<Leicht
			standard="Für Termine, Anträge und den Postkorb melden Sie sich mit der BundID an."
			leicht="Für 3 Dinge müssen Sie sich anmelden: Termin, Antrag und Postkorb."
		/>
	</p>
	<EntryPoints signedIn={data.session !== null} />
</section>

<section aria-labelledby="lagen-h" class="mb-10">
	<h2 id="lagen-h" class="mb-1 text-2xl">
		<Leicht standard="Was ist in Ihrem Leben passiert?" leicht="Was ist bei Ihnen los?" />
	</h2>
	<p class="mb-4 max-w-prose text-ink-soft">
		<Leicht
			standard="Wählen Sie eine Lebenslage. Wir zeigen Ihnen die passenden Leistungen."
			leicht="Wählen Sie ein Thema. Dann sehen Sie die Hilfe dazu."
		/>
	</p>
	<LebenslagenList lebenslagen={data.lebenslagen} />
</section>
