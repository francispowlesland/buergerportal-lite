<script lang="ts">
	import type { ApplicationStatus, DefectStatus } from '#lib/server/db/schema.ts';
	import { APPLICATION_STATUS, DEFECT_STATUS } from '#lib/labels.ts';
	import Stempel from './Stempel.svelte';

	let {
		status,
		kind = 'application'
	}: { status: ApplicationStatus | DefectStatus; kind?: 'application' | 'defect' } = $props();

	const meta = $derived(
		kind === 'defect'
			? DEFECT_STATUS[status as DefectStatus]
			: APPLICATION_STATUS[status as ApplicationStatus]
	);
</script>

<Stempel tone={meta.tone}>{meta.label}</Stempel>
