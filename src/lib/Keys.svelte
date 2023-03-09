<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { keys } from './keyboard';
	import { KeysMode, Mode } from './state';
	// import type { N16, T16 } from './utils';
	import svgPlay from './icons/play.svg?raw';
	import svgRec from './icons/rec.svg?raw';
	import svgStop from './icons/stop.svg?raw';

	export let mode: Mode;
	export let keysMode: KeysMode;
	export let keyboardMode: boolean;
	export let muteMode: KeysMode.TrackMutes | KeysMode.PatternMutes;
	export let helpMode = false;
	export let active: number[] = [];
	export let highlighted: number[] = [];
	export let fractions: number[];
	// export let fractions: T16;
	export let pressedCodes = new Set<string>();
	export let pressedSteps = new Set<number>();
	// export let pressedSteps = new Set<N16>();
	export let page: number;

	$: shiftPressed = pressedCodes.has('ShiftLeft') || pressedCodes.has('ShiftRight');

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
			case KeysMode.BankChange:
				dispatch('bank-change', step);
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
	<ul class="left-column">
		<li class="func">
			<button
				class:pressed={shiftPressed || keysMode === muteMode}
				on:click={() => {
					if (keysMode === muteMode) dispatch('keys-mode-pop', muteMode);
					else dispatch('keys-mode-push', muteMode);
				}}>Func</button
			>
		</li>
		<li class="trk" class:keyboard={keyboardMode}>
			<button
				class:pressed={pressedCodes.has('Tab') || keysMode === KeysMode.TrackChange}
				on:click={() => {
					if (keysMode === KeysMode.TrackChange) dispatch('keys-mode-pop', KeysMode.TrackChange);
					else dispatch('keys-mode-push', KeysMode.TrackChange);
				}}>Trk</button
			>
		</li>
		<li>
			<button
				class:pressed={pressedCodes.has('Backquote') ||
					pressedCodes.has('IntlBackslash') ||
					keysMode === KeysMode.PatternChange}
				on:click={() => {
					if (keysMode === KeysMode.PatternChange)
						dispatch('keys-mode-pop', KeysMode.PatternChange);
					else dispatch('keys-mode-push', KeysMode.PatternChange);
				}}>Ptn</button
			>
		</li>
		<li>
			<button
				class:pressed={pressedCodes.has('Escape') || keysMode === KeysMode.BankChange}
				on:click={() => {
					if (keysMode === KeysMode.BankChange) dispatch('keys-mode-pop', KeysMode.BankChange);
					else dispatch('keys-mode-push', KeysMode.BankChange);
				}}>Bank</button
			>
		</li>
	</ul>

	<div class="right-column">
		<div class="right-top">
			<ul>
				<li><button class:pressed={pressedCodes.has('KeyZ')}>{@html svgRec}</button></li>
				<li>
					<button
						class:pressed={pressedCodes.has('KeyX') || (pressedCodes.has('Space') && !shiftPressed)}
						>{@html svgPlay}</button
					>
				</li>
				<li>
					<button
						class:pressed={pressedCodes.has('KeyC') || (pressedCodes.has('Space') && shiftPressed)}
						>{@html svgStop}</button
					>
				</li>
			</ul>

			<ul>
				<li class="hide"><button>A</button></li>
				<li class="pages">
					<button
						class:pressed={pressedCodes.has('BracketLeft')}
						on:click={() => dispatch('page-prev')}>Page-</button
					>
					<ol>
						{#each { length: 4 } as _, p}
							<li class="light" class:active={p === page} />
						{/each}
					</ol>
				</li>
				<li>
					<button
						class:pressed={pressedCodes.has('BracketRight')}
						on:click={() => dispatch('page-next')}>Page+</button
					>
				</li>
			</ul>
		</div>

		<div class="right-bottom">
			<ol>
				{#each keys as key, step}
					<li>
						<button
							class:active={active.includes(step)}
							class:highlighted={highlighted.includes(step)}
							class:pressed={pressedSteps.has(step)}
							style:--opacity={1 - 0.5 * fractions[step]}
							on:pointerdown={() => click(step)}
							on:pointerenter={event => event.buttons !== 0 && click(step)}
							>{helpMode ? key : step + 1}</button
						>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>

<style>
	section {
		width: 100%;
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 2em;
		font-size: 1.5em;
		/* font-weight: bold; */
	}

	.left-column {
		display: grid;
		grid-template-columns: 1fr;
	}

	.right-column {
		width: calc(100% - 10em);
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.right-top {
		display: flex;
		justify-content: space-between;
		gap: 1em;
	}

	.right-bottom {
		display: flex;
		justify-content: end;
	}

	ul {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5em;
		list-style: none;
	}

	.func {
		color: var(--vd);
		background-color: var(--hf);
		border-color: var(--hf);
		box-shadow: 0 0 1px 1px var(--hf), 0.1em 0.1em 0.1em #000;
	}

	.func > button {
		color: var(--vd);
	}

	.trk {
		position: relative;
		margin-bottom: 2em;
	}

	.pages {
		position: relative;
	}

	.pages > ol {
		position: absolute;
		top: -0.5em;
		left: 1.5em;
	}

	.light {
		position: relative;
		width: 1em;
		border: none;
		box-shadow: none;
	}

	.trk::after,
	.light::after {
		content: '';
		position: absolute;
		width: 0.5em;
		height: 0.5em;
		bottom: 0;
		left: 0;

		border-radius: 0.5em;
		border-width: 1px;
		border-color: var(--v3);
		color: var(--v3);
		background-color: var(--v5);
		transition-property: color, background-color, border-color, box-shadow;
		transition-duration: 50ms;
		box-shadow: inset 0 0 3px 1.5px, 0 0 0 0;
	}

	.trk.keyboard::after,
	.light.active::after {
		color: var(--hf);
		background-color: var(--vf);
		border-color: var(--hf);
		box-shadow: inset 0 0 3px 1.5px, 0 0 10px 1px;
	}

	.trk::after {
		transform: translate(1.7em, 1em);
	}

	ul > li {
		width: 4em;
	}

	.hide {
		opacity: 0;
	}

	ol {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 0.5em;
		list-style: none;
		font-size: 1.1em;
	}

	li {
		width: 3em;
		border: 0.1em solid #000;
		border-radius: 0.3em;
		box-shadow: 0.1em 0.1em 0.1em #000;
		white-space: nowrap;
	}

	button {
		width: 100%;
		padding: 0.5em;
		border-radius: 0.3em;
		text-transform: uppercase;
		transition-property: color, border-color, box-shadow, text-shadow, opacity;
		transition-duration: 50ms;
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
		opacity: var(--opacity);
	}

	button:is(.pressed, :active) {
		color: var(--vf);
		border-color: var(--vf);
		opacity: 1;
	}
</style>
