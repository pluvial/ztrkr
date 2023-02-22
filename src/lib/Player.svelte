<script lang="ts">
	import { onMount } from 'svelte';
	import * as midi from './midi';
	import type { Track } from './state';
	import { bound, t16, zero16, type N16, type T16, type Tuple16 } from './utils';

	export let tracks: Tuple16<Track>;
	export let activeTracks: Set<N16>;
	export let bpm: number;
	export let lengths: number[];
	export let scales: number[];
	export let output: WebMidi.MIDIOutput | null | undefined;

	let frames = zero16();
	let patternSteps = zero16();

	let currentFrameTimes = zero16();
	let nextFrameTimes = zero16();

	// NOTE: scale = 1 <=> fpb = 4
	const fpb = 4;
	$: frameDeltas = scales.map(s => 60e3 / (fpb * s * bpm)) as T16;

	// exposed to allow parent to bind:playing, etc.
	export let playing = false;
	export let play = () => {
		playing = true;
	};
	export let pause = () => {
		playing = false;
	};
	export let stop = () => {
		playing = false;
		frames = zero16();
		patternSteps = zero16();
		output && midi.allChannelsAllNotesOff(output);
	};

	onMount(() => {
		requestAnimationFrame(function raf(time) {
			if (playing) {
				for (const t of t16) {
					const track = tracks[t];
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
						// if the next raf is already after the next frame (~16ms),
						// update frame times and schedule a trigger
					} else if (time + 16 >= nextFrameTime) {
						frame += 1;
						step = (step + 1) % lengths[t];
						currentFrameTime = nextFrameTime;
						nextFrameTime += frameDelta;
						trigger = true;
					}

					if (activeTracks.has(t)) {
						const trig = track.steps[step];
						if (trig) {
							const probability = trig.probability ?? track.probability;
							if (probability != 1) {
								const p = Math.random();
								// TODO: revisit, support other types of probability
								if (p > probability) trigger = false;
							}
							if (trigger && trig?.type === 'note') {
								const channel = trig.channel ?? track.channel;
								let noteLength = trig.noteLength ?? track.noteLength;
								// TODO: revisit, find way to handle clashing note-on and note-off events
								noteLength = bound(noteLength, 1, frameDelta - 1);
								const noteNumber = trig.noteNumber ?? track.noteNumber;
								const velocity = trig.velocity ?? track.velocity;
								const timestamp = currentFrameTime;
								console.debug(
									`Note event: channel - ${channel}, length - ${noteLength}, timestamp - ${timestamp}`,
								);
								output && midi.note(output, channel, noteNumber, velocity, noteLength, timestamp);
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
		});
	});
</script>

<slot {playing} {play} {pause} {stop} {patternSteps} />