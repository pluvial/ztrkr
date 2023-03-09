<script lang="ts">
	import { onMount } from 'svelte';
	import { defaultMachines, type Machine, note } from './audio';
	import type { N16, Tuple16 } from './utils';

	let ctx: AudioContext;

	let analyser: AnalyserNode;
	let machines: Tuple16<Machine>;

	async function init() {
		ctx ??= new AudioContext();
		if (ctx.state !== 'running') await ctx.resume();

		analyser = new AnalyserNode(ctx);

		machines = defaultMachines(ctx);

		for (const [t, machine] of machines.entries()) {
			machine.output.connect(analyser);
			for (const oscillator of machine.oscillators) oscillator.start();
		}

		analyser.connect(ctx.destination);
	}

	export let playNote = (
		t: N16,
		noteNumber = 60, // middle C
		velocity = 0x7f, // full velocity
		length = 120, // ms
		timestamp = performance.now(),
	) => {
		if (!ctx || ctx.state !== 'running') return;
		note(ctx, machines[t], noteNumber, velocity, length, timestamp);
	};

	onMount(() => {
		async function click() {
			await init();
			document.removeEventListener('click', click);
		}

		document.addEventListener('click', click);

		return () => {
			document.removeEventListener('click', click);

			for (const machine of machines) {
				for (const oscillator of machine.oscillators) {
					oscillator.stop();
				}
			}
		};
	});
</script>

<slot {ctx} {playNote} />
