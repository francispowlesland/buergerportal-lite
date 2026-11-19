<script lang="ts">
	import type { SlotView } from './types.ts';
	let { slots }: { slots: SlotView[] } = $props();
	const id = $props.id();
</script>

<fieldset>
	<legend class="mb-3 font-bold">Freie Uhrzeit wählen</legend>
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
		{#each slots as slot (slot.time)}
			{#if slot.free}
				<label
					for="{id}-{slot.time}"
					class="flex min-h-11 cursor-pointer items-center gap-2 border border-amt-700 bg-amt-50 px-3 py-2 font-bold has-checked:bg-amt-700 has-checked:text-paper"
				>
					<input id="{id}-{slot.time}" type="radio" name="zeit" value={slot.time} required />
					{slot.time} Uhr
				</label>
			{:else}
				<span
					class="flex min-h-11 items-center justify-center border border-rule bg-paper px-2 py-2 text-sm text-ink-soft"
				>
					{slot.time} belegt
				</span>
			{/if}
		{/each}
	</div>
</fieldset>
