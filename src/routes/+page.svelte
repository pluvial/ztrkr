<script lang="ts">
	import Ztrkr from '$lib/Ztrkr.svelte';
	import * as state from '$lib/state';

	const disk = state.defaultDisk();
</script>

<Ztrkr {disk} />
