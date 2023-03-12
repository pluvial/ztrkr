<script lang="ts">
	import { onMount } from 'svelte';
	import Ztrkr from '$lib/Ztrkr.svelte';
	import { defaultDisk } from '$lib/state';
	import * as storage from '$lib/storage';

	let disk = storage.get() ?? defaultDisk();

	$: storage.set(disk);

	function diskClear() {
		storage.clear();
		disk = defaultDisk();
	}

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

<div>
	<Ztrkr bind:disk on:disk-clear={diskClear} focus />
	<Ztrkr bind:disk on:disk-clear={diskClear} />
	<Ztrkr bind:disk on:disk-clear={diskClear} />
</div>
