<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import Leicht from '#lib/components/ui/Leicht.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';

	let { signedIn }: { signedIn: boolean } = $props();

	const entries = [
		{
			href: '/termine',
			login: true,
			title: 'Termin buchen',
			text: 'Freie Zeiten im Bürgeramt und in anderen Ämtern ansehen und einen Termin reservieren.',
			leicht: 'Sie möchten zum Amt gehen? Hier buchen Sie eine Uhrzeit.'
		},
		{
			href: '/antrag',
			login: true,
			title: 'Antrag stellen',
			text: 'Meldebescheinigung, Anwohnerparkausweis und Briefwahl online beantragen und den Stand verfolgen.',
			leicht: 'Sie brauchen ein Papier vom Amt? Hier stellen Sie den Antrag.'
		},
		{
			href: '/postkorb',
			login: true,
			title: 'Postkorb öffnen',
			text: 'Bescheide und Nachrichten der Ämter lesen und Nachweise nachreichen.',
			leicht: 'Hier lesen Sie Post vom Amt.'
		},
		{
			href: '/maengelmelder',
			login: false,
			title: 'Mangel melden',
			text: 'Schlagloch, defekte Laterne oder wilder Müll: auf der Karte melden, ohne Anmeldung möglich.',
			leicht: 'Etwas ist kaputt auf der Straße? Hier sagen Sie es der Stadt.'
		}
	];
</script>

<ul class="panel divide-y divide-rule">
	{#each entries as entry (entry.href)}
		<li>
			<a
				href={entry.href}
				class="grid gap-1 p-4 !text-ink no-underline hover:bg-amt-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6"
			>
				<span>
					<span class="block font-display text-xl font-bold text-amt-700 underline">
						{entry.title}
					</span>
					<span class="mt-1 block max-w-prose text-ink-soft">
						<Leicht standard={entry.text} leicht={entry.leicht} />
					</span>
				</span>
				{#if entry.login && !signedIn}
					<span class="sm:pt-1"><Stempel tone="neutral">Mit BundID anmelden</Stempel></span>
				{/if}
			</a>
		</li>
	{/each}
</ul>
