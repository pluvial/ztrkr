<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { keys } from './keyboard';
	import { KeysMode, Mode } from './state';
	// import type { N16 } from './utils';

	export let mode: Mode;
	export let keysMode: KeysMode;
	export let muteMode: KeysMode.TrackMutes | KeysMode.PatternMutes;
	export let helpMode = false;
	export let active: number[] = [];
	export let highlighted: number[] = [];
	export let pressedKeys = new Set<string>();
	export let pressedSteps = new Set<number>();
	// export let pressedSteps = new Set<N16>();

	const dispatch = createEventDispatcher();

	function click(step: number) {
		// TODO: revisit, currently needs to be kept in sync with Keyboard.svelte
		switch (keysMode) {
			case KeysMode.Default:
				switch (mode) {
					case Mode.Default:
						dispatch('trigger-track', step);
						break;
					case Mode.GridRec:
						dispatch('step-toggle', step);
						break;
					case Mode.StepRec:
						// TODO
						break;
					case Mode.LiveRec:
						dispatch('rec-trigger-track', step);
						break;
				}
				break;
			case KeysMode.TrackChange:
				dispatch('track-change', step);
				break;
			case KeysMode.PatternChange:
				dispatch('pattern-change', step);
				break;
			case KeysMode.Keyboard:
				switch (mode) {
					case Mode.LiveRec:
						dispatch('rec-trigger-note', step);
						break;
					default:
						dispatch('trigger-note', step);
				}
				break;
			case KeysMode.TrackMutes:
				dispatch('track-mute-toggle', step);
				break;
			case KeysMode.PatternMutes:
				dispatch('pattern-mute-toggle', step);
				break;
		}
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
				}}>Trk</button
			>
		</li>
		<li>
			<button
				class:pressed={pressedKeys.has('`') || keysMode === KeysMode.PatternChange}
				on:click={() => {
					if (keysMode === KeysMode.PatternChange)
						dispatch('keys-mode-pop', KeysMode.PatternChange);
					else dispatch('keys-mode-push', KeysMode.PatternChange);
				}}>Ptn</button
			>
		</li>
		<li class="hide"><button>B</button></li>
		<li class="hide"><button>C</button></li>
		<li>
			<button
				class:pressed={pressedKeys.has('Shift') || keysMode === muteMode}
				on:click={() => {
					if (keysMode === muteMode) dispatch('keys-mode-pop', muteMode);
					else dispatch('keys-mode-push', muteMode);
				}}>Func</button
			>
		</li>
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
		text-transform: uppercase;
		transition-property: color, border-color, box-shadow, text-shadow;
		transition-duration: 0.1s;
	}

	ul button {
		color: var(--v7);
	}

	ol button {
		color: var(--v3);
		text-decoration: underline;
	}

	ol > li:nth-child(4n + 1) > button {
		border: 0.1em solid;
	}

	button:is(.active, .highlighted, .pressed) {
		text-shadow: 0 0 10px;
	}

	ol > li:nth-child(4n + 1) > button:is(.active, .highlighted, .pressed) {
		box-shadow: 0 0 10px 1px;
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
