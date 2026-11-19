<script lang="ts">
	let { id = 'banner' }: { id?: string } = $props();
	let dismissed = $state(false);
</script>

{#if !dismissed}
	<div class="bg-signal-600 text-white" role="region" aria-label="Aktuelle Hinweise" {id}>
		<div class="mx-auto flex max-w-6xl items-start gap-3 px-4 py-2 text-sm">
			<p class="flex-1">
				<strong>Wartungsfenster:</strong> Am Samstag, 22. November, ist der Postkorb von 2 bis 5 Uhr nicht
				erreichbar. Termine und Anträge bleiben nutzbar.
			</p>
			<button
				type="button"
				class="-my-1 min-h-8 shrink-0 px-2 font-bold underline"
				onclick={() => (dismissed = true)}
			>
				Hinweis schließen
			</button>
		</div>
	</div>
{/if}
