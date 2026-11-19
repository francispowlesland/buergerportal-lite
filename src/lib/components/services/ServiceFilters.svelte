<script lang="ts">
	import { resolve } from '$app/paths';
	let {
		q,
		amt,
		lebenslage,
		offices,
		lebenslagen,
		countText,
		filtered,
		onquery,
		onamt,
		onlebenslage,
		onreset,
		onsubmit
	}: {
		q: string;
		amt: string;
		lebenslage: string;
		offices: { slug: string; name: string; n: number }[];
		lebenslagen: { key: string; label: string }[];
		countText: string;
		filtered: boolean;
		onquery: (value: string) => void;
		onamt: (value: string) => void;
		onlebenslage: (value: string) => void;
		onreset: () => void;
		onsubmit: () => void;
	} = $props();

	const uid = $props.id();

	/** Without JavaScript the form is a plain GET search; with it, everything filters live. */
	function submit(event: SubmitEvent) {
		event.preventDefault();
		onsubmit();
	}

	function pick(event: MouseEvent, key: string) {
		event.preventDefault();
		onlebenslage(lebenslage === key ? '' : key);
	}
</script>

<form
	method="GET"
	action={resolve('/dienste')}
	role="search"
	aria-label="Leistungen suchen"
	class="panel mb-6"
	onsubmit={submit}
>
	<input type="hidden" name="lebenslage" value={lebenslage} />
	<div class="panel-head">
		<h2 class="!text-base !font-bold">Leistung finden</h2>
		{#if filtered}
			<a
				href={resolve('/dienste')}
				onclick={(event) => {
					event.preventDefault();
					onreset();
				}}
				class="text-sm font-bold !text-white underline hover:no-underline"
			>
				Filter zurücksetzen
			</a>
		{/if}
	</div>

	<div class="grid items-end gap-4 p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
		<div>
			<label for="{uid}-q" class="field-label">Suchbegriff</label>
			<span id="{uid}-q-hint" class="field-hint">
				Zum Beispiel „ummelden“, „Parkausweis“ oder „Hund“
			</span>
			<input
				id="{uid}-q"
				name="q"
				type="search"
				autocomplete="off"
				aria-describedby="{uid}-q-hint"
				value={q}
				oninput={(event) => onquery(event.currentTarget.value)}
			/>
		</div>
		<div>
			<label for="{uid}-amt" class="field-label">Zuständiges Amt</label>
			<span class="field-hint">Wer die Leistung erbringt</span>
			<select
				id="{uid}-amt"
				name="amt"
				value={amt}
				onchange={(event) => onamt(event.currentTarget.value)}
			>
				<option value="">Alle Ämter</option>
				{#each offices as office (office.slug)}
					<option value={office.slug}>{office.name} ({office.n})</option>
				{/each}
			</select>
		</div>
		<button type="submit" class="btn btn-primary">Leistungen suchen</button>
	</div>

	<div class="border-t border-rule px-4 py-3">
		<p id="{uid}-lage" class="field-label">Lebenslage</p>
		<div role="group" aria-labelledby="{uid}-lage" class="flex flex-wrap gap-2">
			{#each lebenslagen as l (l.key)}
				<button
					type="submit"
					name="lebenslage"
					value={lebenslage === l.key ? '' : l.key}
					aria-pressed={lebenslage === l.key}
					onclick={(event) => pick(event, l.key)}
					class="min-h-11 border-2 border-ink bg-sheet px-3 font-bold hover:bg-amt-50 aria-pressed:border-amt-700 aria-pressed:bg-amt-700 aria-pressed:text-paper"
				>
					{l.label}
				</button>
			{/each}
		</div>
	</div>

	<p class="border-t border-rule px-4 py-3 font-bold" role="status" aria-live="polite">
		{countText}
	</p>
</form>
