<script lang="ts">
	import { onMount } from 'svelte';
	import Keys from '$lib/Keys.svelte';

	let active = new Set<string>();

	let pressed = new Set<string>();

	function keydown(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		if (!pressed.has(key)) {
			if (active.has(key)) {
				active.delete(key);
			} else {
				active.add(key);
			}
			active = active;
		}
		pressed.add(key);
		pressed = pressed;
	}

	function keyup(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

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

<Keys highlighted={['a']} active={[...active.keys()]} pressed={[...pressed.keys()]} />

<svelte:window on:keydown={keydown} on:keyup={keyup} />
