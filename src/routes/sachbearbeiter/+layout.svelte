<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- no base path is configured; links are root-relative like the shared chrome */
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import ScopeSwitch from '#lib/components/admin/ScopeSwitch.svelte';
	import { scopeHref } from '#lib/components/admin/scope.ts';

	let { data, children }: LayoutProps = $props();

	const links = $derived([
		{ href: '/sachbearbeiter', label: 'Übersicht', exact: true },
		{ href: '/sachbearbeiter/antraege', label: 'Anträge', exact: false },
		{ href: '/sachbearbeiter/maengel', label: 'Mängelmelder', exact: false }
	]);

	const isActive = (href: string, exact: boolean) =>
		exact ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<div class="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
	<nav aria-label="Bereiche der Sachbearbeitung">
		<ul class="flex flex-wrap gap-1">
			{#each links as link (link.href)}
				<li>
					<a
						href={scopeHref(link.href, data.scope)}
						aria-current={isActive(link.href, link.exact) ? 'page' : undefined}
						class="flex min-h-11 items-center border-b-4 px-3 font-bold text-ink no-underline hover:bg-amt-50 hover:no-underline {isActive(
							link.href,
							link.exact
						)
							? 'border-amt-700'
							: 'border-transparent'}"
					>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
	<ScopeSwitch scope={data.scope} />
</div>

{@render children()}
