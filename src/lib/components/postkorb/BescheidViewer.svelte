<script lang="ts">
	import { formatDate } from '#lib/format.ts';

	/**
	 * Official Bescheid as a printable letter: Musterstadt seal, address block, text,
	 * Rechtsbehelfsbelehrung and verification code. Screen: framed sheet. Print: plain page.
	 */
	let {
		bescheid,
		recipient,
		reference
	}: {
		bescheid: {
			number: string;
			decision: string;
			bodyText: string;
			rechtsbehelf: string;
			verificationCode: string;
			issuedAt: Date;
		};
		recipient: {
			name: string;
			street: string | null;
			postalCode: string | null;
			city: string | null;
		};
		reference: string | null;
	} = $props();

	const sealId = $props.id();

	const decisionLabel = $derived(bescheid.decision === 'bewilligt' ? 'Bewilligt' : 'Abgelehnt');

	// bodyText: optional heading line, blank line, then paragraphs.
	const parsed = $derived.by(() => {
		const blocks = bescheid.bodyText.split(/\n{2,}/).map((b) => b.trim());
		const first = blocks[0] ?? '';
		const hasHeading = first !== '' && !first.startsWith('Sehr geehrt') && !first.includes('\n');
		return {
			heading: hasHeading
				? first
				: bescheid.decision === 'bewilligt'
					? 'Bescheid über die Bewilligung Ihres Antrags'
					: 'Bescheid über die Ablehnung Ihres Antrags',
			paragraphs: (hasHeading ? blocks.slice(1) : blocks).filter(Boolean)
		};
	});

	// Salutation, closing and "Prüfcode" lines are laid out separately from the body text.
	const rechtsbehelfText = $derived(
		bescheid.rechtsbehelf.replace(/^Rechtsbehelfsbelehrung:\s*/, '')
	);
</script>

<article
	class="mx-auto max-w-[44rem] border-2 border-ink bg-white p-6 font-serif text-[1.0625rem] leading-relaxed text-black sm:p-12 print:max-w-none print:border-0 print:p-0"
	aria-label="Bescheid {bescheid.number}"
>
	<header class="flex items-start justify-between gap-6 border-b-2 border-black pb-4">
		<div>
			<p class="text-2xl font-bold tracking-tight">Stadt Musterstadt</p>
			<p class="text-sm">Der Bürgermeister</p>
			<p class="text-sm">Marktplatz 1, 12345 Musterstadt</p>
		</div>
		<svg
			viewBox="0 0 120 120"
			class="h-24 w-24 shrink-0 text-amt-900"
			role="img"
			aria-label="Dienstsiegel der Stadt Musterstadt"
		>
			<defs>
				<path id="{sealId}-ring" d="M 60 60 m -42 0 a 42 42 0 1 1 84 0 a 42 42 0 1 1 -84 0" />
			</defs>
			<circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="3" />
			<circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" stroke-width="1.5" />
			<text font-size="10.5" font-weight="700" letter-spacing="2.2" fill="currentColor">
				<textPath href="#{sealId}-ring" startOffset="0">
					STADT MUSTERSTADT · KREIS BEISPIEL ·
				</textPath>
			</text>
			<path
				d="M44 74V50l8 8 8-14 8 14 8-8v24z"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linejoin="round"
			/>
			<path d="M44 80h32" stroke="currentColor" stroke-width="2.5" />
		</svg>
	</header>

	<div class="mt-8 grid gap-6 sm:grid-cols-[1fr_auto]">
		<address class="not-italic">
			<p class="mb-1 text-[0.6875rem] underline">
				Stadt Musterstadt · Marktplatz 1 · 12345 Musterstadt
			</p>
			<p class="font-bold">{recipient.name}</p>
			{#if recipient.street}<p>{recipient.street}</p>{/if}
			{#if recipient.postalCode || recipient.city}
				<p>{recipient.postalCode} {recipient.city}</p>
			{/if}
		</address>
		<dl class="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm sm:text-right">
			<dt>Datum:</dt>
			<dd>{formatDate(bescheid.issuedAt)}</dd>
			<dt>Bescheid-Nr.:</dt>
			<dd class="aktenzeichen">{bescheid.number}</dd>
			{#if reference}
				<dt>Ihr Antrag:</dt>
				<dd class="aktenzeichen">{reference}</dd>
			{/if}
		</dl>
	</div>

	<h2 class="mt-10 font-serif !text-xl font-bold !tracking-normal">
		{parsed.heading}
		<span class="ml-2 border-2 border-black px-2 py-0.5 text-sm font-bold uppercase">
			{decisionLabel}
		</span>
	</h2>

	<div class="mt-6 space-y-4">
		{#each parsed.paragraphs as p, i (i)}
			<p class="whitespace-pre-line">{p}</p>
		{/each}
	</div>

	<section class="mt-10 border-2 border-black p-4" aria-labelledby="{sealId}-rb">
		<h3 id="{sealId}-rb" class="font-serif !text-base font-bold !tracking-normal">
			Rechtsbehelfsbelehrung
		</h3>
		<p class="mt-2 text-[0.9375rem]">{rechtsbehelfText}</p>
	</section>

	<footer class="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-black pt-4">
		<div>
			<p class="text-sm">Prüfcode zur Echtheitsbestätigung</p>
			<p class="aktenzeichen font-sans text-xl tracking-widest">{bescheid.verificationCode}</p>
		</div>
		<p class="max-w-[22rem] text-xs">
			Dieser Bescheid wurde maschinell erstellt und ist ohne Unterschrift gültig. Die Echtheit lässt
			sich im Bürgerportal Musterstadt mit dem Prüfcode bestätigen.
		</p>
	</footer>
</article>
