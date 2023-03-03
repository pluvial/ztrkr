<script lang="ts">
	import { onMount } from 'svelte';
	// import Palette from '$lib/Palette.svelte';
	import Ztrkr from '$lib/Ztrkr.svelte';
	import * as state from '$lib/state';
	import * as storage from '$lib/storage';

	let disk = storage.get() ?? state.defaultDisk();

	$: storage.set(disk);

	function visibilitychange(event: Event) {
		if (document.visibilityState === 'hidden') {
			storage.set(disk);
		}
	}

	onMount(() => {
		document.addEventListener('visibilitychange', visibilitychange);
		return () => document.removeEventListener('visibilitychange', visibilitychange);
	});
</script>

<Ztrkr bind:disk on:storage-clear={storage.clear} controls focus />

<!-- <Palette /> -->
