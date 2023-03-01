<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { keys } from './keyboard';
	import { KeysMode, Mode } from './state';
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

	function click(step: number) {
		if (keysMode === KeysMode.TrackChange) dispatch('track-change', step);
		else if (mode === Mode.GridRec) dispatch('step-toggle', step);
	}
</script>

<section>
	<ul>
		<li>
			<button
				class:pressed={pressedKeys.has('Tab') || keysMode === KeysMode.TrackChange}
				on:click={() => {
					if (keysMode === KeysMode.TrackChange) dispatch('keys-mode-pop', KeysMode.TrackChange);
					else dispatch('keys-mode-push', KeysMode.TrackChange);
				}}>TRK</button
			>
		</li>
		<li class="hide"><button>A</button></li>
		<li class="hide"><button>B</button></li>
		<li class="hide"><button>C</button></li>
		<li><button class:pressed={pressedKeys.has('Shift')}>FUNC</button></li>
		<li><button class:pressed={pressedKeys.has('z')}>Rec</button></li>
		<li>
			<button
				class:pressed={pressedKeys.has('x') || (pressedKeys.has(' ') && !pressedKeys.has('Shift'))}
				>Play</button
			>
		</li>
		<li>
			<button
				class:pressed={pressedKeys.has('c') || (pressedKeys.has(' ') && pressedKeys.has('Shift'))}
				>Stop</button
			>
		</li>
	</ul>
	<ol>
		{#each keys as key, step}
			<li>
				<button
					class:active={active.includes(step)}
					class:highlighted={highlighted.includes(step)}
					class:pressed={pressedSteps.has(step)}
					on:pointerdown={() => click(step)}
					on:pointerenter={event => event.buttons !== 0 && click(step)}
					>{helpMode ? key : step + 1}</button
				>
			</li>
		{/each}
	</ol>
</section>

<style>
	section {
		display: flex;
		gap: 0.5em;
		font-size: 1.5em;
		/* font-weight: bold; */
	}

	ul {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		column-gap: 0.1em;
		row-gap: 0.5em;
		list-style: none;
	}

	ul > li {
		width: 3.5em;
	}

	.hide {
		opacity: 0;
	}

	ol {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		column-gap: 0.5em;
		row-gap: 0.5em;
		list-style: none;
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
		color: var(--v7);
	}

	ol > li:nth-child(4n + 1) > button {
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
