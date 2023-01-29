<script lang="ts">
	import { onMount } from 'svelte';
	import Keys from '$lib/Keys.svelte';
	import { keyToStep } from '$lib/keyboard';

	let bpm = 120;
	let fpb = 4;
	let frame = 0;
	let playing = false;

	let patternLength = 16;
	$: patternFrame = frame % patternLength;

	let currentFrameTime = 0;
	let deltaFrame = 60e3 / (fpb * bpm);
	$: deltaFrame = 60e3 / (fpb * bpm);
	let nextFrameTime = deltaFrame;
	// $: nextFrameTime = currentFrameTime + deltaFrame;

	const raf: FrameRequestCallback = time => {
		if (playing) {
			// time leap is too large, restarting playback
			if (time > currentFrameTime + 2 * deltaFrame) {
				currentFrameTime = time;
				nextFrameTime = currentFrameTime + deltaFrame;
			} else if (time >= nextFrameTime) {
				frame += 1;
				currentFrameTime = time;
				// currentFrameTime = nextFrameTime;
				nextFrameTime += deltaFrame;
			}
		}
		// debug logging
		// const delta = time - currentFrameTime;
		// console.log({ delta, time });
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
		frame = 0;
	}

	function clickPlayPause(event: MouseEvent) {
		if (playing) pause();
		else play();
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

			if (key === ' ') {
				if (shiftKey) {
					stop();
				} else {
					if (playing) pause();
					else play();
					return;
				}
			}

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
<p>FPB: {fpb}</p>
<input type="range" min={1} max={16} bind:value={fpb} />
<p>Pattern length: {patternLength}</p>
<input type="range" min={1} max={16} bind:value={patternLength} />

<Keys highlighted={[patternFrame]} active={activeSteps} pressed={pressedSteps} {showKeys} />

<button type="button" on:click={clickRec}>Rec</button>
<button type="button" on:click={clickPlayPause}>{playing ? 'Pause' : 'Play'}</button>
<button type="button" on:click={clickStop}>Stop</button>

<svelte:window on:keydown={keydown} on:keypress={keypress} on:keyup={keyup} />
