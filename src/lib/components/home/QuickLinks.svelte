<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	const links = [
		{ href: '/antrag', label: 'Antrag stellen' },
		{ href: '/termine/buchen', label: 'Termin buchen' },
		{ href: '/maengelmelder', label: 'Mangel melden' },
		{ href: '/dienste', label: 'Leistungen von A bis Z' }
	];
</script>

<nav aria-labelledby="schnell-h" class="panel">
	<h2 id="schnell-h" class="panel-head !text-base !font-bold">Schnellzugriff</h2>
	<ul class="divide-y divide-rule">
		{#each links as link (link.href)}
			<li>
				<a href={link.href} class="flex min-h-11 items-center px-4 py-2 font-bold">{link.label}</a>
			</li>
		{/each}
	</ul>
</nav>
