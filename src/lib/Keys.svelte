<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { keys } from './keyboard';
	import type { KeysMode, Mode } from './state';
	// import type { N16 } from './utils';

	export let mode: Mode;
	export let keysMode: KeysMode;
	export let helpMode = false;
	export let active: number[] = [];
	export let highlighted: number[] = [];
	export let pressedKeys = new Set<string>();
	export let pressedSteps = new Set<number>();
	// export let pressedSteps = new Set<N16>();

	const dispatch = createEventDispatcher();
</script>

<div>
	<ol>
		{#each keys as key, step}
			<li>
				<button
					class:active={active.includes(step)}
					class:highlighted={highlighted.includes(step)}
					class:pressed={pressedSteps.has(step)}
					on:pointerdown={() => dispatch('step-toggle', step)}
					on:pointerenter={event => {
						if (event.buttons !== 0) dispatch('step-toggle', step);
					}}>{helpMode ? key : step + 1}</button
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
		color: var(--hf);
		border-color: var(--hf);
	}

	button.highlighted {
		color: var(--vd);
		border-color: var(--vd);
	}

	button.pressed {
		color: var(--vf);
		border-color: var(--vf);
	}
</style>
