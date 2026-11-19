<script lang="ts">
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
</script>

<svelte:head><title>Impressum – Bürgerportal Musterstadt</title></svelte:head>

<PageHeader title="Impressum" crumbs={[{ label: 'Start', href: '/' }, { label: 'Impressum' }]} />

<div class="prose max-w-prose">
	<p>
		<strong>Dies ist ein Demonstrator.</strong> Die Stadt Musterstadt, alle genannten Personen, Ämter,
		Aktenzeichen und Vorgänge sind frei erfunden. Es werden keine echten Anträge bearbeitet.
	</p>
	<h2>Angaben gemäß § 5 DDG</h2>
	<p>
		Stadt Musterstadt<br />
		Der Oberbürgermeister<br />
		Marktplatz 1<br />
		12345 Musterstadt
	</p>
	<h2>Kontakt</h2>
	<p>Telefon: 0123 456-0<br />E-Mail: buergerservice@musterstadt.example</p>
</div>
