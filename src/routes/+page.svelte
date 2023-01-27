<script lang="ts">
	function keydown(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		console.log(event);
		console.log({ code, key, altKey, ctrlKey, shiftKey });
		// TODO
	}

	function keyup(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		console.log(event);
		console.log({ code, key, altKey, ctrlKey, shiftKey });
		// TODO
	}
</script>

<svelte:window on:keydown={keydown} on:keyup={keyup} />
