<script lang="ts">
	import type { User } from '#lib/server/db/schema.ts';
	import type { TrustLevel } from '#lib/trust.ts';
	import type { BriefwahlData } from '#lib/applicationData.ts';
	import { formatDateLong } from '#lib/format.ts';
	import PrefilledIdentity from './PrefilledIdentity.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';

	let {
		step,
		data = $bindable(),
		errors = {},
		user,
		trust,
		onJumpStep,
		wahlbezirke
	}: {
		step: number;
		data: BriefwahlData;
		errors?: Record<string, string>;
		user: User;
		trust?: TrustLevel | null;
		onJumpStep?: (targetStep: number) => void;
		wahlbezirke: Record<string, string>;
	} = $props();

	let resolvedWahlbezirk = $derived(
		wahlbezirke[data.wahlbenachrichtigungsnummer.slice(3, 5)] ??
			'Bitte prüfen Sie die Wahlbenachrichtigungsnummer.'
	);
</script>

{#if step === 0}
	<!-- SCHRITT 1: Wahl und Wahlbenachrichtigung -->
	<div class="space-y-6">
		<PrefilledIdentity {user} {trust} />

		<div class="panel p-4">
			<div class="flex items-center justify-between border-b border-rule pb-2">
				<h3 class="text-base font-bold text-ink">Bevorstehende Wahl</h3>
				<span class="stempel stempel-info text-xs">Wahlamt Musterstadt</span>
			</div>
			<div class="mt-3">
				<p class="text-lg font-bold text-ink">{data.wahl}</p>
				<p class="text-sm text-ink-soft">
					Wahltag: <strong>{formatDateLong(data.wahlDatum)}</strong> (08:00 – 18:00 Uhr)
				</p>
			</div>
		</div>

		<!-- Polling card simulation & number input -->
		<div class="space-y-4">
			<div>
				<label for="wb-nummer-input" class="field-label">Wahlbenachrichtigungsnummer</label>
				<p class="field-hint" id="wb-hint">
					Die Nummer finden Sie oben rechts auf Ihrer Wahlbenachrichtigungskarte (z. B.
					WB-07-004711).
				</p>
				<div class="max-w-xs">
					<input
						id="wb-nummer-input"
						name="wahlbenachrichtigungsnummer"
						type="text"
						bind:value={data.wahlbenachrichtigungsnummer}
						placeholder="WB-07-004711"
						class="input font-bold tracking-wider uppercase"
						aria-describedby="wb-hint"
						aria-invalid={errors.wahlbenachrichtigungsnummer ? 'true' : undefined}
					/>
				</div>
				{#if errors.wahlbenachrichtigungsnummer}
					<p class="field-error" role="alert">{errors.wahlbenachrichtigungsnummer}</p>
				{/if}
			</div>

			<!-- Visual Mock of the Wahlbenachrichtigungskarte -->
			<div class="panel border-2 border-ink bg-paper p-4" aria-hidden="true">
				<div class="flex items-start justify-between border-b border-ink pb-2 text-xs">
					<div>
						<span class="font-bold tracking-wide uppercase">Stadt Musterstadt • Wahlamt</span>
						<p class="text-ink-soft">Wahlbenachrichtigung für die {data.wahl}</p>
					</div>
					<div class="rounded border border-amt-700 bg-amt-50 px-2 py-1 text-right">
						<span class="block text-[10px] font-bold text-amt-700 uppercase">
							Wählerverzeichnis-Nr.
						</span>
						<span class="font-display font-bold tracking-wider text-amt-900">
							{data.wahlbenachrichtigungsnummer || 'WB-07-004711'}
						</span>
					</div>
				</div>

				<div class="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
					<div>
						<span class="text-ink-soft">Wahlberechtigte Person:</span>
						<p class="font-bold text-ink">{user.firstName} {user.lastName}</p>
						<p class="text-ink">{user.street}, {user.postalCode} {user.city}</p>
					</div>
					<div>
						<span class="text-ink-soft">Zuständiges Wahllokal / Wahlbezirk:</span>
						<p class="font-bold text-ink">{resolvedWahlbezirk}</p>
						<p class="text-ink-soft">Wahltag: {formatDateLong(data.wahlDatum)}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else if step === 1}
	<!-- SCHRITT 2: Zustellung der Unterlagen -->
	<div class="space-y-6">
		<fieldset class="space-y-3">
			<legend class="field-label">Wohin sollen die Briefwahlunterlagen gesendet werden?</legend>
			<p class="field-hint" id="zustellung-hint">
				Sie können die Unterlagen an Ihre Meldeadresse oder an eine abweichende Anschrift (z. B.
				Urlaubsort oder Arbeitsstätte) senden lassen.
			</p>

			<div class="space-y-3" role="radiogroup" aria-describedby="zustellung-hint">
				<label
					class="flex cursor-pointer items-start gap-3 border p-4 transition-colors {data.zustellung ===
					'wohnanschrift'
						? 'border-amt-700 bg-amt-50 font-bold'
						: 'border-rule bg-sheet hover:border-amt-300'}"
				>
					<input
						type="radio"
						name="zustellung"
						value="wohnanschrift"
						bind:group={data.zustellung}
						class="mt-1"
					/>
					<div>
						<span class="block text-sm">Amtliche Meldeadresse</span>
						<span class="block text-xs font-normal text-ink-soft">
							{user.street}, {user.postalCode}
							{user.city}
						</span>
					</div>
				</label>

				<label
					class="flex cursor-pointer items-start gap-3 border p-4 transition-colors {data.zustellung ===
					'abweichend'
						? 'border-amt-700 bg-amt-50 font-bold'
						: 'border-rule bg-sheet hover:border-amt-300'}"
				>
					<input
						type="radio"
						name="zustellung"
						value="abweichend"
						bind:group={data.zustellung}
						class="mt-1"
					/>
					<div>
						<span class="block text-sm">Abweichende Anschrift</span>
						<span class="block text-xs font-normal text-ink-soft">
							Zusendung an eine andere Anschrift in Deutschland.
						</span>
					</div>
				</label>
			</div>
			{#if errors.zustellung}
				<p class="field-error" role="alert">{errors.zustellung}</p>
			{/if}
		</fieldset>

		{#if data.zustellung === 'abweichend' && data.abweichendeAnschrift}
			<div class="panel space-y-4 p-4">
				<h3 class="text-base font-bold text-ink">Abweichende Anschrift angeben</h3>

				<div>
					<label for="abw-street-input" class="field-label">Straße und Hausnummer</label>
					<input
						id="abw-street-input"
						name="abweichendeAnschrift_street"
						type="text"
						bind:value={data.abweichendeAnschrift.street}
						placeholder="Urlaubsstraße 42"
						class="input"
						aria-invalid={errors['abweichendeAnschrift.street'] ? 'true' : undefined}
					/>
					{#if errors['abweichendeAnschrift.street']}
						<p class="field-error" role="alert">{errors['abweichendeAnschrift.street']}</p>
					{/if}
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div>
						<label for="abw-plz-input" class="field-label">Postleitzahl</label>
						<input
							id="abw-plz-input"
							name="abweichendeAnschrift_postalCode"
							type="text"
							bind:value={data.abweichendeAnschrift.postalCode}
							placeholder="12345"
							class="input"
							aria-invalid={errors['abweichendeAnschrift.postalCode'] ? 'true' : undefined}
						/>
						{#if errors['abweichendeAnschrift.postalCode']}
							<p class="field-error" role="alert">{errors['abweichendeAnschrift.postalCode']}</p>
						{/if}
					</div>

					<div class="sm:col-span-2">
						<label for="abw-city-input" class="field-label">Wohnort</label>
						<input
							id="abw-city-input"
							name="abweichendeAnschrift_city"
							type="text"
							bind:value={data.abweichendeAnschrift.city}
							placeholder="Musterstadt"
							class="input"
							aria-invalid={errors['abweichendeAnschrift.city'] ? 'true' : undefined}
						/>
						{#if errors['abweichendeAnschrift.city']}
							<p class="field-error" role="alert">{errors['abweichendeAnschrift.city']}</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else if step === 2}
	<!-- SCHRITT 3: Prüfen und absenden -->
	<div class="space-y-6">
		<div class="panel p-4">
			<div class="flex items-center justify-between border-b border-rule pb-2">
				<h3 class="text-base font-bold text-ink">Wähler/in &amp; Wahlberechtigung</h3>
				<span class="text-xs text-ink-soft">Aus BundID verifiziert</span>
			</div>
			<dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
				<div>
					<dt class="font-bold text-ink-soft">Name</dt>
					<dd class="text-ink">{user.firstName} {user.lastName}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Wahl</dt>
					<dd class="font-bold text-ink">{data.wahl}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Wahltag</dt>
					<dd class="text-ink">{formatDateLong(data.wahlDatum)}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Wahlbenachrichtigungs-Nr.</dt>
					<dd class="font-bold tracking-wider text-ink uppercase">
						{data.wahlbenachrichtigungsnummer}
					</dd>
				</div>
				<div class="sm:col-span-2">
					<dt class="font-bold text-ink-soft">Zugeordneter Wahlbezirk</dt>
					<dd class="font-medium text-ink">{resolvedWahlbezirk}</dd>
				</div>
			</dl>
		</div>

		<div class="panel p-4">
			<div class="flex items-center justify-between border-b border-rule pb-2">
				<h3 class="text-base font-bold text-ink">Zustelladresse für Briefwahlunterlagen</h3>
				{#if onJumpStep}
					<button type="button" class="btn btn-ghost btn-sm" onclick={() => onJumpStep(1)}>
						Ändern
					</button>
				{/if}
			</div>
			<div class="mt-3 text-sm">
				{#if data.zustellung === 'wohnanschrift'}
					<p class="font-bold text-ink">Amtliche Meldeadresse</p>
					<p class="text-ink-soft">{user.street}, {user.postalCode} {user.city}</p>
				{:else if data.abweichendeAnschrift}
					<p class="font-bold text-ink">Abweichende Anschrift</p>
					<p class="text-ink-soft">
						{data.abweichendeAnschrift.street}, {data.abweichendeAnschrift.postalCode}
						{data.abweichendeAnschrift.city}
					</p>
				{/if}
			</div>
		</div>

		<Alert tone="info" title="Gebührenfreiheit &amp; Versand">
			<p>
				Die Ausstellung des Wahlscheins und die Zusendung der Briefwahlunterlagen (Stimmzettel,
				Wahlschein, Stimmzettelumschlag und roter Wahlbriefumschlag) sind <strong>
					kostenfrei
				</strong>. Der Versand erfolgt innerhalb von 2–3 Werktagen per Post.
			</p>
		</Alert>
	</div>
{/if}
