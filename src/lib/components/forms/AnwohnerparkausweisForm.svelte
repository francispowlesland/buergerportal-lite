<script lang="ts">
	import type { User, Attachment } from '#lib/server/db/schema.ts';
	import type { TrustLevel } from '#lib/trust.ts';
	import type { AnwohnerparkausweisData } from '#lib/applicationData.ts';
	import { formatFee } from '#lib/format.ts';
	import PrefilledIdentity from './PrefilledIdentity.svelte';
	import DocumentDropzone from './DocumentDropzone.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import type { ParkingZoneInfo } from '#lib/server/wizards/parkingZones.ts';

	let {
		step,
		data = $bindable(),
		errors = {},
		user,
		trust,
		feeCents = 3000,
		attachments = [],
		onJumpStep,
		onUploadAttachment,
		onDeleteAttachment,
		parkingZones,
		eligibleZone
	}: {
		step: number;
		data: AnwohnerparkausweisData;
		errors?: Record<string, string>;
		user: User;
		trust?: TrustLevel | null;
		feeCents?: number;
		attachments?: Attachment[];
		onJumpStep?: (targetStep: number) => void;
		onUploadAttachment?: (meta: {
			filename: string;
			sizeBytes: number;
			mimeType: string;
		}) => Promise<void>;
		onDeleteAttachment?: (id: number) => Promise<void>;
		parkingZones: ParkingZoneInfo[];
		eligibleZone: AnwohnerparkausweisData['parkzone'];
	} = $props();

	const derivedZone = $derived(eligibleZone);

	const fahrzeugartLabels: Record<string, string> = {
		pkw: 'Personenkraftwagen (PKW)',
		motorrad: 'Kraftrad / Motorrad',
		carsharing: 'Carsharing-Fahrzeug'
	};

	const halterLabels: Record<string, string> = {
		selbst: 'Ich bin selbst Fahrzeughalter/in',
		andere: 'Fahrzeug ist auf eine andere Person oder Firma zugelassen'
	};

	let totalFee = $derived(data.laufzeitMonate === 24 ? feeCents * 2 : feeCents);
</script>

{#if step === 0}
	<!-- SCHRITT 1: Fahrzeugangaben -->
	<div class="space-y-6">
		<PrefilledIdentity {user} {trust} />

		<div>
			<label for="kennzeichen-input" class="field-label">Amtliches Kennzeichen</label>
			<p class="field-hint" id="kennzeichen-hint">
				Geben Sie das Kfz-Kennzeichen mit Bindestrich ein (z. B. MS-AB 1234).
			</p>
			<div class="max-w-xs">
				<input
					id="kennzeichen-input"
					name="kennzeichen"
					type="text"
					bind:value={data.kennzeichen}
					placeholder="MS-AB 1234"
					class="input font-bold tracking-wider uppercase"
					aria-describedby="kennzeichen-hint"
					aria-invalid={errors.kennzeichen ? 'true' : undefined}
				/>
			</div>
			{#if errors.kennzeichen}
				<p class="field-error" role="alert">{errors.kennzeichen}</p>
			{/if}
		</div>

		<fieldset class="space-y-3">
			<legend class="field-label">Fahrzeugart</legend>
			<div class="space-y-2" role="radiogroup">
				{#each Object.entries(fahrzeugartLabels) as [key, label] (key)}
					<label
						class="flex cursor-pointer items-start gap-3 border p-3 transition-colors {data.fahrzeugart ===
						key
							? 'border-amt-700 bg-amt-50 font-bold'
							: 'border-rule bg-sheet hover:border-amt-300'}"
					>
						<input
							type="radio"
							name="fahrzeugart"
							value={key}
							bind:group={data.fahrzeugart}
							class="mt-0.5"
						/>
						<span class="text-sm">{label}</span>
					</label>
				{/each}
			</div>
			{#if errors.fahrzeugart}
				<p class="field-error" role="alert">{errors.fahrzeugart}</p>
			{/if}
		</fieldset>

		<fieldset class="space-y-3">
			<legend class="field-label">Fahrzeughalter</legend>
			<div class="space-y-2" role="radiogroup">
				{#each Object.entries(halterLabels) as [key, label] (key)}
					<label
						class="flex cursor-pointer items-start gap-3 border p-3 transition-colors {data.halter ===
						key
							? 'border-amt-700 bg-amt-50 font-bold'
							: 'border-rule bg-sheet hover:border-amt-300'}"
					>
						<input type="radio" name="halter" value={key} bind:group={data.halter} class="mt-0.5" />
						<span class="text-sm">{label}</span>
					</label>
				{/each}
			</div>
			{#if errors.halter}
				<p class="field-error" role="alert">{errors.halter}</p>
			{/if}
		</fieldset>
	</div>
{:else if step === 1}
	<!-- SCHRITT 2: Parkzone -->
	<div class="space-y-6">
		<Alert tone="info" title="Adressprüfung für Bewohnerparken">
			<p>
				Ihre amtliche Meldeadresse <strong>{user.street}, {user.postalCode} {user.city}</strong>
				liegt im Bewohnerparkgebiet <strong>Zone {derivedZone}</strong>.
			</p>
		</Alert>

		<fieldset class="space-y-3">
			<legend class="field-label">Wählen Sie Ihre Parkzone</legend>
			<p class="field-hint" id="parkzone-hint">
				Der Bewohnerparkausweis gilt ausschließlich in der für Ihre Meldeadresse ausgewiesenen Zone.
			</p>

			<div
				class="grid grid-cols-1 gap-3 sm:grid-cols-2"
				role="radiogroup"
				aria-describedby="parkzone-hint"
			>
				{#each parkingZones as zone (zone.id)}
					<label
						class="flex cursor-pointer flex-col justify-between border p-4 transition-colors {data.parkzone ===
						zone.id
							? 'border-amt-700 bg-amt-50'
							: 'border-rule bg-sheet hover:border-amt-300'} {derivedZone === zone.id
							? 'ring-2 ring-amt-500'
							: ''}"
					>
						<div class="flex items-start gap-3">
							<input
								type="radio"
								name="parkzone"
								value={zone.id}
								bind:group={data.parkzone}
								disabled={zone.id !== derivedZone}
								class="mt-1"
							/>
							<div>
								<div class="flex items-center gap-2">
									<span class="font-bold text-ink">{zone.name}</span>
									{#if derivedZone === zone.id}
										<span class="stempel stempel-ok text-xs">Ihre Meldezone</span>
									{/if}
								</div>
								<p class="mt-1 text-xs text-ink-soft">{zone.description}</p>
							</div>
						</div>

						<div class="mt-3 border-t border-rule pt-2 text-xs text-ink-soft">
							<span class="font-bold">Beispielstraßen:</span>
							{zone.streets.join(', ')}
						</div>
					</label>
				{/each}
			</div>
			{#if errors.parkzone}
				<p class="field-error" role="alert">{errors.parkzone}</p>
			{/if}
		</fieldset>
	</div>
{:else if step === 2}
	<!-- SCHRITT 3: Nachweise -->
	<div class="space-y-6">
		<div class="panel p-4">
			<h3 class="text-base font-bold text-ink">1. Simulierte Zulassungsprüfung</h3>
			<p class="mt-1 text-sm text-ink-soft">
				Prüfen Sie Ihr Kennzeichen <strong>{data.kennzeichen || '(noch kein Kennzeichen)'}</strong> direkt
				in dieser Demo. Es wird kein externes Register abgefragt. Bei einem fremden Halter ist ein Fahrzeugschein
				erforderlich.
			</p>

			<div class="mt-4 flex flex-wrap items-center gap-3">
				<button
					type="submit"
					formaction="?/checkRegistration"
					class="btn btn-sm {data.zulassungGeprueft ? 'btn-ghost' : 'btn-primary'}"
					disabled={!data.kennzeichen || data.halter !== 'selbst'}
				>
					{data.zulassungGeprueft ? 'Zulassung erneut prüfen' : 'Zulassung simuliert prüfen'}
				</button>

				{#if data.zulassungGeprueft}
					<span class="stempel stempel-ok">Zulassung erfolgreich geprüft</span>
				{/if}
			</div>
		</div>

		<div class="panel p-4">
			<h3 class="text-base font-bold text-ink">2. Dokumentenupload (Fahrzeugschein)</h3>
			<p class="mt-1 text-sm text-ink-soft">
				Falls die Online-Prüfung nicht möglich ist oder das Fahrzeug nicht auf Sie zugelassen ist,
				laden Sie bitte die Zulassungsbescheinigung Teil I als Datei hoch.
			</p>

			<div class="mt-4">
				<DocumentDropzone
					{attachments}
					label="Zulassungsbescheinigung Teil I (Fahrzeugschein)"
					error={errors.nachweise}
					onUpload={onUploadAttachment}
					onDelete={onDeleteAttachment}
				/>
			</div>
		</div>
	</div>
{:else if step === 3}
	<!-- SCHRITT 4: Laufzeit & Gebühr -->
	<div class="space-y-6">
		<fieldset class="space-y-3">
			<legend class="field-label">Gültigkeitsdauer des Parkausweises</legend>
			<p class="field-hint" id="laufzeit-hint">
				Wählen Sie die gewünschte Laufzeit. Die Gebühr beträgt 30,00 € pro Jahr.
			</p>

			<div
				class="grid grid-cols-1 gap-3 sm:grid-cols-2"
				role="radiogroup"
				aria-describedby="laufzeit-hint"
			>
				<label
					class="flex cursor-pointer items-start gap-3 border p-4 transition-colors {data.laufzeitMonate ===
					12
						? 'border-amt-700 bg-amt-50 font-bold'
						: 'border-rule bg-sheet hover:border-amt-300'}"
				>
					<input
						type="radio"
						name="laufzeitMonate"
						value={12}
						bind:group={data.laufzeitMonate}
						class="mt-1"
					/>
					<div>
						<span class="block text-base font-bold">12 Monate (1 Jahr)</span>
						<span class="block text-sm text-ink-soft">Gebühr: {formatFee(feeCents)}</span>
					</div>
				</label>

				<label
					class="flex cursor-pointer items-start gap-3 border p-4 transition-colors {data.laufzeitMonate ===
					24
						? 'border-amt-700 bg-amt-50 font-bold'
						: 'border-rule bg-sheet hover:border-amt-300'}"
				>
					<input
						type="radio"
						name="laufzeitMonate"
						value={24}
						bind:group={data.laufzeitMonate}
						class="mt-1"
					/>
					<div>
						<span class="block text-base font-bold">24 Monate (2 Jahre)</span>
						<span class="block text-sm text-ink-soft">Gebühr: {formatFee(feeCents * 2)}</span>
					</div>
				</label>
			</div>
			{#if errors.laufzeitMonate}
				<p class="field-error" role="alert">{errors.laufzeitMonate}</p>
			{/if}
		</fieldset>

		<Alert tone="info" title="Gebührenübersicht">
			<p>
				Die Gesamtgebühr für <strong>{data.laufzeitMonate} Monate</strong> beträgt
				<strong>{formatFee(totalFee)}</strong>. Die Fälligkeit tritt nach Bewilligung mit Erhalt des
				Gebührenbescheids ein.
			</p>
		</Alert>
	</div>
{:else if step === 4}
	<!-- SCHRITT 5: Prüfen und absenden -->
	<div class="space-y-6">
		<div class="panel p-4">
			<div class="flex items-center justify-between border-b border-rule pb-2">
				<h3 class="text-base font-bold text-ink">Antragsteller/in &amp; Wohnsitz</h3>
				<span class="text-xs text-ink-soft">Aus BundID verifiziert</span>
			</div>
			<dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
				<div>
					<dt class="font-bold text-ink-soft">Name</dt>
					<dd class="text-ink">{user.firstName} {user.lastName}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Wohnanschrift</dt>
					<dd class="text-ink">{user.street}, {user.postalCode} {user.city}</dd>
				</div>
			</dl>
		</div>

		<div class="panel p-4">
			<div class="flex items-center justify-between border-b border-rule pb-2">
				<h3 class="text-base font-bold text-ink">Fahrzeug &amp; Parkzone</h3>
				{#if onJumpStep}
					<button type="button" class="btn btn-ghost btn-sm" onclick={() => onJumpStep(0)}>
						Ändern
					</button>
				{/if}
			</div>
			<dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
				<div>
					<dt class="font-bold text-ink-soft">Amtliches Kennzeichen</dt>
					<dd class="font-bold tracking-wider text-ink uppercase">{data.kennzeichen}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Fahrzeugart</dt>
					<dd class="text-ink">{fahrzeugartLabels[data.fahrzeugart] ?? data.fahrzeugart}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Fahrzeughalter</dt>
					<dd class="text-ink">{halterLabels[data.halter] ?? data.halter}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Beantragte Parkzone</dt>
					<dd class="font-bold text-ink">Zone {data.parkzone}</dd>
				</div>
			</dl>
		</div>

		<div class="panel p-4">
			<div class="flex items-center justify-between border-b border-rule pb-2">
				<h3 class="text-base font-bold text-ink">Nachweise &amp; Gültigkeit</h3>
				{#if onJumpStep}
					<button type="button" class="btn btn-ghost btn-sm" onclick={() => onJumpStep(2)}>
						Ändern
					</button>
				{/if}
			</div>
			<dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
				<div>
					<dt class="font-bold text-ink-soft">Zulassungsnachweis</dt>
					<dd class="text-ink">
						{#if data.zulassungGeprueft}
							<span class="stempel stempel-ok text-xs">Online verifiziert</span>
						{:else if attachments.length > 0}
							<span>{attachments.length} Dokument(e) hochgeladen</span>
						{:else}
							<span class="text-signal-800">Kein Nachweis erbracht</span>
						{/if}
					</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Beantragte Laufzeit</dt>
					<dd class="text-ink">{data.laufzeitMonate} Monate</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Gebühr</dt>
					<dd class="font-bold text-ink">{formatFee(totalFee)} (nach Bewilligung fällig)</dd>
				</div>
			</dl>
		</div>

		<Alert tone="info" title="Bearbeitungshinweis">
			<p>
				Nach dem Absenden wird Ihr Antrag vom Ordnungsamt bearbeitet (Bearbeitungsdauer ca. 3–5
				Werktage). Sie erhalten den Bewohnerparkausweis und den Gebührenbescheid digital in Ihren
				Postkorb.
			</p>
		</Alert>
	</div>
{/if}
