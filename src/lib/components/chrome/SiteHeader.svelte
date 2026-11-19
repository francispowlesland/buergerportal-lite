<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Ortsschild from '#lib/components/ui/Ortsschild.svelte';
	import Stempel from '#lib/components/ui/Stempel.svelte';
	import { a11y } from '#lib/a11y.svelte.ts';
	import { HOME } from '#lib/personas.ts';
	import { TRUST_LABELS, type TrustLevel } from '#lib/trust.ts';

	type Session = {
		role: 'citizen' | 'caseworker';
		firstName: string;
		lastName: string;
		trust: TrustLevel;
	} | null;

	let { session, unread }: { session: Session; unread: number } = $props();

	let menuOpen = $state(false);

	const links = $derived(
		session?.role === 'caseworker'
			? ([
					{ href: '/sachbearbeiter', label: 'Sachbearbeitung' },
					{ href: '/dienste', label: 'Leistungen' },
					{ href: '/maengelmelder', label: 'Mängelmelder' }
				] as const)
			: ([
					{ href: '/dienste', label: 'Leistungen' },
					{ href: '/termine', label: 'Termine' },
					{ href: '/maengelmelder', label: 'Mängelmelder' },
					...(session ? [{ href: '/postkorb' as const, label: 'Postkorb' }] : [])
				] as const)
	);

	const isActive = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(href + '/');
</script>

<header class="no-print border-b-2 border-ink bg-sheet">
	<!-- Hilfsleiste -->
	<div class="border-b border-rule bg-paper">
		<div
			class="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-x-4 gap-y-1 px-4 py-1 text-sm"
		>
			<button
				type="button"
				class="min-h-11 font-bold underline decoration-1 underline-offset-4"
				aria-pressed={a11y.leicht}
				onclick={() => a11y.toggleLeicht()}
			>
				Leichte Sprache {a11y.leicht ? 'aus' : 'an'}
			</button>
			<button
				type="button"
				class="min-h-11 font-bold underline decoration-1 underline-offset-4"
				aria-pressed={a11y.contrast}
				onclick={() => a11y.toggleContrast()}
			>
				Hoher Kontrast {a11y.contrast ? 'aus' : 'an'}
			</button>
			<button
				type="button"
				class="min-h-11 font-bold underline decoration-1 underline-offset-4"
				aria-pressed={a11y.dark}
				onclick={() => a11y.toggleDark()}
			>
				Dunkler Modus {a11y.dark ? 'aus' : 'an'}
			</button>
			<a href={resolve('/dienste')} class="min-h-11 py-1 font-bold">Suche</a>
		</div>
	</div>

	<div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
		<a
			href={resolve('/')}
			class="flex items-center gap-3 no-underline hover:no-underline"
			aria-label="Bürgerportal Musterstadt, Startseite"
		>
			<Ortsschild />
			<span
				class="hidden font-display text-lg leading-tight font-bold text-ink sm:block"
				style="font-stretch: 108%"
			>
				Bürger&shy;portal
			</span>
		</a>

		<button
			type="button"
			class="btn btn-sm ml-auto md:hidden"
			aria-expanded={menuOpen}
			aria-controls="hauptnavigation"
			onclick={() => (menuOpen = !menuOpen)}
		>
			Menü
		</button>

		<nav
			id="hauptnavigation"
			aria-label="Hauptnavigation"
			class="{menuOpen
				? 'flex'
				: 'hidden'} w-full flex-col gap-1 md:ml-2 md:flex md:w-auto md:flex-row md:gap-1"
		>
			{#each links as link (link.href)}
				<a
					href={resolve(link.href)}
					onclick={() => (menuOpen = false)}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class="flex min-h-11 items-center gap-2 border-b-4 px-3 font-bold text-ink no-underline hover:bg-amt-50 hover:no-underline {isActive(
						link.href
					)
						? 'border-amt-700'
						: 'border-transparent'}"
				>
					{link.label}
					{#if link.href === '/postkorb' && unread > 0}
						<span
							class="min-w-6 rounded-full bg-signal-600 px-1.5 text-center text-sm font-bold text-white"
						>
							{unread}<span class="visually-hidden"> ungelesen</span>
						</span>
					{/if}
				</a>
			{/each}
		</nav>

		<div class="flex w-full flex-wrap items-center gap-3 md:ml-auto md:w-auto">
			{#if session}
				<div class="text-sm leading-tight">
					<a
						href={resolve(HOME[session.role])}
						class="font-bold text-ink no-underline hover:underline"
					>
						{session.firstName}
						{session.lastName}
					</a>
					<div class="mt-1">
						<Stempel
							tone={session.trust === 'hoch'
								? 'ok'
								: session.trust === 'substanziell'
									? 'info'
									: 'neutral'}
						>
							{TRUST_LABELS[session.trust]}
						</Stempel>
					</div>
				</div>
				<form method="POST" action="/auth/logout">
					<button class="btn btn-sm">Abmelden</button>
				</form>
			{:else}
				<a
					href={resolve(`/auth/login?redirectTo=${encodeURIComponent(page.url.pathname)}`)}
					class="btn btn-primary btn-sm"
				>
					Mit BundID anmelden
				</a>
			{/if}
		</div>
	</div>
</header>
