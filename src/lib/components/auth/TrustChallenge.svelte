<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { TRUST_LABELS, TRUST_METHODS, type TrustLevel } from '#lib/trust.ts';

	/**
	 * One credential form per Vertrauensniveau. Posts to the login page's `verify` action,
	 * so it works from any page (login screen, Postkorb step-up, …).
	 */
	let {
		level,
		redirectTo = '',
		identities = null
	}: {
		level: TrustLevel;
		redirectTo?: string;
		/** Anonymous visitors must say who they are. Null = already signed in (step-up). */
		identities?: { slug: string; name: string }[] | null;
	} = $props();

	let message = $state('');
	let busy = $state(false);
	// eID only: simulated card reader.
	let reader = $state<'idle' | 'searching' | 'found'>('idle');

	const id = $props.id();

	function searchCard() {
		reader = 'searching';
		setTimeout(() => (reader = 'found'), 1400);
	}
</script>

<form
	method="POST"
	action="/auth/login?/verify"
	class="grid gap-4"
	use:enhance={() => {
		busy = true;
		message = '';
		return async ({ result }) => {
			busy = false;
			if (result.type === 'failure') {
				message =
					typeof result.data?.message === 'string'
						? result.data.message
						: 'Die Anmeldung ist fehlgeschlagen.';
			} else {
				await applyAction(result);
			}
		};
	}}
>
	<input type="hidden" name="level" value={level} />
	<input type="hidden" name="redirectTo" value={redirectTo} />

	{#if identities}
		<div>
			<label class="field-label" for="{id}-user">
				{level === 'hoch' ? 'Personalausweis' : 'Benutzername'}
			</label>
			{#if level === 'hoch'}
				<select id="{id}-user" name="username" required>
					{#each identities as who (who.slug)}
						<option value={who.slug}>{who.name}</option>
					{/each}
				</select>
			{:else}
				<input
					id="{id}-user"
					name="username"
					type="text"
					autocomplete="username"
					required
					placeholder="z. B. max"
				/>
			{/if}
		</div>
	{/if}

	{#if level === 'basis'}
		<div>
			<label class="field-label" for="{id}-pw">Passwort</label>
			<input
				id="{id}-pw"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
		</div>
	{:else if level === 'substanziell'}
		<div>
			<label class="field-label" for="{id}-cert">ELSTER-Zertifikat</label>
			<select id="{id}-cert">
				<option>elster_zertifikat_2026.pfx (Demo)</option>
			</select>
		</div>
		<div>
			<label class="field-label" for="{id}-code">Bestätigungscode</label>
			<span class="field-hint">6 Ziffern aus Ihrer Authenticator-App.</span>
			<input
				id="{id}-code"
				name="code"
				type="text"
				inputmode="numeric"
				autocomplete="one-time-code"
				maxlength="6"
				pattern="\d{'{6}'}"
				required
			/>
		</div>
	{:else}
		<div class="panel-quiet flex items-center gap-4 p-4" aria-live="polite">
			<svg viewBox="0 0 48 32" class="h-10 w-14 shrink-0" aria-hidden="true">
				<rect
					x="1"
					y="1"
					width="46"
					height="30"
					rx="3"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				/>
				<circle cx="14" cy="14" r="5" fill="none" stroke="currentColor" stroke-width="2" />
				<path d="M26 11h16M26 17h12M8 25h14" stroke="currentColor" stroke-width="2" />
			</svg>
			<div class="min-w-0">
				{#if reader === 'idle'}
					<p class="font-bold">Ausweis auflegen</p>
					<p class="text-sm text-ink-soft">
						Legen Sie Ihren Personalausweis an das Kartenlesegerät.
					</p>
				{:else if reader === 'searching'}
					<p class="font-bold">Ausweis wird gelesen …</p>
					<p class="text-sm text-ink-soft">Bitte nicht bewegen.</p>
				{:else}
					<p class="font-bold text-status-800">Ausweis erkannt</p>
					<p class="text-sm text-ink-soft">Geben Sie jetzt Ihre 6-stellige PIN ein.</p>
				{/if}
			</div>
			{#if reader === 'idle'}
				<button type="button" class="btn btn-sm ml-auto" onclick={searchCard}>
					Ausweis auflegen
				</button>
			{/if}
		</div>
		{#if reader === 'found'}
			<div>
				<label class="field-label" for="{id}-pin">PIN</label>
				<input
					id="{id}-pin"
					name="pin"
					type="password"
					inputmode="numeric"
					autocomplete="off"
					maxlength="6"
					pattern="\d{'{6}'}"
					required
					class="tracking-[0.6em]"
				/>
			</div>
		{/if}
	{/if}

	{#if message}
		<p class="field-error" role="alert">{message}</p>
	{/if}

	<button class="btn btn-primary" disabled={busy || (level === 'hoch' && reader !== 'found')}>
		{busy ? 'Wird geprüft …' : `Mit Vertrauensniveau ${TRUST_LABELS[level]} anmelden`}
	</button>
	<p class="text-sm text-ink-soft">
		{TRUST_METHODS[level]}. Demo: {level === 'basis'
			? 'Passwort demo1234'
			: 'Code bzw. PIN 123456'}.
	</p>
</form>
