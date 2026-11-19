<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import Leicht from '#lib/components/ui/Leicht.svelte';

	/** Plain GET form to the Behördenwegweiser; `q` is the parameter /dienste reads. */
	const uid = $props.id();

	const suggestions = ['ummelden', 'Parkausweis', 'Briefwahl', 'Hund anmelden'];
</script>

<form method="GET" action="/dienste" role="search" aria-label="Leistungen suchen" class="panel">
	<div class="panel-head">
		<h2 class="!text-base !font-bold">
			<Leicht standard="Leistung finden" leicht="Was möchten Sie erledigen?" />
		</h2>
	</div>
	<div class="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
		<div>
			<label for="{uid}-q" class="field-label">Suchbegriff</label>
			<span id="{uid}-q-hint" class="field-hint">Zum Beispiel „ummelden“ oder „Parkausweis“</span>
			<input
				id="{uid}-q"
				name="q"
				type="search"
				autocomplete="off"
				aria-describedby="{uid}-q-hint"
			/>
		</div>
		<button type="submit" class="btn btn-primary">Leistungen suchen</button>
	</div>
	<div class="border-t border-rule px-4 py-3">
		<p id="{uid}-vorschlaege" class="field-label">Häufig gesucht</p>
		<ul aria-labelledby="{uid}-vorschlaege" class="flex flex-wrap gap-2">
			{#each suggestions as term (term)}
				<li>
					<a
						href="/dienste?q={encodeURIComponent(term)}"
						class="flex min-h-11 items-center border-2 border-ink bg-sheet px-3 font-bold !text-ink no-underline hover:bg-amt-50"
					>
						{term}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</form>
