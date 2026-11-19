<script lang="ts">
	import type { User } from '#lib/server/db/schema.ts';
	import type { TrustLevel } from '#lib/trust.ts';
	import TrustBadge from '#lib/components/ui/TrustBadge.svelte';
	import { formatDate } from '#lib/format.ts';

	let {
		user,
		trust
	}: {
		user: User;
		trust?: TrustLevel | null;
	} = $props();
</script>

<div class="panel-quiet p-4">
	<div class="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-2">
		<div class="flex items-center gap-2">
			<span class="text-sm font-bold text-ink">Aus Ihrem BundID-Konto übernommen</span>
			{#if trust}
				<TrustBadge level={trust} />
			{/if}
		</div>
		<span class="text-xs text-ink-soft">Automatisch ausgefüllt &amp; verifiziert</span>
	</div>

	<dl class="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
		<div>
			<dt class="font-bold text-ink-soft">Vollständiger Name</dt>
			<dd class="font-medium text-ink">{user.firstName} {user.lastName}</dd>
		</div>

		{#if user.birthDate}
			<div>
				<dt class="font-bold text-ink-soft">Geburtsdatum</dt>
				<dd class="font-medium text-ink">{formatDate(user.birthDate)}</dd>
			</div>
		{/if}

		<div>
			<dt class="font-bold text-ink-soft">Amtliche Meldeadresse</dt>
			<dd class="font-medium text-ink">
				{user.street ?? 'Marktplatz 1'}, {user.postalCode ?? '12345'}
				{user.city ?? 'Musterstadt'}
			</dd>
		</div>

		{#if user.steuerId}
			<div>
				<dt class="font-bold text-ink-soft">Steuer-ID</dt>
				<dd class="font-medium text-ink tabular-nums">{user.steuerId}</dd>
			</div>
		{/if}
	</dl>
</div>
