<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import PageHeader from '#lib/components/ui/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import MapCoordinatePicker from '#lib/components/map/MapCoordinatePicker.svelte';
	import PhotoDropzone from '#lib/components/map/PhotoDropzone.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const initial = untrack(
		() =>
			form?.values ?? {
				category: '',
				title: '',
				description: '',
				address: '',
				lat: data.defaultCoords.lat,
				lng: data.defaultCoords.lng,
				photoName: null
			}
	);
	let selectedCategory = $state(initial.category);
	let title = $state(initial.title);
	let description = $state(initial.description);
	let address = $state(initial.address);
	let lat = $state(initial.lat);
	let lng = $state(initial.lng);
	let photoName = $state<string | null>(initial.photoName);
	let isSubmitting = $state(false);

	const categories = [
		{ key: 'schlagloch', label: 'Schlagloch / Fahrbahnschaden' },
		{ key: 'strassenbeleuchtung', label: 'Straßenbeleuchtung ausgefallen / defekt' },
		{ key: 'graffiti', label: 'Graffiti / Schmierereien' },
		{ key: 'illegale_muellablagerung', label: 'Illegale Müllablagerung / Sperrmüll' },
		{ key: 'spielplatz', label: 'Spielplatzgerät beschädigt / Verunreinigung' },
		{ key: 'sonstiges', label: 'Sonstiger Mangel im öffentlichen Raum' }
	];
</script>

<svelte:head>
	<title>Mangel melden – Mängelmelder – Bürgerportal Musterstadt</title>
</svelte:head>

<PageHeader
	title="Mangel melden"
	lead="Melden Sie Schäden, Defekte oder Verunreinigungen im Stadtgebiet. Eine Anmeldung ist nicht erforderlich – alle Meldungen werden geprüft und nachverfolgt."
	crumbs={[
		{ label: 'Startseite', href: '/' },
		{ label: 'Mängelmelder', href: '/maengelmelder' },
		{ label: 'Mangel melden' }
	]}
/>

<div class="mx-auto max-w-3xl space-y-8">
	<!-- Hinweis zur Anonymität / Anmeldung -->
	{#if data.user}
		<Alert tone="info" title="Angemeldet als {data.user.name}">
			Ihre Meldung wird Ihrem Benutzerkonto zugeordnet. Ihr Name wird aus Datenschutzgründen
			<strong>nicht öffentlich</strong> auf der Statusseite angezeigt.
		</Alert>
	{:else}
		<Alert tone="neutral" title="Hinweis zur Meldung">
			Sie melden diesen Mangel als Gast. Ihre Meldung wird öffentlich mit Aktenzeichen zur
			Nachverfolgung bereitgestellt. Speichern Sie nach dem Absenden den Link zur Meldung.
		</Alert>
	{/if}
	<p class="field-hint">
		Beschreibung, Ortsangabe und Foto-Dateiname sind öffentlich. Geben Sie dort keine persönlichen
		Daten an.
	</p>

	{#if form?.errors && Object.keys(form.errors).length > 0}
		<Alert tone="bad" title="Eingaben unvollständig">
			Bitte korrigieren Sie die markierten Felder im Formular.
		</Alert>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				isSubmitting = false;
				await update();
			};
		}}
		class="panel space-y-8 p-6 md:p-8"
		novalidate
	>
		<!-- 1. Kategorie -->
		<fieldset class="space-y-3">
			<legend class="field-label text-base">
				1. Art des Mangels (Kategorie) <span class="text-signal-600" aria-hidden="true">*</span>
			</legend>
			<p class="field-hint" id="category-hint">
				Wählen Sie die passende Kategorie für Ihre Meldung aus.
			</p>

			<div
				class="grid grid-cols-1 gap-2 sm:grid-cols-2"
				role="radiogroup"
				aria-describedby="category-hint"
			>
				{#each categories as cat (cat.key)}
					<label
						class="flex cursor-pointer items-start gap-3 border-2 p-3 transition-colors {selectedCategory ===
						cat.key
							? 'border-amt-700 bg-amt-50 font-bold'
							: 'border-rule bg-sheet hover:border-ink'}"
					>
						<input
							type="radio"
							name="category"
							value={cat.key}
							bind:group={selectedCategory}
							class="mt-0.5"
							required
						/>
						<span class="text-sm text-ink">{cat.label}</span>
					</label>
				{/each}
			</div>

			{#if form?.errors?.category}
				<p class="field-error" role="alert">{form.errors.category}</p>
			{/if}
		</fieldset>

		<!-- 2. Schadensbeschreibung -->
		<section class="space-y-4">
			<h2 class="border-b border-rule pb-2 text-base font-bold text-ink">2. Angaben zum Mangel</h2>

			<div>
				<label for="title-input" class="field-label">
					Kurztitel <span class="text-signal-600" aria-hidden="true">*</span>
				</label>
				<p class="field-hint" id="title-hint">
					z.B. „Tiefes Schlagloch vor Hausnummer 12“ oder „Laterne flackert“
				</p>
				<input
					id="title-input"
					name="title"
					type="text"
					bind:value={title}
					class="input"
					maxlength="200"
					aria-describedby="title-hint"
					aria-invalid={form?.errors?.title ? 'true' : undefined}
					required
				/>
				{#if form?.errors?.title}
					<p class="field-error" role="alert">{form.errors.title}</p>
				{/if}
			</div>

			<div>
				<label for="description-input" class="field-label">
					Genaue Beschreibung <span class="text-signal-600" aria-hidden="true">*</span>
				</label>
				<p class="field-hint" id="description-hint">
					Beschreiben Sie den Schaden, das Ausmaß und mögliche Gefahrenstellen möglichst präzise.
				</p>
				<textarea
					id="description-input"
					name="description"
					rows="4"
					bind:value={description}
					class="input"
					maxlength="2000"
					aria-describedby="description-hint"
					aria-invalid={form?.errors?.description ? 'true' : undefined}
					required></textarea>
				{#if form?.errors?.description}
					<p class="field-error" role="alert">{form.errors.description}</p>
				{/if}
			</div>
		</section>

		<!-- 3. Ort & Koordinaten -->
		<section class="space-y-4">
			<h2 class="border-b border-rule pb-2 text-base font-bold text-ink">3. Ort des Geschehens</h2>

			<div>
				<label for="address-input" class="field-label">
					Adresse oder Ortsbeschreibung <span class="text-signal-600" aria-hidden="true">*</span>
				</label>
				<p class="field-hint" id="address-hint">
					Straße, Hausnummer oder markanter Ortspunkt (z.B. „Parkallee Höhe Spielplatz“)
				</p>
				<input
					id="address-input"
					name="address"
					type="text"
					bind:value={address}
					class="input"
					maxlength="300"
					placeholder="z.B. Bahnhofstraße 14, 12345 Musterstadt"
					aria-describedby="address-hint"
					aria-invalid={form?.errors?.address ? 'true' : undefined}
					required
				/>
				{#if form?.errors?.address}
					<p class="field-error" role="alert">{form.errors.address}</p>
				{/if}
			</div>

			<!-- Mock map coordinate picker -->
			<MapCoordinatePicker bind:lat bind:lng />

			{#if form?.errors?.coords}
				<p class="field-error" role="alert">{form.errors.coords}</p>
			{/if}
		</section>

		<!-- 4. Foto-Upload -->
		<section class="space-y-4">
			<h2 class="border-b border-rule pb-2 text-base font-bold text-ink">
				4. Foto anfügen (optional)
			</h2>
			<PhotoDropzone bind:photoName error={form?.errors?.photoName} />
		</section>

		<!-- Submit Buttons -->
		<div class="flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-6">
			<a href={resolve('/maengelmelder')} class="btn btn-ghost"> Abbrechen </a>
			<button type="submit" class="btn btn-primary min-w-[200px]" disabled={isSubmitting}>
				{#if isSubmitting}
					Meldung wird übermittelt...
				{:else}
					Mangel jetzt melden
				{/if}
			</button>
		</div>
	</form>
</div>
