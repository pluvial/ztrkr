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
	export let patternScale: number | undefined;
	export let changeLength: number | undefined;
	export let lengths: number[] | undefined;
	export let scales: number[] | undefined;
	export let output: WebMidi.MIDIOutput | null | undefined;

	let frame = 0;
	let step = 0;
	let currentFrameTime = 0;
	let nextFrameTime = 0;

	let frames = zero16();
	let steps = zero16();
	let currentFrameTimes = zero16();
	let nextFrameTimes = zero16();
	let fractions = zero16();

	// NOTE: scale = 1 <=> fpb = 4
	const fpb = 4;
	$: frameDelta = 60e3 / (fpb * bpm * (scales ? 1 : patternScale ?? 1));
	$: frameDeltas = t16.map(t => 60e3 / (fpb * bpm * (scales?.[t] ?? patternScale ?? 1)));

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
		frame = 0;
		step = 0;
		output && midi.allChannelsAllNotesOff(output);
	};

	export let patternChange = false;
	let patternChangeFrame: number | null = null;

	let rafHandle: ReturnType<typeof requestAnimationFrame>;

	function changePattern() {
		patternChangeFrame = null;
		dispatch('pattern-change');
		// restart play cursor on all tracks on pattern change
		restartPattern();
		frame = 0;
		frames = zero16();
	}

	function restartPattern() {
		step = 0;
		steps = zero16();
		nextFrameTimes = array16V(nextFrameTime);
	}

	let delta = 1e3 / 60; // 60 fps
	let prevTime = 0;
	let prevPlayTime = 0;

	onMount(() => {
		rafHandle = requestAnimationFrame(function raf(time) {
			if (playing) {
				for (const t of t16) {
					const track = tracks[t];
					const frameDelta = frameDeltas[t];
					let frame = frames[t];
					let step = steps[t];
					let currentFrameTime = currentFrameTimes[t];
					let nextFrameTime = nextFrameTimes[t];

					let trigger = false;

					// time leap is too large, restarting playback
					if (time > prevPlayTime + 2 * delta) {
						currentFrameTime = time;
						nextFrameTime = currentFrameTime + frameDelta;
						trigger = true;
						// if the next raf is already after the next frame (~16ms),
						// update frame times and schedule a trigger
					} else if (time + delta >= nextFrameTime) {
						frame += 1;
						// TODO: revisit
						const length =
							lengths && scales ? Math.min(lengths[t], scales[t] * patternLength) : patternLength;
						step = (step + 1) % length;
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
					fractions[t] = (time - currentFrameTime) / (nextFrameTime - currentFrameTime);
				}

				// TODO: revisit, logic replicated for master pattern frame/step and per-track frames/steps

				// time leap is too large, starting/restarting playback
				if (time > prevPlayTime + 2 * delta) {
					currentFrameTime = time;
					nextFrameTime = currentFrameTime + frameDelta;
					// if the next raf is already after the next frame (~16ms) update frame time
				} else if (time + delta >= nextFrameTime) {
					currentFrameTime = nextFrameTime;
					nextFrameTime += frameDelta;
					frame += 1;
					step = (step + 1) % patternLength;
					if (step === 0) {
						if (patternChange) {
							changePattern();
						} else {
							// restart play cursor on all tracks at end of pattern
							restartPattern();
						}
					}
				}

				if (patternChange && !patternChangeFrame) {
					// round frame up to nearest beat
					const beatFrame = Math.floor(frame / fpb + 1) * fpb;
					patternChangeFrame = beatFrame + (changeLength ?? patternLength);
				} else if (patternChange && patternChangeFrame && frame >= patternChangeFrame) {
					changePattern();
				}

				prevPlayTime = time;
			}
			delta = time - prevTime;
			prevTime = time;
			// debug logging
			// console.log({ delta, time });
			rafHandle = requestAnimationFrame(raf);
		});
		return () => cancelAnimationFrame(rafHandle);
	});
</script>

<slot {playing} {play} {pause} {stop} {steps} {fractions} />
