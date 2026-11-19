<script lang="ts">
	import { page } from '$app/state';
	import type { ScopeInfo } from './types.ts';

	let { scope }: { scope: ScopeInfo } = $props();

	const id = $props.id();

	// Keep every other query parameter (filters) when the Amt changes.
	const others = $derived([...page.url.searchParams].filter(([k]) => k !== 'amt'));
</script>

<form method="GET" action={page.url.pathname} class="flex flex-wrap items-end gap-2">
	{#each others as [name, value] (name)}
		<input type="hidden" {name} {value} />
	{/each}
	<div>
		<label class="field-label" for="{id}-amt">Zuständigkeitsbereich</label>
		<select id="{id}-amt" name="amt" class="min-w-56">
			<option value="alle" selected={scope.slug === 'alle'}>Alle Ämter</option>
			{#each scope.offices as office (office.slug)}
				<option value={office.slug} selected={scope.slug === office.slug}>
					{office.name}{office.slug === scope.ownSlug ? ' (Ihr Amt)' : ''}
				</option>
			{/each}
		</select>
	</div>
	<button class="btn btn-sm">Anzeigen</button>
</form>
