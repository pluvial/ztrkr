<script lang="ts">
	import Ztrkr from '$lib/Ztrkr.svelte';
	import * as state from '$lib/state';
	import * as storage from '$lib/storage';

	let disk = storage.get() ?? state.defaultDisk();

	$: storage.set(disk);
</script>

<div>
	<Ztrkr bind:disk on:storage-clear={storage.clear} focus />
	<Ztrkr bind:disk on:storage-clear={storage.clear} />
	<Ztrkr bind:disk on:storage-clear={storage.clear} />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		gap: 2em;
	}
</style>
