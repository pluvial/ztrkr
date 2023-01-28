<script lang="ts">
	import { onMount } from 'svelte';
	import Keys from '$lib/Keys.svelte';
	import { keyToStep } from '$lib/keyboard';

	let bpm = 120;
	let frame = 0;
	let playing = false;
	let position = 0;

	let prevTime = 0;
	const raf: FrameRequestCallback = time => {
		const delta = time - prevTime;
		// debug logging
		console.log({ delta, time });

		prevTime = time;
		requestAnimationFrame(raf);
	};

	function play() {
		playing = true;
	}

	function pause() {
		playing = false;
	}

	function stop() {
		playing = false;
		position = 0;
	}

	function clickPlay(event: MouseEvent) {
		play();
	}

	function clickPause(event: MouseEvent) {
		pause();
	}

	function clickStop(event: MouseEvent) {
		stop();
	}

	function clickRec(event: MouseEvent) {
		// TODO
	}

	let showKeys = false;

	let active = new Set<string>();
	let pressed = new Set<string>();

	const numberP = (n: number | undefined): n is number => n !== undefined;

	$: activeSteps = Array.from(active.keys(), keyToStep).filter(numberP);
	$: pressedSteps = Array.from(pressed.keys(), keyToStep).filter(numberP);

	function keydown(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		if (!pressed.has(key)) {
			pressed.add(key);
			pressed = pressed;
			if (active.has(key)) {
				active.delete(key);
				if (key === '?') showKeys = false;
			} else {
				active.add(key);
				if (key === '?') showKeys = true;
			}
			active = active;
		}
	}

	function keypress(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		if (pressed.has(key)) {
			// pressed.delete(key);
			// pressed = pressed;
		}
	}

	function keyup(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		if (pressed.has(key)) {
			pressed.delete(key);
			pressed = pressed;
		}
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

		requestAnimationFrame(raf);
	});
</script>

<p>BPM: {bpm}</p>
<input type="range" min={20} max={300} bind:value={bpm} />

<button type="button" on:click={clickPlay}>Play</button>
<button type="button" on:click={clickPause}>Pause</button>
<button type="button" on:click={clickStop}>Stop</button>
<button type="button" on:click={clickRec}>Rec</button>

<Keys highlighted={[0]} active={activeSteps} pressed={pressedSteps} {showKeys} />

<svelte:window on:keydown={keydown} on:keypress={keypress} on:keyup={keyup} />
