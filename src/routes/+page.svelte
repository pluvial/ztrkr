<script lang="ts">
	import { onMount } from 'svelte';
	import Controls from '$lib/Controls.svelte';
	import Display from '$lib/Display.svelte';
	import Keys from '$lib/Keys.svelte';
	import Tracker from '$lib/Tracker.svelte';
	import { keyToStep } from '$lib/keyboard';
	import { allChannelsAllNotesOff, note } from '$lib/midi';
	import {
		clearPattern,
		clearTrack,
		clearTracks,
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
	import { type N16, type T16, array16V, seq16, zero16 } from '$lib/utils';

	// debug logging
	$: console.debug({ $disk });
	$: console.debug({ $projects });
	$: console.debug({ $patterns });
	$: console.debug({ $tracks });

	$: console.debug({ $pattern });
	$: console.debug({ $project });
	$: console.debug({ $track });

	function setTrack(index: N16) {
		$trackIndex = index;
	}

	function selectNextTrack() {
		const len = $tracks.length;
		setTrack((($trackIndex + 1) % len) as N16);
	}

	function selectPrevTrack() {
		const len = $tracks.length;
		setTrack((($trackIndex + len - 1) % len) as N16);
	}

	$: scaleMode = $pattern.scaleMode;
	$: tempoMode = $pattern.tempoMode;

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

	let frames = zero16();

	let patternSteps = zero16();
	// $: patternSteps = frames.map((f, i) => f % lengths[i])
	// let patternStep = 0
	$: patternStep = frames[$trackIndex] % length;

	// scale = 1 <=> fpb = 4
	$: frameDeltas = scales.map(s => 60e3 / (4 * s * bpm)) as T16;

	let currentFrameTimes = zero16();
	let nextFrameTimes = zero16();

	const t16 = seq16();
	$: activeTracks = t16.filter(t => !$project.mutes.has(t) && !$pattern.mutes.has(t));
	$: activeTracksSet = new Set(activeTracks);

	const raf: FrameRequestCallback = time => {
		if (playing) {
			for (const t of t16) {
				const track = $tracks[t];
				const frameDelta = frameDeltas[t];
				let frame = frames[t];
				let step = patternSteps[t];
				let currentFrameTime = currentFrameTimes[t];
				let nextFrameTime = nextFrameTimes[t];

				if (activeTracksSet.has(t)) {
					let trigger = false;
					// time leap is too large, restarting playback
					if (time > currentFrameTime + 2 * frameDelta) {
						currentFrameTime = time;
						nextFrameTime = currentFrameTime + frameDelta;
						trigger = true;
					} else if (time + 16 >= nextFrameTime) {
						frame += 1;
						step = (step + 1) % lengths[t];
						currentFrameTime = nextFrameTime;
						nextFrameTime += frameDelta;
						trigger = true;
					}
					const trig = track.steps[step];
					if (trig) {
						const probability = trig.probability ?? track.probability;
						if (probability != 1) {
							const p = Math.random();
							// TODO: revisit
							if (p > probability) trigger = false;
						}
						if (trigger && trig?.type === 'note') {
							const channel = trig.channel ?? track.channel;
							let noteLength = trig.noteLength ?? track.noteLength;
							noteLength = Math.min(frameDelta - 1, noteLength);
							const noteNumber = trig.noteNumber ?? track.noteNumber;
							const velocity = trig.velocity ?? track.velocity;
							const timestamp = currentFrameTime;
							console.debug(
								`Note event: channel - ${channel}, length - ${noteLength}, timestamp - ${timestamp}`,
							);
							output && note(output, channel, noteNumber, velocity, noteLength, timestamp);
						}
					}
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
		patternSteps = zero16();
		output && allChannelsAllNotesOff(output);
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

		// immediate key presses, always triggered, retrigger when held
		switch (key) {
			case 'ArrowUp':
				if (shiftKey) setScale(scale / 2);
				else if (ctrlKey) setLength(length / 2);
				else setLength(length - 1);
				event.preventDefault();
				return;
			case 'ArrowDown':
				if (shiftKey) setScale(scale * 2);
				else if (ctrlKey) setLength(length * 2);
				else setLength(length + 1);
				event.preventDefault();
				return;
			case 'ArrowLeft':
				selectPrevTrack();
				return;
			case 'ArrowRight':
				selectNextTrack();
				return;
			case 'Tab':
				if (shiftKey) selectPrevTrack();
				else selectNextTrack();
				event.preventDefault();
				return;
		}

		// debounced key presses, do not retrigger when held down
		if (!pressedKeys.has(key)) {
			pressedKeys.add(key);
			pressedKeys = pressedKeys;

			switch (key) {
				case ' ':
					if (shiftKey) {
						stop();
					} else {
						if (playing) pause();
						else play();
					}
					event.preventDefault();
					return;
				case 'End':
				case 'PageDown':
					setTrack(15);
					event.preventDefault();
					return;
				case 'Home':
				case 'PageUp':
					setTrack(0);
					event.preventDefault();
					return;
				case 'Delete':
				case 'Backspace':
					// delete all tracks sequence, length and scale data
					if (ctrlKey && shiftKey) clearPattern();
					// delete all tracks sequence data
					else if (shiftKey) clearTracks(lengths);
					// delete currente track sequence
					else clearTrack($trackIndex, length);
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

<header>
	<Controls
		projectIndex={$projectIndex}
		projectName={$project.name ?? 'Undefined'}
		patternIndex={$patternIndex}
		patternName={$pattern.name ?? 'Undefined'}
		trackIndex={$trackIndex}
		{playing}
		on:play={play}
		on:pause={pause}
		on:stop={stop}
		on:rec={() => {
			// TODO
		}}
		{tempoMode}
		on:tempo-mode-change={({ detail: tempoMode }) =>
			($patterns[$patternIndex].tempoMode = tempoMode)}
		{bpm}
		on:bpm-change={({ detail: bpm }) => setBPM(bpm)}
		{scaleMode}
		on:scale-mode-change={({ detail: scaleMode }) =>
			($patterns[$patternIndex].scaleMode = scaleMode)}
		{scale}
		on:scale-change={({ detail: scale }) => setScale(scale)}
		{length}
		on:length-change={({ detail: length }) => setLength(length)}
		noteNumber={$track.noteNumber}
		on:note-number-change={({ detail: noteNumber }) =>
			($tracks[$trackIndex].noteNumber = noteNumber)}
		velocity={$track.velocity}
		on:velocity-change={({ detail: velocity }) =>
			($tracks[$trackIndex].velocity = Math.max(0, Math.min(127, Math.round(velocity))))}
		probability={$track.probability}
		on:probability-change={({ detail: probability }) =>
			($tracks[$trackIndex].probability = Math.max(0, Math.min(1, probability)))}
		on:project-prev={() =>
			($projectIndex = ($projectIndex + $projects.length - 1) % $projects.length)}
		on:project-next={() => ($projectIndex = ($projectIndex + 1) % $projects.length)}
		on:project-new={newProject}
		on:pattern-prev={() =>
			($patternIndex = ($patternIndex + $patterns.length - 1) % $patterns.length)}
		on:pattern-next={() => ($patternIndex = ($patternIndex + 1) % $patterns.length)}
		on:pattern-new={newPattern}
		on:track-prev={selectPrevTrack}
		on:track-next={selectNextTrack}
		midiInputName={input?.name ?? 'N/A'}
		on:midi-input-prev={() => (inputIndex = (inputIndex + inputs.length - 1) % inputs.length)}
		on:midi-input-next={() => (inputIndex = (inputIndex + 1) % inputs.length)}
		midiOutputName={output?.name ?? 'N/A'}
		on:midi-output-prev={() => (outputIndex = (outputIndex + outputs.length - 1) % outputs.length)}
		on:midi-output-next={() => (outputIndex = (outputIndex + 1) % outputs.length)}
	/>
</header>

<main>
	<Keys
		highlighted={[patternStep]}
		active={activeSteps}
		pressed={pressedSteps}
		{showKeys}
		on:click={({ detail: step }) => toggleStep(step)}
	/>
	<Tracker selectedTrack={$trackIndex} {lengths} {scales} {patternSteps} tracks={$tracks} />
	<Display />
</main>

<svelte:window on:keydown={keydown} on:keypress={keypress} on:keyup={keyup} />

<style>
	header {
		margin-bottom: 1em;
	}

	main {
		display: flex;
		flex-direction: column;
		row-gap: 2em;
	}
</style>
