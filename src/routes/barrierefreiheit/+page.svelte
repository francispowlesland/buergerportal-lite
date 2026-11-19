<script lang="ts">
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
</script>

<svelte:head><title>Barrierefreiheit – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title="Erklärung zur Barrierefreiheit"
	crumbs={[{ label: 'Start', href: '/' }, { label: 'Barrierefreiheit' }]}
/>

<div class="prose max-w-prose">
	<p>
		Das Bürgerportal soll nach WCAG 2.2, Stufe AA, bedienbar sein. Alle Seiten lassen sich mit der
		Tastatur nutzen. Formulare haben sichtbare Beschriftungen und nennen Fehler in Worten.
	</p>
	<h2>Hilfen in der Kopfleiste</h2>
	<ul>
		<li>
			<strong>Leichte Sprache:</strong> größere Schrift, mehr Zeilenabstand und einfachere Texte, wo vorhanden.
		</li>
		<li><strong>Hoher Kontrast:</strong> schwarze Schrift auf weißem Grund, kräftige Rahmen.</li>
		<li><strong>Dunkler Modus:</strong> helle Schrift auf dunklem Grund. Der Druck bleibt hell.</li>
	</ul>
	<h2>Barriere gefunden?</h2>
	<p>
		Schreiben Sie uns an barrierefreiheit@musterstadt.example. Wir antworten innerhalb von 6 Wochen.
	</p>
</div>
