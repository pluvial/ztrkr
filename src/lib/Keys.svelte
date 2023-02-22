<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { keys } from './keyboard';

	export let active: number[] = [];
	export let highlighted: number[] = [];
	export let pressed: number[] = [];

	export let showKeys = false;

	const dispatch = createEventDispatcher();
</script>

<div>
	<ol>
		{#each keys as key, step}
			<li>
				<button
					class:active={active.includes(step)}
					class:highlighted={highlighted.includes(step)}
					class:pressed={pressed.includes(step)}
					on:pointerdown={() => dispatch('step-toggle', step)}
					on:pointerenter={event => {
						if (event.buttons !== 0) dispatch('step-toggle', step);
					}}>{showKeys ? key : step + 1}</button
				>
			</li>
		{/each}
	</ol>
</div>

<style>
	ol {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		column-gap: 0.5em;
		row-gap: 0.5em;
		list-style: none;
		font-size: 1.5em;
	}

	li {
		width: 3em;
		border: 0.1em solid #000;
		border-radius: 0.3em;
		box-shadow: 0.1em 0.1em 0.1em #000;
	}

	button {
		width: 100%;
		padding: 0.5em;
		border-radius: 0.3em;
		text-decoration: underline;
	}

	li:nth-child(4n + 1) > button {
		border: 0.1em solid;
	}

	button.active {
		color: red;
		border-color: red;
	}

	button.highlighted {
		color: #eee;
		border-color: #eee;
	}

	button.pressed {
		color: #fff;
		border-color: #fff;
	}
</style>
