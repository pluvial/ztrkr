<script lang="ts">
	import Palette from '$lib/Palette.svelte';
	import Ztrkr from '$lib/Ztrkr.svelte';
	import * as state from '$lib/state';
	import * as storage from '$lib/storage';

	let disk = storage.get() ?? state.defaultDisk();

	$: storage.set(disk);
</script>

<Ztrkr bind:disk on:storage-clear={storage.clear} />

<Palette />
