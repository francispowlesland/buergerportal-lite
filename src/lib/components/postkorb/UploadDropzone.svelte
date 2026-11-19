<script lang="ts">
	import { UPLOAD_LIMITS, validateUpload, formatBytes } from '#lib/components/postkorb/types.ts';

	/**
	 * Simulated dropzone for supplemental documents. The files sit in a real multipart
	 * `<input name="datei" multiple>`, so the form works without JavaScript; the server only
	 * stores metadata (filename, size, type).
	 */
	let { error, label }: { error?: string; label: string } = $props();

	let selected = $state<File[]>([]);
	let dragging = $state(false);
	let localError = $state('');
	let input = $state<HTMLInputElement>();

	const id = $props.id();

	/** Clears the selection after a successful submit. */
	export function reset() {
		sync([]);
		localError = '';
	}

	function sync(files: File[]) {
		selected = files;
		if (!input) return;
		const dt = new DataTransfer();
		for (const f of files) dt.items.add(f);
		input.files = dt.files;
	}

	function add(list: FileList | null) {
		localError = '';
		if (!list) return;
		const next = [...selected];
		for (const f of Array.from(list)) {
			const result = validateUpload({ filename: f.name, sizeBytes: f.size, mimeType: f.type });
			if (!result.ok) {
				localError = result.error;
				continue;
			}
			if (next.some((n) => n.name === f.name && n.size === f.size)) continue;
			if (next.length >= UPLOAD_LIMITS.maxFiles) {
				localError = `Sie können höchstens ${UPLOAD_LIMITS.maxFiles} Dokumente gleichzeitig senden.`;
				break;
			}
			next.push(f);
		}
		sync(next);
	}
</script>

<div>
	<label class="field-label" for="{id}-file">{label}</label>
	<span class="field-hint" id="{id}-hint">
		PDF, JPG oder PNG, bis zu 5 MB je Datei, höchstens {UPLOAD_LIMITS.maxFiles} Dokumente. Demo: Gespeichert
		werden nur Dateiname, Größe und Dateityp, nicht der Dateiinhalt.
	</span>

	<div
		role="presentation"
		class="flex flex-col items-center gap-2 border-2 border-dashed p-6 text-center {dragging
			? 'border-amt-700 bg-amt-50'
			: 'border-ink bg-paper'}"
		ondragover={(e) => {
			e.preventDefault();
			dragging = true;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={(e) => {
			e.preventDefault();
			dragging = false;
			add(e.dataTransfer?.files ?? null);
		}}
	>
		<p class="font-bold">Dokumente hierher ziehen</p>
		<p class="text-sm text-ink-soft">oder</p>
		<input
			bind:this={input}
			id="{id}-file"
			name="datei"
			type="file"
			multiple
			accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
			aria-invalid={localError || error ? 'true' : undefined}
			aria-describedby={`${id}-hint${localError || error ? ` ${id}-error` : ''}`}
			class="max-w-full text-sm"
			onchange={(e) => add(e.currentTarget.files)}
		/>
	</div>

	{#if localError || error}
		<p id="{id}-error" class="field-error" role="alert">{localError || error}</p>
	{/if}

	{#if selected.length > 0}
		<ul
			class="mt-3 divide-y divide-rule border border-ink bg-sheet"
			aria-label="Ausgewählte Dokumente"
		>
			{#each selected as f (JSON.stringify([f.name, f.size]))}
				<li class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
					<span class="min-w-0">
						<span class="block truncate font-bold">{f.name}</span>
						<span class="text-ink-soft">{formatBytes(f.size)}</span>
					</span>
					<button
						type="button"
						class="btn btn-ghost btn-sm"
						onclick={() => sync(selected.filter((item) => item !== f))}
					>
						Entfernen<span class="visually-hidden">: {f.name}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
