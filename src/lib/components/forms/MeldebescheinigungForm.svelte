<script lang="ts">
	import type { User } from '#lib/server/db/schema.ts';
	import type { TrustLevel } from '#lib/trust.ts';
	import type { MeldebescheinigungData } from '#lib/applicationData.ts';
	import { formatFee } from '#lib/format.ts';
	import PrefilledIdentity from './PrefilledIdentity.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';

	let {
		step,
		data = $bindable(),
		errors = {},
		user,
		trust,
		feeCents = 500,
		onJumpStep
	}: {
		step: number;
		data: MeldebescheinigungData;
		errors?: Record<string, string>;
		user: User;
		trust?: TrustLevel | null;
		feeCents?: number;
		onJumpStep?: (targetStep: number) => void;
	} = $props();

	const zweckLabels: Record<string, string> = {
		arbeitgeber: 'Vorlage beim Arbeitgeber',
		behoerde: 'Vorlage bei einer Behörde',
		bank: 'Bank oder Kreditinstitut',
		sonstiges: 'Sonstiger Verwendungszweck'
	};

	const uebermittlungLabels: Record<string, { label: string; hint: string }> = {
		postkorb: {
			label: 'Elektronisch in den Postkorb',
			hint: 'Als amtliches Dokument direkt im Portal abrufbar und druckbar.'
		},
		post: {
			label: 'Postalisch per Brief',
			hint: 'Postalischer Versand an Ihre amtliche Meldeadresse (ca. 2–3 Werktage).'
		}
	};

	let totalFee = $derived(feeCents * (data.anzahl || 1));
</script>

{#if step === 0}
	<!-- SCHRITT 1: Angaben zur Meldebescheinigung -->
	<div class="space-y-6">
		<PrefilledIdentity {user} {trust} />

		<fieldset class="space-y-3">
			<legend class="field-label">Verwendungszweck</legend>
			<p class="field-hint" id="zweck-hint">
				Geben Sie an, für welche Stelle die Meldebescheinigung benötigt wird.
			</p>

			<div
				class="grid grid-cols-1 gap-2 sm:grid-cols-2"
				role="radiogroup"
				aria-describedby="zweck-hint"
			>
				{#each Object.entries(zweckLabels) as [key, label] (key)}
					<label
						class="flex cursor-pointer items-start gap-3 border p-3 transition-colors {data.zweck ===
						key
							? 'border-amt-700 bg-amt-50 font-bold'
							: 'border-rule bg-sheet hover:border-amt-300'}"
					>
						<input type="radio" name="zweck" value={key} bind:group={data.zweck} class="mt-0.5" />
						<span class="text-sm">{label}</span>
					</label>
				{/each}
			</div>
			{#if errors.zweck}
				<p class="field-error" role="alert">{errors.zweck}</p>
			{/if}
		</fieldset>

		<div>
			<label for="anzahl-input" class="field-label">Anzahl der Exemplare</label>
			<p class="field-hint" id="anzahl-hint">
				Sie können bis zu 5 Ausfertigungen gleichzeitig beantragen (5,00 € je Ausfertigung).
			</p>
			<div class="max-w-xs">
				<select
					id="anzahl-input"
					name="anzahl"
					bind:value={data.anzahl}
					class="input"
					aria-describedby="anzahl-hint"
					aria-invalid={errors.anzahl ? 'true' : undefined}
				>
					<option value={1}>1 Exemplar ({formatFee(feeCents)})</option>
					<option value={2}>2 Exemplare ({formatFee(feeCents * 2)})</option>
					<option value={3}>3 Exemplare ({formatFee(feeCents * 3)})</option>
					<option value={4}>4 Exemplare ({formatFee(feeCents * 4)})</option>
					<option value={5}>5 Exemplare ({formatFee(feeCents * 5)})</option>
				</select>
			</div>
			{#if errors.anzahl}
				<p class="field-error" role="alert">{errors.anzahl}</p>
			{/if}
		</div>

		<fieldset class="space-y-3">
			<legend class="field-label">Übermittlungsweg</legend>
			<p class="field-hint" id="uebermittlung-hint">
				Wählen Sie, wie Sie die Meldebescheinigung erhalten möchten.
			</p>

			<div class="space-y-2" role="radiogroup" aria-describedby="uebermittlung-hint">
				{#each Object.entries(uebermittlungLabels) as [key, item] (key)}
					<label
						class="flex cursor-pointer items-start gap-3 border p-3 transition-colors {data.uebermittlung ===
						key
							? 'border-amt-700 bg-amt-50 font-bold'
							: 'border-rule bg-sheet hover:border-amt-300'}"
					>
						<input
							type="radio"
							name="uebermittlung"
							value={key}
							bind:group={data.uebermittlung}
							class="mt-0.5"
						/>
						<div>
							<span class="block text-sm">{item.label}</span>
							<span class="block text-xs font-normal text-ink-soft">{item.hint}</span>
						</div>
					</label>
				{/each}
			</div>
			{#if errors.uebermittlung}
				<p class="field-error" role="alert">{errors.uebermittlung}</p>
			{/if}
		</fieldset>

		<Alert tone="info" title="Gebührenhinweis">
			<p>
				Die Gebühr beträgt <strong>{formatFee(totalFee)}</strong> ({formatFee(feeCents)} je Ausfertigung).
				Die Gebühr wird mit dem Bescheid erhoben.
			</p>
		</Alert>
	</div>
{:else if step === 1}
	<!-- SCHRITT 2: Prüfen und absenden -->
	<div class="space-y-6">
		<div class="panel p-4">
			<div class="flex items-center justify-between border-b border-rule pb-2">
				<h3 class="text-base font-bold text-ink">Antragsteller/in</h3>
				<span class="text-xs text-ink-soft">Aus BundID verifiziert</span>
			</div>
			<dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
				<div>
					<dt class="font-bold text-ink-soft">Name</dt>
					<dd class="text-ink">{user.firstName} {user.lastName}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Meldeadresse</dt>
					<dd class="text-ink">{user.street}, {user.postalCode} {user.city}</dd>
				</div>
			</dl>
		</div>

		<div class="panel p-4">
			<div class="flex items-center justify-between border-b border-rule pb-2">
				<h3 class="text-base font-bold text-ink">Beantragte Meldebescheinigung</h3>
				{#if onJumpStep}
					<button type="button" class="btn btn-ghost btn-sm" onclick={() => onJumpStep(0)}>
						Ändern
					</button>
				{/if}
			</div>
			<dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
				<div>
					<dt class="font-bold text-ink-soft">Verwendungszweck</dt>
					<dd class="font-medium text-ink">{zweckLabels[data.zweck] ?? data.zweck}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Anzahl</dt>
					<dd class="font-medium text-ink">{data.anzahl} Exemplar{data.anzahl > 1 ? 'e' : ''}</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Übermittlung</dt>
					<dd class="font-medium text-ink">
						{uebermittlungLabels[data.uebermittlung]?.label ?? data.uebermittlung}
					</dd>
				</div>
				<div>
					<dt class="font-bold text-ink-soft">Zu entrichtende Gebühr</dt>
					<dd class="font-bold text-ink">{formatFee(totalFee)} (wird mit Bescheid erhoben)</dd>
				</div>
			</dl>
		</div>

		{#if trust === 'hoch'}
			<Alert tone="ok" title="Sofortige automatische Ausstellung">
				<p>
					Da Sie mit dem Online-Ausweis (Vertrauensniveau Hoch) angemeldet sind, wird Ihre
					Meldebescheinigung nach dem Absenden <strong>sofort automatisiert erstellt</strong> und im Postkorb
					bereitgestellt.
				</p>
			</Alert>
		{:else}
			<Alert tone="info" title="Bearbeitung durch das Bürgeramt">
				<p>
					Ihr Antrag wird nach dem Absenden an das Bürgeramt übermittelt und dort geprüft. Sie
					erhalten eine Benachrichtigung in Ihrem Postkorb, sobald die Bearbeitung abgeschlossen
					ist.
				</p>
			</Alert>
		{/if}

		<div class="border-t border-rule pt-4">
			<label class="flex cursor-pointer items-start gap-3">
				<input
					type="checkbox"
					name="bestaetigt"
					bind:checked={data.bestaetigt}
					class="mt-1"
					aria-invalid={errors.bestaetigt ? 'true' : undefined}
				/>
				<span class="text-sm font-medium text-ink">
					Ich versichere die Richtigkeit der vorstehenden Angaben und beantrage die Ausstellung der
					Meldebescheinigung.
				</span>
			</label>
			{#if errors.bestaetigt}
				<p class="field-error" role="alert">{errors.bestaetigt}</p>
			{/if}
		</div>
	</div>
{/if}
