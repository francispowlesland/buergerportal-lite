<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import { formatDate } from '#lib/format.ts';
	import { MESSAGE_KIND } from '#lib/labels.ts';
	import { TRUST_LABELS } from '#lib/trust.ts';
	import type { DashMessage } from './types.ts';

	let { unreadCount, messages }: { unreadCount: number; messages: DashMessage[] } = $props();
</script>

<section aria-labelledby="postkorb-h">
	<div class="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
		<h2 id="postkorb-h" class="text-2xl">Postkorb</h2>
		<a href="/postkorb" class="font-bold">Postkorb öffnen</a>
	</div>

	{#if unreadCount === 0}
		<EmptyState title="Keine ungelesenen Nachrichten">
			Bescheide, Rückfragen und Statusmeldungen der Ämter erscheinen hier und im Postkorb.
			{#snippet actions()}
				<a href="/postkorb" class="btn">Postkorb öffnen</a>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="panel">
			<p class="border-b border-ink bg-signal-50 px-4 py-3 font-bold text-signal-800">
				{unreadCount === 1 ? '1 ungelesene Nachricht' : `${unreadCount} ungelesene Nachrichten`}
			</p>
			<ul class="divide-y divide-rule">
				{#each messages as m (m.id)}
					<li>
						<a
							href="/postkorb/{m.id}"
							data-sveltekit-preload-data="false"
							class="grid gap-1 p-4 !text-ink no-underline hover:bg-amt-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6"
						>
							<span>
								<span class="block font-bold text-amt-700 underline">{m.subject}</span>
								<span class="block text-sm text-ink-soft">
									{m.fromName}, {formatDate(m.createdAt)}
								</span>
							</span>
							<span class="flex flex-wrap items-start gap-2 sm:justify-end">
								<Stempel tone={MESSAGE_KIND[m.kind].tone}>{MESSAGE_KIND[m.kind].label}</Stempel>
								{#if m.requiredTrust !== 'basis'}
									<Stempel tone="warn">Nur mit {TRUST_LABELS[m.requiredTrust]}</Stempel>
								{/if}
							</span>
						</a>
					</li>
				{/each}
			</ul>
			{#if unreadCount > messages.length}
				<p class="border-t border-rule px-4 py-3 text-sm text-ink-soft">
					Die neuesten {messages.length} von {unreadCount} Nachrichten.
					<a href="/postkorb">Alle im Postkorb lesen</a>
				</p>
			{/if}
		</div>
	{/if}
</section>
