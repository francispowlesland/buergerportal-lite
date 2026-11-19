<script lang="ts">
	import { TRUST_LABELS, type TrustLevel } from '#lib/trust.ts';
	import Stempel from './Stempel.svelte';

	/** Shows a Vertrauensniveau, e.g. "Vertrauensniveau Hoch". */
	let { level, prefix = 'Vertrauensniveau' }: { level: TrustLevel; prefix?: string } = $props();

	const tone = $derived(level === 'hoch' ? 'ok' : level === 'substanziell' ? 'info' : 'neutral');
</script>

<Stempel {tone}>{prefix} {TRUST_LABELS[level]}</Stempel>
