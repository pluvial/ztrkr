<script lang="ts">
	import { onMount } from 'svelte';

	export let width = 128;
	export let height = 64;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	onMount(() => {
		ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

		ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
		ctx.fillRect(0, 0, 30, 30);
		ctx.fillRect(40, 0, 30, 30);
		ctx.fillRect(80, 0, 30, 30);

		ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
		ctx.fillRect(10, 10, 30, 30);
		ctx.fillRect(50, 10, 30, 30);
		ctx.fillRect(90, 10, 30, 30);

		ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
		ctx.fillRect(20, 20, 30, 30);
		ctx.fillRect(60, 20, 30, 30);
		ctx.fillRect(100, 20, 30, 30);

		ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
		ctx.fillRect(30, 30, 30, 30);
		ctx.fillRect(70, 30, 30, 30);
		ctx.fillRect(110, 30, 30, 30);
	});
</script>

<canvas bind:this={canvas} {width} {height} />

<style>
	canvas {
		width: 256px;
		height: 128px;
		/* width: 512px;
		height: 256px; */
		/* image-rendering: crisp-edges; */
		image-rendering: pixelated;
	}
</style>
