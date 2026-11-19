<script lang="ts">
	import { page } from '$app/state';
	import Modal from '#lib/components/ui/Modal.svelte';
	import TrustChallenge from './TrustChallenge.svelte';
	import { TRUST_LABELS, type TrustLevel } from '#lib/trust.ts';

	/**
	 * Step-up authentication for a signed-in user whose session level is too low.
	 * After success the server redirects back to the current page, so load functions re-run.
	 *
	 * <StepUpModal bind:open required="hoch" />
	 */
	let { open = $bindable(false), required }: { open?: boolean; required: TrustLevel } = $props();
</script>

<Modal bind:open title="Zusätzliche Bestätigung erforderlich">
	<p class="mb-4">
		Dieser Inhalt ist nur mit Vertrauensniveau <strong>{TRUST_LABELS[required]}</strong> zugänglich. Bitte
		bestätigen Sie Ihre Identität.
	</p>
	<TrustChallenge level={required} redirectTo={page.url.pathname + page.url.search} />
</Modal>
