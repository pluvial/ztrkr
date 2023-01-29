<script lang="ts">
	import { keys } from './keyboard';

	export let active: number[] = [];
	export let highlighted: number[] = [];
	export let pressed: number[] = [];

	export let showKeys = false;
</script>

<ol>
	{#each keys as key, step}
		<li
			class:active={active.includes(step)}
			class:highlighted={highlighted.includes(step)}
			class:pressed={pressed.includes(step)}
		>
			{showKeys ? key : step + 1}
		</li>
	{/each}
</ol>

<style>
	ol {
		width: 20em;
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		column-gap: 0.5em;
		row-gap: 0.5em;
		list-style: none;
		font-size: 2em;
	}

	li {
		width: 2em;
		text-align: center;
		text-decoration: underline;
		box-shadow: 0.1em 0.1em 0.1em #000;
	}

	li:nth-child(4n + 1) {
		border: 1px solid #ccc;
		border-radius: 0.2em;
	}

	li.active {
		color: red;
		border-color: red;
	}

	li.highlighted {
		color: #eee;
	}

	li.pressed {
		color: #fff;
	}
</style>
