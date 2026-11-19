<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="no-print mt-20 border-t-2 border-ink bg-amt-900 pb-24 text-white">
	<div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
		<div>
			<p class="font-display text-xl font-bold" style="font-stretch: 112%">Stadt Musterstadt</p>
			<p class="mt-2 max-w-sm text-white/85">
				Marktplatz 1, 12345 Musterstadt<br />
				Telefon 0123 456-0 · Behördennummer 115
			</p>
			<p class="mt-4 max-w-sm text-sm text-white/75">
				Dies ist ein Demonstrator. Musterstadt, alle Personen und alle Vorgänge sind frei erfunden.
			</p>
		</div>
		<nav aria-label="Service">
			<p class="font-bold">Service</p>
			<ul class="mt-2 grid gap-1">
				<li><a class="text-white" href={resolve('/dienste')}>Leistungen von A bis Z</a></li>
				<li><a class="text-white" href={resolve('/termine')}>Termin vereinbaren</a></li>
				<li><a class="text-white" href={resolve('/maengelmelder')}>Mängel melden</a></li>
			</ul>
		</nav>
		<nav aria-label="Rechtliches">
			<p class="font-bold">Rechtliches</p>
			<ul class="mt-2 grid gap-1">
				<li><a class="text-white" href={resolve('/impressum')}>Impressum</a></li>
				<li><a class="text-white" href={resolve('/datenschutz')}>Datenschutz</a></li>
				<li><a class="text-white" href={resolve('/barrierefreiheit')}>Barrierefreiheit</a></li>
			</ul>
		</nav>
	</div>
</footer>
