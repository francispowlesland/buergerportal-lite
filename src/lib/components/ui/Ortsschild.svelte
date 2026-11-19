<script lang="ts">
	/** The Musterstadt town sign. Yellow plate, black frame, like the real Ortstafel. */
	let { size = 'md' }: { size?: 'md' | 'lg' } = $props();
</script>

<span class="ortsschild" class:lg={size === 'lg'}>
	<span class="name">Musterstadt</span>
	<span class="sub">Kreis Beispiel</span>
</span>

<style>
	.name {
		font-weight: 800;
		font-stretch: 112%;
		font-size: 1.375rem;
		letter-spacing: -0.01em;
	}
	.sub {
		margin-top: 0.15rem;
		font-weight: 500;
		font-size: 0.625rem;
		letter-spacing: 0.04em;
	}
	.lg .name {
		font-size: clamp(2.25rem, 1.5rem + 4vw, 4.5rem);
		letter-spacing: -0.02em;
	}
	.lg .sub {
		font-size: clamp(0.75rem, 0.6rem + 0.6vw, 1.125rem);
	}
	.lg {
		padding: 0.5rem 1.25rem 0.65rem;
		border-width: 5px;
		border-radius: 10px;
	}
</style>
