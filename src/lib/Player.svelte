<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import * as midi from './midi';
	import type { Track } from './state';
	import { array16V, bound, t16, zero16, type N16, type T16, type Tuple16 } from './utils';

	const dispatch = createEventDispatcher();

	export let tracks: Tuple16<Track>;
	export let activeTracks: Set<N16>;
	export let bpm: number;
	export let patternLength: number;
	export let lengths: number[];
	export let scales: number[];
	export let output: WebMidi.MIDIOutput | null | undefined;

	let frames = zero16();
	let steps = zero16();

	let currentFrameTimes = zero16();
	let nextFrameTimes = zero16();

	// NOTE: scale = 1 <=> fpb = 4
	const fpb = 4;
	$: frameDeltas = scales.map(s => 60e3 / (fpb * s * bpm)) as T16;

	let frame = 0;
	let step = 0;

	let currentFrameTime = 0;
	let nextFrameTime = 0;

	$: frameDelta = 60e3 / (fpb * bpm);

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
		steps = zero16();
		output && midi.allChannelsAllNotesOff(output);
	};

	export let patternChange = false;

	let rafHandle: ReturnType<typeof requestAnimationFrame>;

	onMount(() => {
		rafHandle = requestAnimationFrame(function raf(time) {
			if (playing) {
				// time leap is too large, restarting playback
				if (time > currentFrameTime + 2 * frameDelta) {
					currentFrameTime = time;
					nextFrameTime = currentFrameTime + frameDelta;
					// if the next raf is already after the next frame (~16ms),
					// update frame times and schedule a trigger
				} else if (time + 16 >= nextFrameTime) {
					if (step + 1 === patternLength) {
						// restart play cursor on all tracks
						frames = array16V(-1);
						steps = array16V(-1);
						if (patternChange) {
							dispatch('pattern-change');
						}
					}
					frame += 1;
					step = (step + 1) % patternLength;
					currentFrameTime = nextFrameTime;
					nextFrameTime += frameDelta;
				}

				for (const t of t16) {
					const track = tracks[t];
					const frameDelta = frameDeltas[t];
					let frame = frames[t];
					let step = steps[t];
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
						// TODO: revisit
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
								output && midi.note(output, channel, noteNumber, velocity, noteLength, timestamp);
								const event = { t, channel, noteNumber, velocity, noteLength, timestamp };
								dispatch('note-trigger', event);
							}
						}
					}
					frames[t] = frame;
					steps[t] = step;
					currentFrameTimes[t] = currentFrameTime;
					nextFrameTimes[t] = nextFrameTime;
				}
			}
			// debug logging
			// const delta = time - currentFrameTime;
			// console.log({ delta, time });
			rafHandle = requestAnimationFrame(raf);
		});
		return () => cancelAnimationFrame(rafHandle);
	});
</script>

<slot {playing} {play} {pause} {stop} {steps} />
