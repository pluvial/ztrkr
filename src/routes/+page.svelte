<script lang="ts">
	import { onMount } from 'svelte';
	import Display from '$lib/Display.svelte';
	import Keys from '$lib/Keys.svelte';
	import { keyToStep, stepToKey } from '$lib/keyboard';
	import { allChannelsAllNotesOff, note } from '$lib/midi';
	import {
		disk,
		newPattern,
		newProject,
		pattern,
		patternIndex,
		patterns,
		project,
		projectIndex,
		projects,
		track,
		trackIndex,
		tracks,
	} from '$lib/stores';
	import { type N16, type T16, array16V, zero16 } from '$lib/state';

	// debug logging
	$: console.debug({ $disk });
	$: console.debug({ $projects });
	$: console.debug({ $patterns });
	$: console.debug({ $tracks });

	$: console.debug({ $pattern });
	$: console.debug({ $project });
	$: console.debug({ $track });

	// let scaleModeChecked = false;
	$: scaleMode = $pattern.scaleMode;
	$: scaleModeChecked = scaleMode === 'per-track';

	$: tempoMode = $pattern.tempoMode;
	$: tempoModeChecked = tempoMode === 'global';

	$: bpm = tempoMode === 'global' ? $project.tempo : ($pattern.tempo as number);

	function setBPM(value: number) {
		value = Math.max(20, Math.min(value, 400));
		if (tempoMode === 'global') {
			$projects[$projectIndex].tempo = value;
			// $project.tempo = value;
		} else {
			$patterns[$patternIndex].tempo = value;
			// $pattern.tempo = value;
		}
	}

	$: scales =
		scaleMode === 'per-pattern'
			? array16V($pattern.scale as number)
			: $tracks.map(track => track.scale as number);

	$: scale = scales[$trackIndex];

	function setScale(value: number) {
		value = Math.max(1 / 16, Math.min(value, 4));
		if (scaleMode === 'per-pattern') {
			$patterns[$patternIndex].scale = value;
			// $pattern.scale = value;
		} else {
			$tracks[$trackIndex].scale = value;
			// $track.scale = value;
		}
	}

	let frames = zero16();

	let playing = false;

	$: lengths =
		scaleMode === 'per-pattern' ? array16V($pattern.length) : $tracks.map(t => t.length as number);

	$: length = lengths[$trackIndex];

	function setLength(value: number) {
		value = Math.max(1, Math.min(value, 64));
		if (scaleMode === 'per-pattern') {
			$patterns[$patternIndex].length = value;
			// $pattern.length = value;
		} else {
			$tracks[$trackIndex].length = value;
			// $track.length = value;
		}
	}

	let patternSteps = zero16();
	// $: patternSteps = frames.map((f, i) => f % lengths[i])
	// let patternStep = 0
	$: patternStep = frames[$trackIndex] % length;

	let currentFrameTimes = zero16();
	// scale = 1 <=> fpb = 4
	$: frameDeltas = scales.map(s => 60e3 / (4 * s * bpm)) as T16;

	let nextFrameTimes: T16;
	$: if (!nextFrameTimes && frameDeltas) nextFrameTimes = [...frameDeltas];
	// let nextFrameTimes = [...frameDeltas];

	$: activeTracks = zero16().filter(
		(_, t) => !$project.mutes.has(t as N16) && !$pattern.mutes.has(t as N16),
	);

	const raf: FrameRequestCallback = time => {
		if (playing) {
			for (const t of activeTracks) {
				const track = $tracks[t];
				const frameDelta = frameDeltas[t];
				let frame = frames[t];
				let step = patternSteps[t];
				let currentFrameTime = currentFrameTimes[t];
				let nextFrameTime = nextFrameTimes[t];

				let trigger = false;
				// time leap is too large, restarting playback
				if (time > currentFrameTime + 2 * frameDelta) {
					currentFrameTime = time;
					nextFrameTime = currentFrameTime + frameDelta;
					trigger = true;
				} else if (time >= nextFrameTime) {
					frame += 1;
					step = (step + 1) % lengths[t];
					currentFrameTime = nextFrameTime;
					nextFrameTime += frameDelta;
					trigger = true;
				}
				const trig = track.steps[step];
				if (trigger && trig?.type === 'note') {
					const channel = trig.channel ?? track.channel;
					const noteLength = trig.noteLength ?? track.noteLength;
					// TODO: flesh out
					const noteNumber = trig.noteNumber ?? track.noteNumber;
					const velocity = trig.velocity ?? track.velocity;
					const probability = trig.probability ?? track.probability;
					const timestamp = currentFrameTime;
					console.debug(
						`Note event: channel - ${channel}, length - ${noteLength}, timestamp - ${timestamp}`,
					);
					output && note(output, channel, noteLength, timestamp);
				}
				frames[t] = frame;
				patternSteps[t] = step;
				currentFrameTimes[t] = currentFrameTime;
				nextFrameTimes[t] = nextFrameTime;
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
		frames = zero16();
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

	let activeKeys = new Set<string>();
	let pressedKeys = new Set<string>();

	const numberP = (n: number | undefined): n is number => n !== undefined;

	$: activeSteps = $track.steps.reduce(
		(activeSteps, step, index) => (step ? [...activeSteps, index] : activeSteps),
		[] as number[],
	);

	function toggleStep(step: number) {
		if ($track.steps[step]) {
			$tracks[$trackIndex].steps[step] = undefined;
		} else {
			$tracks[$trackIndex].steps[step] = { type: 'note' };
		}
	}

	// $: activeSteps = Array.from(activeKeys.keys(), keyToStep).filter(numberP);
	$: pressedSteps = Array.from(pressedKeys.keys(), keyToStep).filter(numberP);

	function keydown(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		if (!pressedKeys.has(key)) {
			pressedKeys.add(key);
			pressedKeys = pressedKeys;

			if (key === ' ') {
				if (shiftKey) {
					stop();
				} else {
					if (playing) pause();
					else play();
				}
				event.preventDefault();
				return;
			}

			const step = keyToStep(key);
			if (step !== undefined) {
				toggleStep(step);
				return;
			}
			if (activeKeys.has(key)) {
				activeKeys.delete(key);
				if (key === '?') showKeys = false;
			} else {
				activeKeys.add(key);
				if (key === '?') showKeys = true;
			}
			activeKeys = activeKeys;
		}
	}

	function keypress(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		if (pressedKeys.has(key)) {
			// pressed.delete(key);
			// pressed = pressed;
		}
	}

	function keyup(event: KeyboardEvent) {
		const { code, key, altKey, ctrlKey, shiftKey } = event;
		// debug logging
		// console.log(event);
		// console.log({ code, key, altKey, ctrlKey, shiftKey });

		if (pressedKeys.has(key)) {
			pressedKeys.delete(key);
			pressedKeys = pressedKeys;
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
	on:click={({ detail: step }) => toggleStep(step)}
/>

<p>Press ? to toggle keybindings</p>

<p>
	<button type="button" on:click={clickRec}>Rec</button><button
		type="button"
		on:click={clickPlayPause}>{playing ? 'Pause' : 'Play'}</button
	><button type="button" on:click={clickStop}>Stop</button>
</p>

<p>
	<label>
		<input
			type="checkbox"
			bind:checked={tempoModeChecked}
			on:input={() =>
				($patterns[$patternIndex].tempoMode = tempoModeChecked ? 'per-pattern' : 'global')}
		/>
		Tempo Mode: {tempoMode}
	</label>
</p>

<p>
	<button on:click={() => setBPM(bpm - 16)}>&lt;&lt;-</button>
	<button on:click={() => setBPM(bpm - 1)}>&lt;-</button>
	<button on:click={() => setBPM(bpm + 1)}>-></button>
	<button on:click={() => setBPM(bpm + 16)}>->></button>{tempoMode === 'global'
		? 'Global'
		: 'Pattern'} BPM: {bpm}
</p>

<p>
	<label>
		<input
			type="checkbox"
			bind:checked={scaleModeChecked}
			on:input={() =>
				($patterns[$patternIndex].scaleMode = scaleModeChecked ? 'per-pattern' : 'per-track')}
		/>
		Scale Mode: {scaleMode}
	</label>
</p>

<p>
	<button on:click={() => setScale(scale / 2)}>&lt;-</button>
	<button on:click={() => setScale(scale * 2)}>-></button>{scaleMode === 'per-pattern'
		? 'Pattern'
		: 'Track'} Scale: {scale}
</p>
<p>
	<button on:click={() => setLength(length / 2)}>&lt;&lt;-</button>
	<button on:click={() => setLength(length - 1)}>&lt;-</button>
	<button on:click={() => setLength(length + 1)}>-></button>
	<button on:click={() => setLength(length * 2)}>->></button>{scaleMode === 'per-pattern'
		? 'Pattern'
		: 'Track'} Length: {length}
</p>

<p>
	<button
		on:click={() => ($projectIndex = ($projectIndex + $projects.length - 1) % $projects.length)}
		>&lt;-</button
	>
	<button on:click={() => ($projectIndex = ($projectIndex + 1) % $projects.length)}>-></button>
	<button on:click={newProject}>New</button>Project: {$project.name ?? 'Undefined'} ({$projectIndex})
</p>

<p>
	<button
		on:click={() => ($patternIndex = ($patternIndex + $patterns.length - 1) % $patterns.length)}
		>&lt;-</button
	>
	<button on:click={() => ($patternIndex = ($patternIndex + 1) % $patterns.length)}>-></button>
	<button on:click={newPattern}>New</button>Pattern: {$pattern.name ?? 'Undefined'} ({$patternIndex})
</p>

<p>
	<button on:click={() => ($trackIndex = ($trackIndex + $tracks.length - 1) % $tracks.length)}
		>&lt;-</button
	>
	<button on:click={() => ($trackIndex = ($trackIndex + 1) % $tracks.length)}>-></button>
	Track: {$trackIndex}
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

	button {
		border: 1px solid #ccc;
		padding: 0.5em;
		margin-right: 0.5em;
	}
</style>
