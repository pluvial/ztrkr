<script lang="ts">
	import { onMount } from 'svelte';
	import Controls from './Controls.svelte';
	// import Display from './Display.svelte';
	import Keyboard from './Keyboard.svelte';
	import Keys from './Keys.svelte';
	import Player from './Player.svelte';
	import Tracker from './Tracker.svelte';
	import * as midi from './midi';
	import { type Disk, defaultDisk, defaultPattern, defaultProject, Mode, KeysMode } from './state';
	import { type N16, array16V, bound, t16 } from './utils';

	export let disk: Disk;

	let projectIndex = 0;
	let patternIndex = 0;
	let trackIndex: N16 = 0;

	// reset to first pattern when switching projects
	$: projectIndex, (patternIndex = 0);

	$: projects = disk.projects;
	$: project = projects[projectIndex];
	$: patterns = project.patterns;
	$: pattern = patterns[patternIndex];
	$: tracks = pattern.tracks;
	$: track = tracks[trackIndex];

	// debug logging
	$: console.debug({ disk });
	$: console.debug({ projects });
	$: console.debug({ patterns });
	$: console.debug({ tracks });

	$: console.debug({ pattern });
	$: console.debug({ project });
	$: console.debug({ track });

	function newProject() {
		projects = [...projects, defaultProject()];
		projectIndex = projects.length - 1;
	}

	function saveProject() {
		disk.projects[projectIndex] = project;
	}

	function newPattern() {
		patterns = [...patterns, defaultPattern()];
		patternIndex = patterns.length - 1;
	}

	function savePattern() {
		// if project does not yet exist on disk, save it first
		if (!disk.projects[projectIndex]) saveProject();
		disk.projects[projectIndex].patterns[patternIndex] = pattern;
	}

	function clearPattern() {
		patterns[patternIndex] = defaultPattern();
	}

	function clearTracks() {
		for (const t of t16) {
			tracks[t].steps = Array.from({ length: lengths[t] });
		}
	}

	function clearTrack(t: N16) {
		tracks[t].steps = Array.from({ length: lengths[t] });
	}

	function setTrack(index: N16) {
		trackIndex = index;
	}

	function selectNextTrack() {
		const len = tracks.length;
		setTrack(((trackIndex + 1) % len) as N16);
	}

	function selectPrevTrack() {
		const len = tracks.length;
		setTrack(((trackIndex + len - 1) % len) as N16);
	}

	function triggerTrack(t: N16) {
		const { channel, noteLength, noteNumber, velocity } = tracks[t];
		const timestamp = performance.now();
		console.debug(
			`Note event: channel - ${channel}, length - ${noteLength}, timestamp - ${timestamp}`,
		);
		output && midi.note(output, channel, noteNumber, velocity, noteLength, timestamp);
	}

	function recTriggerTrack(t: N16, step: number) {
		triggerTrack(t);
		tracks[t].steps[step] = { type: 'note' };
	}

	function triggerNote(note: number) {
		const { channel, noteLength, noteNumber: trackNoteNumber, velocity } = track;
		const octave = 0;
		const transpose = 0;
		const noteNumber = octave * 12 + transpose + trackNoteNumber + note;
		const timestamp = performance.now();
		console.debug(
			`Note event: channel - ${channel}, length - ${noteLength}, timestamp - ${timestamp}`,
		);
		output && midi.note(output, channel, noteNumber, velocity, noteLength, timestamp);
		return noteNumber;
	}

	function recTriggerNote(note: number, step: number) {
		const noteNumber = triggerNote(note);
		tracks[trackIndex].steps[step] = { type: 'note', noteNumber };
	}

	$: activeTracks = new Set(t16.filter(t => !project.mutes.has(t) && !pattern.mutes.has(t)));

	$: tempoMode = pattern.tempoMode;

	$: bpm = tempoMode === 'global' ? project.tempo : (pattern.tempo as number);

	function setBPM(value: number) {
		value = bound(value, 20, 400);
		if (tempoMode === 'global') {
			projects[projectIndex].tempo = value;
			// project.tempo = value;
		} else {
			patterns[patternIndex].tempo = value;
			// pattern.tempo = value;
		}
	}

	$: scaleMode = pattern.scaleMode;

	$: scales =
		scaleMode === 'per-pattern'
			? array16V(pattern.scale as number)
			: tracks.map(track => track.scale as number);

	$: scale = scales[trackIndex];

	function setScale(value: number) {
		value = bound(value, 1 / 16, 4);
		if (scaleMode === 'per-pattern') {
			patterns[patternIndex].scale = value;
			// pattern.scale = value;
		} else {
			tracks[trackIndex].scale = value;
			// track.scale = value;
		}
	}

	$: lengths =
		scaleMode === 'per-pattern' ? array16V(pattern.length) : tracks.map(t => t.length as number);

	$: length = lengths[trackIndex];

	function setLength(value: number) {
		value = bound(value, 1, 64);
		if (scaleMode === 'per-pattern') {
			patterns[patternIndex].length = value;
			// pattern.length = value;
		} else {
			tracks[trackIndex].length = value;
			// track.length = value;
		}
	}

	let mode = Mode.GridRec;

	function setMode(m: Mode) {
		mode = m;
	}

	let keysModeStack: KeysMode[] = [];
	$: keysMode = keysModeStack.at(-1) ?? KeysMode.Default;

	function pushKeysMode(m: KeysMode) {
		keysModeStack = keysModeStack.concat(m);
	}

	function popKeysMode(m: KeysMode) {
		if (keysMode === m) {
			keysModeStack = keysModeStack.slice(0, -1);
		}
	}

	const keysColors: Record<KeysMode, string | null> = {
		[KeysMode.Keyboard]: 'ib',
		[KeysMode.TrackChange]: 'cb',
		[KeysMode.TrackMutes]: 'i7',
		[KeysMode.PatternMutes]: 'ic',
		[KeysMode.Default]: null,
	};
	const modeColors: Record<Mode, string | null> = {
		[Mode.GridRec]: 'rf',
		[Mode.LiveRec]: 'yb',
		[Mode.StepRec]: 'mb',
		[Mode.Default]: null,
	};

	$: color = keysColors[keysMode] ?? modeColors[mode] ?? 'wb';

	$: muteMode = project.muteMode;
	$: if (keysMode === KeysMode.TrackMutes || keysMode === KeysMode.PatternMutes) {
		project.muteMode = keysMode;
	}

	$: trackMutes = Array.from(project.mutes);
	$: patternMutes = Array.from(pattern.mutes);

	function togglePatternMute(t: N16) {
		if (pattern.mutes.has(t)) pattern.mutes.delete(t);
		else pattern.mutes.add(t);
		patterns[patternIndex] = pattern;
	}

	function toggleTrackMute(t: N16) {
		if (project.mutes.has(t)) project.mutes.delete(t);
		else project.mutes.add(t);
		projects[projectIndex] = project;
	}

	$: activeSteps = track.steps.reduce(
		(activeSteps, step, index) => (step ? [...activeSteps, index] : activeSteps),
		[] as number[],
	);

	function toggleStep(step: number, t = trackIndex) {
		if (tracks[t].steps[step]) {
			tracks[t].steps[step] = undefined;
		} else {
			tracks[t].steps[step] = { type: 'note' };
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

	let helpMode = false;

	onMount(async () => {
		await midi.setup();
		if (midi.inputs.length > 0) inputIndex = 0;
		if (midi.outputs.length > 0) outputIndex = 0;
	});
</script>

<Player
	{tracks}
	{activeTracks}
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
	<div class="container">
		<Keyboard
			{mode}
			{keysMode}
			{muteMode}
			{playing}
			on:play={play}
			on:pause={pause}
			on:stop={stop}
			on:mode-set={({ detail: m }) => {
				if (mode !== Mode.LiveRec && m === Mode.LiveRec) play();
				setMode(m);
			}}
			on:keys-mode-push={({ detail: keysMode }) => pushKeysMode(keysMode)}
			on:keys-mode-pop={({ detail: keysMode }) => popKeysMode(keysMode)}
			on:pattern-clear={clearPattern}
			on:track-clear={() => clearTrack(trackIndex)}
			on:tracks-clear={clearTracks}
			selectedTrack={trackIndex}
			on:track-change={({ detail: t }) => setTrack(t)}
			on:track-prev={selectPrevTrack}
			on:track-next={selectNextTrack}
			on:trigger-track={({ detail: t }) => {
				setTrack(t);
				triggerTrack(t);
			}}
			on:rec-trigger-track={({ detail: t }) => {
				if (!playing) play();
				setTrack(t);
				recTriggerTrack(t, patternSteps[t]);
			}}
			on:trigger-note={({ detail: note }) => triggerNote(note)}
			on:rec-trigger-note={({ detail: note }) => recTriggerNote(note, patternSteps[trackIndex])}
			{scale}
			on:scale-change={({ detail: scale }) => setScale(scale)}
			{length}
			on:length-change={({ detail: length }) => setLength(length)}
			on:step-toggle={({ detail: step }) => toggleStep(step)}
			on:track-mute-toggle={({ detail: t }) => toggleTrackMute(t)}
			on:pattern-mute-toggle={({ detail: t }) => togglePatternMute(t)}
			{helpMode}
			on:help-enable={() => (helpMode = true)}
			on:help-disable={() => (helpMode = false)}
			let:pressedKeys
			let:pressedSteps
		>
			<main style:--hf="var(--{color}" role="button" tabindex="0">
				<!-- <Display /> -->
				<Keys
					{mode}
					{keysMode}
					{helpMode}
					highlighted={keysMode === KeysMode.TrackChange ||
					(keysMode === KeysMode.Default && mode !== Mode.GridRec)
						? [trackIndex]
						: keysMode === KeysMode.Default && mode === Mode.GridRec
						? [patternSteps[trackIndex]]
						: []}
					active={keysMode === KeysMode.TrackMutes
						? t16.filter(t => !trackMutes.includes(t))
						: keysMode === KeysMode.PatternMutes
						? t16.filter(t => !patternMutes.includes(t))
						: keysMode === KeysMode.TrackChange ||
						  (keysMode === KeysMode.Default && mode !== Mode.GridRec)
						? Array.from(activeTracks)
						: keysMode === KeysMode.Keyboard
						? t16
						: mode === Mode.GridRec
						? activeSteps
						: []}
					{pressedKeys}
					on:keys-mode-push={({ detail: keysMode }) => pushKeysMode(keysMode)}
					on:keys-mode-pop={({ detail: keysMode }) => popKeysMode(keysMode)}
					on:track-change={({ detail: t }) => setTrack(t)}
					on:trigger-track={({ detail: t }) => {
						setTrack(t);
						triggerTrack(t);
					}}
					on:rec-trigger-track={({ detail: t }) => {
						if (!playing) play();
						setTrack(t);
						recTriggerTrack(t, patternSteps[t]);
					}}
					on:trigger-note={({ detail: note }) => triggerNote(note)}
					on:rec-trigger-note={({ detail: note }) => recTriggerNote(note, patternSteps[trackIndex])}
					{pressedSteps}
					on:step-toggle={({ detail: step }) => toggleStep(step)}
					on:track-mute-toggle={({ detail: t }) => toggleTrackMute(t)}
					on:pattern-mute-toggle={({ detail: t }) => togglePatternMute(t)}
				/>
				<Tracker
					{mode}
					{keysMode}
					{helpMode}
					selectedTrack={trackIndex}
					{lengths}
					{scales}
					{patternSteps}
					{tracks}
					{activeTracks}
					on:track-change={({ detail: t }) => setTrack(t)}
					on:step-toggle={({ detail: { step, track } }) => toggleStep(step, track)}
				/>
			</main>
		</Keyboard>

		<Controls
			{mode}
			{keysMode}
			{helpMode}
			{projectIndex}
			projectName={project.name ?? 'Undefined'}
			{patternIndex}
			patternName={pattern.name ?? 'Undefined'}
			{trackIndex}
			{playing}
			on:play={play}
			on:pause={pause}
			on:stop={stop}
			on:mode-set={({ detail: m }) => {
				if (mode !== Mode.LiveRec && m === Mode.LiveRec) play();
				setMode(m);
			}}
			{tempoMode}
			on:tempo-mode-change={({ detail: tempoMode }) =>
				(patterns[patternIndex].tempoMode = tempoMode)}
			{bpm}
			on:bpm-change={({ detail: bpm }) => setBPM(bpm)}
			{scaleMode}
			on:scale-mode-change={({ detail: scaleMode }) =>
				(patterns[patternIndex].scaleMode = scaleMode)}
			{scale}
			on:scale-change={({ detail: scale }) => setScale(scale)}
			{length}
			on:length-change={({ detail: length }) => setLength(length)}
			noteNumber={track.noteNumber}
			on:note-number-change={({ detail: noteNumber }) =>
				(tracks[trackIndex].noteNumber = noteNumber)}
			velocity={track.velocity}
			on:velocity-change={({ detail: velocity }) =>
				(tracks[trackIndex].velocity = bound(Math.round(velocity), 0, 127))}
			probability={track.probability}
			on:probability-change={({ detail: probability }) =>
				(tracks[trackIndex].probability = bound(probability, 0, 1))}
			on:project-prev={() =>
				(projectIndex = (projectIndex + projects.length - 1) % projects.length)}
			on:project-next={() => (projectIndex = (projectIndex + 1) % projects.length)}
			on:project-new={newProject}
			on:project-save={saveProject}
			on:pattern-prev={() =>
				(patternIndex = (patternIndex + patterns.length - 1) % patterns.length)}
			on:pattern-next={() => (patternIndex = (patternIndex + 1) % patterns.length)}
			on:pattern-new={newPattern}
			on:pattern-save={savePattern}
			on:track-prev={selectPrevTrack}
			on:track-next={selectNextTrack}
			midiInputName={input === null ? 'None' : input?.name ?? 'N/A'}
			on:midi-input-prev={selectPrevInput}
			on:midi-input-next={selectNextInput}
			midiOutputName={output === null ? 'None' : output?.name ?? 'N/A'}
			on:midi-output-prev={selectPrevOutput}
			on:midi-output-next={selectNextOutput}
			on:disk-clear={() => (disk = defaultDisk())}
			on:storage-clear
		/>
	</div>
</Player>

<style>
	.container {
		display: flex;
		flex-direction: column;
		row-gap: 2em;
		align-items: center;
	}

	main {
		border: 3px solid #333;
		border-radius: 1em;
		padding: 2em;
		display: flex;
		flex-direction: column;
		align-items: center;
		row-gap: 1em;

		transition: box-shadow 0.3s;

		/* color variants */
		--v1: var(--w1);
		--v3: var(--w3);
		--v5: var(--w5);
		--v7: var(--w7);
		--v9: var(--w9);
		--vb: var(--wb);
		--vd: var(--wd);
		--vf: var(--wf);

		/* color highlights */
		--h1: var(--r1);
		--h3: var(--r3);
		--h5: var(--r5);
		--h7: var(--r7);
		--h9: var(--r9);
		--hb: var(--rb);
		--hd: var(--rd);
		--hf: var(--rf);
	}

	main:is(:focus, :focus-visible, :focus-within) {
		box-shadow: 0 0 5px 5px var(--v5);
		outline: none;
	}
</style>
