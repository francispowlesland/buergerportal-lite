<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/ui/Alert.svelte';
	import UploadDropzone from './UploadDropzone.svelte';
	import { UPLOAD_LIMITS, type ReplyResult } from './types.ts';

	let {
		result,
		reference,
		officeName,
		requestedDocument
	}: {
		result?: ReplyResult;
		reference: string;
		officeName: string;
		requestedDocument: string | null;
	} = $props();

	let busy = $state(false);
	let dropzone = $state<{ reset: () => void }>();
	const id = $props.id();
</script>

<section class="panel" aria-labelledby="{id}-h">
	<h2 class="panel-head !text-base" id="{id}-h">
		{requestedDocument ? 'Unterlagen nachreichen' : 'Antwort an die Behörde'}
	</h2>
	<div class="grid gap-5 p-5">
		<p class="max-w-prose text-ink-soft">
			Ihre Nachricht geht an {officeName} und wird dem Antrag
			<span class="aktenzeichen text-ink">{reference}</span> zugeordnet.
			{#if requestedDocument}
				Angefordert ist: <strong class="text-ink">{requestedDocument}</strong>.
			{/if}
		</p>

		{#if result?.ok}
			<Alert tone="ok" title="Gesendet">{result.message}</Alert>
		{:else if result && !result.ok}
			<Alert tone="bad" title="Nicht gesendet">{result.message}</Alert>
		{/if}

		<form
			method="POST"
			action="?/antworten"
			enctype="multipart/form-data"
			class="grid gap-5"
			use:enhance={() => {
				busy = true;
				return async ({ result: r, update }) => {
					try {
						await update();
						if (r.type === 'success') dropzone?.reset();
					} finally {
						busy = false;
					}
				};
			}}
		>
			<div>
				<label class="field-label" for="{id}-text">
					Ihre Nachricht{requestedDocument ? ' (optional)' : ''}
				</label>
				<textarea
					id="{id}-text"
					name="text"
					rows="4"
					maxlength={UPLOAD_LIMITS.maxText}
					class="max-w-prose"
					aria-invalid={result?.errors.text ? 'true' : undefined}
					aria-describedby={result?.errors.text ? `${id}-text-err` : undefined}
					value={result && !result.ok ? result.text : ''}></textarea>
				{#if result?.errors.text}
					<p class="field-error" id="{id}-text-err" role="alert">{result.errors.text}</p>
				{/if}
			</div>

			<UploadDropzone
				bind:this={dropzone}
				label={requestedDocument ?? 'Dokumente anhängen (optional)'}
				error={result?.errors.dokumente}
			/>

			<div>
				<button class="btn btn-primary" disabled={busy}>
					{busy ? 'Wird gesendet …' : 'Antwort an die Behörde senden'}
				</button>
			</div>
		</form>
	</div>
</section>
