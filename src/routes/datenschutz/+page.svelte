<script lang="ts">
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
</script>

<svelte:head><title>Datenschutz – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader
	title="Datenschutz"
	crumbs={[{ label: 'Start', href: '/' }, { label: 'Datenschutz' }]}
/>

<div class="prose max-w-prose">
	<p>
		Dieses Portal ist eine Demonstration. Es speichert nur erfundene Beispieldaten in einer lokalen
		Datenbank. Eine Weitergabe an Dritte findet nicht statt.
	</p>
	<h2>Welche Daten verarbeiten wir?</h2>
	<ul>
		<li>
			Ein Sitzungs-Cookie (<code>sid</code>), damit Sie angemeldet bleiben. Es endet nach 8 Stunden.
		</li>
		<li>Ihre Einstellungen zu Leichter Sprache und Kontrast. Sie bleiben nur in Ihrem Browser.</li>
		<li>Angaben, die Sie in Anträgen, Terminen und Mängelmeldungen eintragen.</li>
	</ul>
	<h2>Ihre Rechte</h2>
	<p>
		Sie können Auskunft, Berichtigung und Löschung Ihrer Daten verlangen. Wenden Sie sich an die
		Datenschutzbeauftragte der Stadt: datenschutz@musterstadt.example.
	</p>
</div>
