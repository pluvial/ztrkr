<script lang="ts">
	import { onMount } from 'svelte';
	import Keys from '$lib/Keys.svelte';

	// let pressed: string[] = [];
	// let pressed: Record<string, boolean> = {};
	let pressed = new Set<string>();

	function keydown(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		console.log(event);
		console.log({ code, key, altKey, ctrlKey, shiftKey });

		// pressed[key] = true;
		pressed.add(key);
		pressed = pressed;
	}

	function keyup(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		console.log(event);
		console.log({ code, key, altKey, ctrlKey, shiftKey });

		// pressed[key] = false;
		pressed.delete(key);
		pressed = pressed;
	}

	function midimessage(event: WebMidi.MIDIMessageEvent) {
		let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
		for (const character of event.data) {
			str += `0x${character.toString(16)} `;
		}
		console.log(str);
	}

	let midi: WebMidi.MIDIAccess;

	onMount(async () => {
		midi = await navigator.requestMIDIAccess();

		for (const [, input] of midi.inputs) {
			console.log(
				`Input port [type:'${input.type}']` +
					` id:'${input.id}'` +
					` manufacturer:'${input.manufacturer}'` +
					` name:'${input.name}'` +
					` version:'${input.version}'`,
			);
		}
		for (const [, output] of midi.outputs) {
			console.log(
				`Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
			);
		}

		midi.inputs.forEach(entry => {
			entry.onmidimessage = midimessage;
		});
	});
</script>

<!-- <Keys pressed={Object.keys(pressed)} /> -->
<Keys highlighted={['a']} pressed={[...pressed.keys()]} />

<svelte:window on:keydown={keydown} on:keyup={keyup} />
