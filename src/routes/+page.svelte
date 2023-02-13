<script lang="ts">
	import { onMount } from 'svelte';
	import Controls from '$lib/Controls.svelte';
	// import Display from '$lib/Display.svelte';
	import Keyboard from '$lib/Keyboard.svelte';
	import Keys from '$lib/Keys.svelte';
	import Player from '$lib/Player.svelte';
	import Tracker from '$lib/Tracker.svelte';
	import * as midi from '$lib/midi';
	import * as stores from '$lib/stores';
	import { type N16, array16V, bound, t16 } from '$lib/utils';

	const {
		disk,
		pattern,
		patternIndex,
		patterns,
		project,
		projectIndex,
		projects,
		track,
		trackIndex,
		tracks,
	} = stores;

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

	$: activeTracks = t16.filter(t => !$project.mutes.has(t) && !$pattern.mutes.has(t));
	$: activeTracksSet = new Set(activeTracks);

	$: tempoMode = $pattern.tempoMode;

	$: bpm = tempoMode === 'global' ? $project.tempo : ($pattern.tempo as number);

	function setBPM(value: number) {
		value = bound(value, 20, 400);
		if (tempoMode === 'global') {
			$projects[$projectIndex].tempo = value;
			// $project.tempo = value;
		} else {
			$patterns[$patternIndex].tempo = value;
			// $pattern.tempo = value;
		}
	}

	$: scaleMode = $pattern.scaleMode;

	$: scales =
		scaleMode === 'per-pattern'
			? array16V($pattern.scale as number)
			: $tracks.map(track => track.scale as number);

	$: scale = scales[$trackIndex];

	function setScale(value: number) {
		value = bound(value, 1 / 16, 4);
		if (scaleMode === 'per-pattern') {
			$patterns[$patternIndex].scale = value;
			// $pattern.scale = value;
		} else {
			$tracks[$trackIndex].scale = value;
			// $track.scale = value;
		}
	}

	$: lengths =
		scaleMode === 'per-pattern' ? array16V($pattern.length) : $tracks.map(t => t.length as number);

	$: length = lengths[$trackIndex];

	function setLength(value: number) {
		value = bound(value, 1, 64);
		if (scaleMode === 'per-pattern') {
			$patterns[$patternIndex].length = value;
			// $pattern.length = value;
		} else {
			$tracks[$trackIndex].length = value;
			// $track.length = value;
		}
	}

	let showKeys = false;

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

	let inputIndex: number | null;
	let outputIndex: number | null;

	$: input =
		inputIndex === undefined ? undefined : inputIndex === null ? null : midi.inputs.at(inputIndex);
	// TODO: revisit to support multiple simultaneous MIDI devices
	$: output =
		outputIndex === undefined
			? undefined
			: outputIndex === null
			? null
			: midi.outputs.at(outputIndex);

	function selectNextInput() {
		const len = midi.inputs.length;
		inputIndex = inputIndex === null ? 0 : inputIndex === len - 1 ? null : (inputIndex + 1) % len;
	}

	function selectPrevInput() {
		const len = midi.inputs.length;
		inputIndex =
			inputIndex === null ? len - 1 : inputIndex === 0 ? null : (inputIndex + len - 1) % len;
	}

	function selectNextOutput() {
		const len = midi.outputs.length;
		outputIndex =
			outputIndex === null ? 0 : outputIndex === len - 1 ? null : (outputIndex + 1) % len;
	}

	function selectPrevOutput() {
		const len = midi.outputs.length;
		outputIndex =
			outputIndex === null ? len - 1 : outputIndex === 0 ? null : (outputIndex + len - 1) % len;
	}

	onMount(async () => {
		await midi.setup();
		if (midi.inputs.length > 0) inputIndex = 0;
		if (midi.outputs.length > 0) outputIndex = 0;
	});
</script>

<Player
	tracks={$tracks}
	activeTracks={activeTracksSet}
	{bpm}
	{lengths}
	{scales}
	{output}
	let:playing
	let:play
	let:pause
	let:stop
	let:patternSteps
>
	<Keyboard
		{playing}
		on:play={play}
		on:pause={pause}
		on:stop={stop}
		{scale}
		on:pattern-clear={stores.clearPattern}
		on:track-clear={() => stores.clearTrack($trackIndex, length)}
		on:tracks-clear={() => stores.clearTracks(lengths)}
		on:track-change={({ detail: t }) => setTrack(t)}
		on:track-prev={selectPrevTrack}
		on:track-next={selectNextTrack}
		on:scale-change={({ detail: scale }) => setScale(scale)}
		{length}
		on:length-change={({ detail: length }) => setLength(length)}
		on:step-toggle={({ detail: step }) => toggleStep(step)}
		on:help-enable={() => (showKeys = true)}
		on:help-disable={() => (showKeys = false)}
		let:pressedSteps
	>
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
					($tracks[$trackIndex].velocity = bound(Math.round(velocity), 0, 127))}
				probability={$track.probability}
				on:probability-change={({ detail: probability }) =>
					($tracks[$trackIndex].probability = bound(probability, 0, 1))}
				on:project-prev={() =>
					($projectIndex = ($projectIndex + $projects.length - 1) % $projects.length)}
				on:project-next={() => ($projectIndex = ($projectIndex + 1) % $projects.length)}
				on:project-new={stores.newProject}
				on:pattern-prev={() =>
					($patternIndex = ($patternIndex + $patterns.length - 1) % $patterns.length)}
				on:pattern-next={() => ($patternIndex = ($patternIndex + 1) % $patterns.length)}
				on:pattern-new={stores.newPattern}
				on:track-prev={selectPrevTrack}
				on:track-next={selectNextTrack}
				midiInputName={input === null ? 'None' : input?.name ?? 'N/A'}
				on:midi-input-prev={selectPrevInput}
				on:midi-input-next={selectNextInput}
				midiOutputName={output === null ? 'None' : output?.name ?? 'N/A'}
				on:midi-output-prev={selectPrevOutput}
				on:midi-output-next={selectNextOutput}
			/>
		</header>

		<main>
			<Keys
				highlighted={[patternSteps[$trackIndex]]}
				active={activeSteps}
				pressed={pressedSteps}
				{showKeys}
				on:click={({ detail: step }) => toggleStep(step)}
			/>
			<Tracker
				selectedTrack={$trackIndex}
				{lengths}
				{scales}
				{patternSteps}
				{showKeys}
				tracks={$tracks}
			/>
			<!-- <Display /> -->
		</main>
	</Keyboard>
</Player>

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
