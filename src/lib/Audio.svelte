<script lang="ts">
	import { onMount } from 'svelte';
	import { t16, type N16 } from './utils';

	let ctx: AudioContext;

	let analyser: AnalyserNode;
	let analysers: AnalyserNode[];
	let gains: GainNode[];
	let oscillators: OscillatorNode[];

	async function init() {
		ctx ??= new AudioContext();
		if (ctx.state !== 'running') await ctx.resume();

		analyser = new AnalyserNode(ctx);
		analysers = t16.map(_ => new AnalyserNode(ctx));

		gains = t16.map(_ => new GainNode(ctx, { gain: 0 }));
		oscillators = t16.map(t => new OscillatorNode(ctx, { frequency: 440, type: 'sine' }));

		for (const [t, oscillator] of oscillators.entries()) {
			const gain = oscillator.connect(gains[t]);
			gain.connect(analysers[t]).connect(analyser);
			oscillator.start();
		}

		analyser.connect(ctx.destination);
	}

	export let playNote = (
		t: N16,
		note = 60, // middle C
		velocity = 0x7f, // full velocity
		length = 120, // ms
		timestamp = performance.now(),
	) => {
		if (!ctx || ctx.state !== 'running') return;

		const when = ctx.currentTime + (timestamp - performance.now()) / 1e3;

		const frequency = 440 * 2 ** ((note - 69) / 12);

		const oscillator = oscillators[t];
		oscillator.frequency.setValueAtTime(frequency, when);

		const envMax = velocity / 127;
		const envMin = 0.001 * envMax;
		const envLength = (10 * length) / 1000;

		const gain = gains[t].gain;
		gain.cancelScheduledValues(when);
		gain.setValueAtTime(envMax, when);
		gain.exponentialRampToValueAtTime(envMin, when + envLength);
	};

	onMount(() => {
		async function click() {
			await init();
			document.removeEventListener('click', click);
		}

		document.addEventListener('click', click);

		return () => {
			document.removeEventListener('click', click);
			for (const oscillator of oscillators ?? []) {
				oscillator.stop();
			}
		};
	});
</script>

<slot {ctx} {playNote} />
