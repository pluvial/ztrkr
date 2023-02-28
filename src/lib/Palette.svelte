<script lang="ts">
	import { onMount } from 'svelte';

	const regex = /rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/;

	let container: HTMLDivElement;

	let elements: HTMLLIElement[] = [];

	const colors = new WeakMap<Element, string>();

	onMount(() => {
		for (const element of container.querySelectorAll('li')) {
			const color = getComputedStyle(element).backgroundColor;
			const [, ...rgb] = regex.exec(color) ?? [];
			const hex = rgb.map(s => Number(s).toString(16));
			for (const value of hex) {
				if (value !== '0' && (value.length !== 2 || value[0] !== value[1]))
					throw new Error('color scale is not 12 bit');
			}
			const [r, g, b] = hex.map(v => v[0]);
			colors.set(element, `#${r}${g}${b}`);
		}
	});
</script>

<div bind:this={container} class="container">
	{#each ['w', 'r', 'g', 'b', 'c', 'm', 'y'] as color}
		<ul>
			{#each { length: 8 } as _, i}
				{@const css_var = `--${color}${(2 * i + 1).toString(16)}`}
				<li style:background-color="var({css_var})">{css_var}</li>
			{/each}
		</ul>
	{/each}

	<ul>
		{#each { length: 12 } as _, i}
			{@const css_var = `--i${(i + 1).toString(16)}`}
			<li style:background-color="var({css_var})">{css_var}</li>
		{/each}
	</ul>

	{#each { length: 12 } as _, j}
		<ul>
			{#each { length: 8 } as _, i}
				{@const css_var = `--i${(j + 1).toString(16)}${(2 * i + 1).toString(16)}`}
				<li bind:this={elements[j * 8 + i]} style:background-color="var({css_var})">
					{css_var}
					{colors.get(elements[j * 8 + i]) ?? ''}
				</li>
			{/each}
		</ul>
	{/each}
</div>

<style>
	.container {
		width: 100%;
		max-width: 60em;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	ul {
		width: 100%;
		display: flex;
	}

	li {
		flex: 1;
		height: 5em;
		text-align: center;
		line-height: 5em;
		color: #fff;
	}
</style>
