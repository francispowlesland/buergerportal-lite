<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { a11y } from '#lib/a11y.svelte.ts';
	import EmergencyBanner from '#lib/components/chrome/EmergencyBanner.svelte';
	import SiteHeader from '#lib/components/chrome/SiteHeader.svelte';
	import SiteFooter from '#lib/components/chrome/SiteFooter.svelte';
	import DemoPersonaBar from '#lib/components/demo/DemoPersonaBar.svelte';

	let { children, data }: LayoutProps = $props();

	onMount(() => a11y.init());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Bürgerportal Musterstadt</title>
</svelte:head>

<a
	href="#inhalt"
	class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ortsschild focus:p-3 focus:font-bold focus:text-ortsschild-ink"
>
	Zum Inhalt springen
</a>
<EmergencyBanner />
<SiteHeader session={data.session} unread={data.unread} />

<main id="inhalt" class="mx-auto max-w-6xl px-4 pt-8">
	{@render children()}
</main>

<SiteFooter />
<DemoPersonaBar slug={data.session?.slug ?? null} trust={data.session?.trust ?? null} />
