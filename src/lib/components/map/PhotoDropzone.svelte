<script lang="ts">
	let {
		photoName = $bindable<string | null>(null),
		error
	}: {
		photoName?: string | null;
		error?: string;
	} = $props();

	let isDragging = $state(false);
	let localError = $state<string | null>(null);

	const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
	const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

	function handleFiles(files: FileList | null) {
		localError = null;
		if (!files || files.length === 0) return;

		const file = files[0];
		if (!ALLOWED_MIMES.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
			localError = 'Ungültiges Format. Nur Bilddateien (JPG, PNG, WEBP) sind erlaubt.';
			return;
		}

		if (file.size > MAX_BYTES) {
			localError = 'Das Foto ist zu groß (maximal 5 MB erlaubt).';
			return;
		}

		// Set simulated photo name
		photoName = file.name;
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			handleFiles(e.dataTransfer.files);
		}
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function onDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		handleFiles(input.files);
		input.value = '';
	}

	function removePhoto() {
		photoName = null;
		localError = null;
	}
</script>

<div class="space-y-3">
	<label for="defect-photo-input" class="field-label"> Foto des Schadens (optional) </label>
	<p class="field-hint" id="photo-upload-hint">
		Wählen Sie ein Foto der Schadensstelle (JPG, PNG oder WEBP, max. 5 MB). In dieser Demo wird nur
		der Dateiname gespeichert, nicht die Bilddatei.
	</p>

	<!-- Hidden input for form submission -->
	<input type="hidden" name="photoName" value={photoName ?? ''} />
	<input
		id="defect-photo-input"
		type="file"
		accept="image/jpeg,image/png,image/webp"
		class="visually-hidden"
		onchange={onFileChange}
		aria-describedby="photo-upload-hint"
	/>

	{#if photoName}
		<div class="flex items-center justify-between border-2 border-ink bg-sheet p-3">
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center border border-ink bg-amt-50 text-amt-700"
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<div>
					<p class="font-bold text-ink">{photoName}</p>
					<p class="text-xs text-status-800">Dateiname vorgemerkt (Demo)</p>
				</div>
			</div>
			<button
				type="button"
				class="btn btn-ghost btn-sm text-signal-600 hover:text-signal-800"
				onclick={removePhoto}
			>
				Entfernen
			</button>
		</div>
	{:else}
		<div
			class="relative flex flex-col items-center justify-center border-2 border-dashed p-6 text-center transition-colors {isDragging
				? 'border-amt-700 bg-amt-50'
				: 'border-rule bg-sheet hover:border-amt-500'}"
			ondrop={onDrop}
			ondragover={onDragOver}
			ondragleave={onDragLeave}
			role="region"
			aria-label="Foto-Upload-Bereich"
		>
			<svg class="mb-2 h-8 w-8 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
			<p class="text-sm font-bold text-ink">Foto hierher ziehen oder auswählen</p>
			<p class="mt-1 text-xs text-ink-soft">JPG, PNG oder WEBP bis max. 5 MB</p>

			<label for="defect-photo-input" class="btn btn-sm mt-3 cursor-pointer">
				Foto auswählen
			</label>
		</div>
	{/if}

	{#if localError || error}
		<p class="field-error" role="alert">{localError || error}</p>
	{/if}
</div>
