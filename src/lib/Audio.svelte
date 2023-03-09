<script lang="ts">
	import { onMount } from 'svelte';
	import { defaultMachines, type Machine } from './audio';
	import type { Tuple16 } from './utils';

	export let ctx: AudioContext;
	export let machines: Tuple16<Machine>;

	let analyser: AnalyserNode;

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

<slot {ctx} {machines} />
