<script lang="ts">
	import { writable } from 'svelte/store';
	import Ztrkr from '$lib/Ztrkr.svelte';
	import * as state from '$lib/state';
	import type { N16 } from '$lib/utils';

	const disk = writable(state.defaultDisk());
	const projects = writable($disk.projects);
	const patterns = writable($projects[0].patterns);
	const tracks = writable($patterns[0].tracks);

	const projectIndex = writable(0);
	const patternIndex = writable(0);
	// const patternIndex = writable<N16>(0);
	const trackIndex = writable<N16>(0);
</script>

<Ztrkr {disk} {projects} {patterns} {tracks} {projectIndex} {patternIndex} {trackIndex} />
