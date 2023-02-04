<script lang="ts">
	import { onMount } from 'svelte';
	import Display from '$lib/Display.svelte';
	import Keys from '$lib/Keys.svelte';
	import { keyToStep, stepToKey } from '$lib/keyboard';
	import { allChannelsAllNotesOff, note } from '$lib/midi';

	let bpm = 120;
	let fpb = 4;
	let frame = 0;
	let playing = false;

	let channel = 0;
	let patternLength = 16;
	let patternStep = 0;
	// $: patternStep = frame % patternLength;

	let currentFrameTime = 0;
	let deltaFrame = 60e3 / (fpb * bpm);
	$: deltaFrame = 60e3 / (fpb * bpm);
	let nextFrameTime = deltaFrame;
	// $: nextFrameTime = currentFrameTime + deltaFrame;

	const raf: FrameRequestCallback = time => {
		if (playing) {
			let trigger = false;
			// time leap is too large, restarting playback
			if (time > currentFrameTime + 2 * deltaFrame) {
				currentFrameTime = time;
				nextFrameTime = currentFrameTime + deltaFrame;
				trigger = true;
			} else if (time >= nextFrameTime) {
				frame += 1;
				patternStep = frame % patternLength;
				// currentFrameTime = time;
				currentFrameTime = nextFrameTime;
				nextFrameTime += deltaFrame;
				trigger = true;
			}
			if (trigger && activeSteps.includes(patternStep)) {
				const duration = 500;
				const timestamp = currentFrameTime;
				console.debug(
					`Note event: channel - ${channel}, duration - ${duration}, timestamp - ${timestamp}`,
				);
				output && note(output, channel, duration, timestamp);
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
		patternStep = 0;
		output && allChannelsAllNotesOff(output);
	}

	function clickPlayPause(_event: MouseEvent) {
		if (playing) pause();
		else play();
	}

	function clickStop(_event: MouseEvent) {
		stop();
	}

	function clickRec(_event: MouseEvent) {
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
				}
				return;
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
		console.debug(str);
	}

	let midi: WebMidi.MIDIAccess;

	let inputs: WebMidi.MIDIInput[] = [];
	let outputs: WebMidi.MIDIOutput[] = [];

	let inputIndex = 0;
	let outputIndex = 0;

	$: input = inputs.at(inputIndex);
	$: output = outputs.at(outputIndex);

	onMount(async () => {
		requestAnimationFrame(raf);

		try {
			midi = await navigator.requestMIDIAccess();
		} catch {
			console.warn('No MIDI access');
			return;
		}

		inputs = [...midi.inputs.values()];
		outputs = [...midi.outputs.values()];

		if (inputs.length === 0) {
			console.warn('No MIDI inputs available');
		}
		if (outputs.length === 0) {
			console.warn('No MIDI outputs available');
		}

		for (const input of inputs) {
			input.onmidimessage = midimessage;

			// debug logging
			console.debug(
				`Input port [type:'${input.type}']` +
					` id:'${input.id}'` +
					` manufacturer:'${input.manufacturer}'` +
					` name:'${input.name}'` +
					` version:'${input.version}'`,
			);
		}

		for (const output of outputs) {
			// debug logging
			console.debug(
				`Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
			);
		}
	});
</script>

<Display />

<Keys
	highlighted={[patternStep]}
	active={activeSteps}
	pressed={pressedSteps}
	{showKeys}
	on:click={event => {
		// TODO: remove temporary hack
		const key = stepToKey(event.detail);
		if (active.has(key)) {
			active.delete(key);
		} else {
			active.add(key);
		}
		active = active;
	}}
/>

<p>Press ? to toggle keybindings</p>

<div class="flex">
	<div class="flex">
		<p>BPM: {bpm}</p>
		<input type="range" min={20} max={300} bind:value={bpm} />
	</div>
	<div class="flex">
		<p>FPB: {fpb}</p>
		<input type="range" min={1} max={16} bind:value={fpb} />
	</div>
	<div class="flex">
		<p>
			Pattern length: {patternLength}
		</p>
		<input type="range" min={1} max={16} bind:value={patternLength} />
	</div>
</div>

<p>
	<button type="button" on:click={clickRec}>Rec</button><button
		type="button"
		on:click={clickPlayPause}>{playing ? 'Pause' : 'Play'}</button
	><button type="button" on:click={clickStop}>Stop</button>
</p>

<p>
	<button on:click={() => (inputIndex = (inputIndex + inputs.length - 1) % inputs.length)}>-</button
	><button on:click={() => (inputIndex = (inputIndex + 1) % inputs.length)}>+</button>MIDI Input: {input?.name ??
		'N/A'}
</p>

<p>
	<button on:click={() => (outputIndex = (outputIndex + outputs.length - 1) % outputs.length)}
		>-</button
	><button on:click={() => (outputIndex = (outputIndex + 1) % outputs.length)}>+</button>MIDI
	Output: {output?.name ?? 'N/A'}
</p>

<svelte:window on:keydown={keydown} on:keypress={keypress} on:keyup={keyup} />

<style>
	p {
		margin-top: 10px;
	}

	.flex {
		display: flex;
	}

	button {
		border: 1px solid #ccc;
		padding: 0.5em;
		margin-right: 1em;
	}
</style>
