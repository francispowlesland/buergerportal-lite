<script lang="ts">
	import type { Snippet } from 'svelte';

	/** Native <dialog> modal. Bind `open` to control it; Esc and backdrop click close it. */
	let {
		open = $bindable(false),
		title,
		children,
		onclose
	}: { open?: boolean; title: string; children: Snippet; onclose?: () => void } = $props();

	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	const titleId = $props.id();
</script>

<dialog
	bind:this={dialog}
	aria-labelledby={titleId}
	onclose={() => {
		open = false;
		onclose?.();
	}}
	onclick={(e) => {
		if (e.target === dialog) dialog?.close();
	}}
	class="m-auto w-[min(34rem,calc(100vw-2rem))] border-2 border-ink bg-sheet p-0 text-ink backdrop:bg-ink/60"
>
	<div class="panel-head">
		<h2 id={titleId} class="!text-base !font-bold text-white">{title}</h2>
		<button
			type="button"
			class="min-h-10 min-w-10 text-xl leading-none text-white"
			aria-label="Schließen"
			onclick={() => dialog?.close()}
		>
			×
		</button>
	</div>
	<div class="p-5">{@render children()}</div>
</dialog>
