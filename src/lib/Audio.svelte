<script lang="ts">
	import { onMount } from 'svelte';
	import { t16, type N16 } from './utils';

	let ctx: AudioContext;

	let gains: GainNode[];
	let oscillators: OscillatorNode[];

	const frequencies = t16.map(t => 100 + (t + 1) * 70);

	const attack = 0.02;
	const hold = 0.5;
	const decay = 0.2;

	async function init() {
		ctx ??= new AudioContext();
		if (ctx.state !== 'running') await ctx.resume();
		gains = t16.map(_ => new GainNode(ctx, { gain: 0 }));
		oscillators = t16.map(
			t => new OscillatorNode(ctx, { frequency: frequencies[t], type: 'sine' }),
		);
		for (const [i, oscillator] of oscillators.entries()) {
			const gain = oscillator.connect(gains[i]);
			gain.connect(ctx.destination);
			oscillator.start();
		}
	}

	function playNote(t: N16, timestamp: number) {
		if (!ctx || ctx.state !== 'running') return;
		const when = ctx.currentTime + (timestamp - performance.now()) / 1e3;
		const gain = gains[t].gain;
		gain.cancelScheduledValues(when);
		gain.setValueAtTime(0, when);
		gain.linearRampToValueAtTime(1, when + attack);
		gain.linearRampToValueAtTime(0, when + hold + decay);
	}

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
