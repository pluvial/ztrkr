<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { KeysMode, Mode, maxFiniteLength } from './state';
	import { probabilityToString, scaleToString, type N16 } from './utils';

	export let mode: Mode;
	export let keysMode: KeysMode;
	export let patternChangeMode: boolean;
	export let helpMode: boolean;
	export let pulseMode: boolean;
	export let projectIndex: number;
	export let projectName: string;
	export let patternIndex: number;
	export let patternName: string;
	export let trackIndex: N16;
	export let trackType: 'audio' | 'midi';
	export let playing: boolean;
	export let tempoMode: 'global' | 'per-pattern';
	export let bpm: number;
	export let scaleMode: 'per-pattern' | 'per-track';
	export let scale: number;
	export let length: number;
	export let patternLength: number;
	export let changeLength: number | undefined;
	export let channel: N16;
	export let noteNumber: number;
	export let velocity: number;
	export let probability: number;
	export let midiInputName: string;
	export let midiOutputName: string;

	const dispatch = createEventDispatcher();

	const helpKeys = {
		ArrowDown: 'Length Increment',
		'Ctrl+ArrowDown': 'Length Increment (xl)',
		'Shift+ArrowDown': 'Scale Increment',
		ArrowUp: 'Length Decrement',
		'Ctrl+ArrowUp': 'Length Decrement (xl)',
		'Shift+ArrowUp': 'Scale Decrement',
		ArrowLeft: 'Track Prev',
		ArrowRight: 'Track Next',
		End: 'Track Last',
		Home: 'Track First',
		PageDown: 'Track Last',
		PageUp: 'Track First',
		Space: 'Play/Pause',
		'Shift+Space': 'Stop/Restart',
		'Backspace/Delete': 'Track Clear',
		'Shift+Backspace/Delete': 'Tracks Clear',
		'Ctrl+Shift+Backspace/Delete': 'Pattern Clear',
		Tab: 'Track Next',
		'Shift+Tab': 'Track Prev',
		'Tab (hold)': 'Track Change Mode',
		'` (hold)': 'Pattern Change Mode',
		'Shift+`/~': 'Toggle Keyboard Mode',
		'Shift+Esc': 'Toggle Mute Mode hold/switch',
		'Shift (hold)': 'Track/Channel Mute Mode',
		c: 'Stop',
		x: 'Play/Pause',
		z: 'Grid Recording',
		'Shift+z': 'Step Recording',
		'Alt+z': 'Live Recording',
		'z+c': 'Step Recording',
		'z+x': 'Live Recording',
		'?': 'Help Mode Toggle',
	};
</script>

<div class="help">
	{#if helpMode}
		<ul>
			{#each Object.entries(helpKeys) as [key, help]}
				<li>{key} - {help}</li>
			{/each}
		</ul>
	{:else}
		<p>Press ? to toggle help mode</p>
	{/if}
</div>

<div class="controls">
	<section>
		<p>Mode:</p>
		<div class="buttons">
			<button
				type="button"
				class:active={mode === Mode.GridRec}
				on:click={() => {
					if (mode !== Mode.GridRec) dispatch('mode-set', Mode.GridRec);
					else dispatch('mode-set', Mode.Default);
				}}>GridRec</button
			>
			<button
				type="button"
				class:active={mode === Mode.LiveRec}
				on:click={() => {
					if (mode !== Mode.LiveRec) dispatch('mode-set', Mode.LiveRec);
					else dispatch('mode-set', Mode.Default);
				}}>LiveRec</button
			>
			<!-- <button
				type="button"
				class:active={mode === Mode.StepRec}
				on:click={() => {
					if (mode !== Mode.StepRec) dispatch('mode-set', Mode.StepRec);
					else dispatch('mode-set', Mode.Default);
				}}>StepRec</button
			> -->
		</div>
	</section>

	<section>
		<p>Player:</p>
		<div class="buttons">
			<button type="button" on:click={() => (playing ? dispatch('pause') : dispatch('play'))}
				>{playing ? 'Pause' : 'Play'}</button
			>
			<button
				type="button"
				on:click={() => {
					dispatch('stop');
					if (!playing) dispatch('play');
				}}>{playing ? 'Stop' : 'Restart'}</button
			>
		</div>
	</section>

	<section>
		<p>Keys Mode:</p>
		<div class="buttons">
			<button
				type="button"
				class:active={keysMode === KeysMode.Keyboard}
				on:click={() => {
					if (keysMode !== KeysMode.Keyboard) {
						dispatch('keys-mode-pop', keysMode);
						dispatch('keys-mode-push', KeysMode.Keyboard);
					} else dispatch('keys-mode-pop', KeysMode.Keyboard);
				}}>Keyboard</button
			>
			<button
				type="button"
				class:active={keysMode === KeysMode.TrackChange}
				on:click={() => {
					if (keysMode !== KeysMode.TrackChange) {
						dispatch('keys-mode-pop', keysMode);
						dispatch('keys-mode-push', KeysMode.TrackChange);
					} else dispatch('keys-mode-pop', KeysMode.TrackChange);
				}}>TrackChange</button
			>
			<button
				type="button"
				class:active={keysMode === KeysMode.PatternChange}
				on:click={() => {
					if (keysMode !== KeysMode.PatternChange) {
						dispatch('keys-mode-pop', keysMode);
						dispatch('keys-mode-push', KeysMode.PatternChange);
					} else dispatch('keys-mode-pop', KeysMode.PatternChange);
				}}>PatternChange</button
			>
			<button
				type="button"
				class:active={keysMode === KeysMode.BankChange}
				on:click={() => {
					if (keysMode !== KeysMode.BankChange) {
						dispatch('keys-mode-pop', keysMode);
						dispatch('keys-mode-push', KeysMode.BankChange);
					} else dispatch('keys-mode-pop', KeysMode.BankChange);
				}}>BankChange</button
			>
			<button
				type="button"
				class:active={keysMode === KeysMode.TrackMutes}
				on:click={() => {
					if (keysMode !== KeysMode.TrackMutes) {
						dispatch('keys-mode-pop', keysMode);
						dispatch('keys-mode-push', KeysMode.TrackMutes);
					} else dispatch('keys-mode-pop', KeysMode.TrackMutes);
				}}>TrackMutes</button
			>
			<button
				type="button"
				class:active={keysMode === KeysMode.PatternMutes}
				on:click={() => {
					if (keysMode !== KeysMode.PatternMutes) {
						dispatch('keys-mode-pop', keysMode);
						dispatch('keys-mode-push', KeysMode.PatternMutes);
					} else dispatch('keys-mode-pop', KeysMode.PatternMutes);
				}}>PatternMutes</button
			>
		</div>
	</section>

	<section>
		<p>Track: {trackIndex}</p>
		<div class="buttons">
			<button on:click={() => dispatch('track-prev')}>&lt;</button>
			<button on:click={() => dispatch('track-next')}>></button>
		</div>
	</section>

	<section>
		<p>Note: {noteNumber}</p>
		<div class="buttons">
			<button on:click={() => dispatch('note-number-change', noteNumber - 12)}>&lt;&lt;</button>
			<button on:click={() => dispatch('note-number-change', noteNumber - 1)}>&lt;</button>
			<button on:click={() => dispatch('note-number-change', noteNumber + 1)}>></button>
			<button on:click={() => dispatch('note-number-change', noteNumber + 12)}>>></button>
		</div>
	</section>

	<section>
		<p>Velocity: {velocity}</p>
		<div class="buttons">
			<button on:click={() => dispatch('velocity-change', velocity / 2)}>&lt;&lt;</button>
			<button on:click={() => dispatch('velocity-change', velocity - 1)}>&lt;</button>
			<button on:click={() => dispatch('velocity-change', velocity + 1)}>></button>
			<button on:click={() => dispatch('velocity-change', velocity * 2)}>>></button>
		</div>
	</section>

	<section>
		<p>Probability: {probabilityToString(probability)}</p>
		<div class="buttons">
			<button on:click={() => dispatch('probability-change', probability / 2)}>&lt;&lt;</button>
			<button on:click={() => dispatch('probability-change', 1 / (1 / probability + 1))}
				>&lt;</button
			>
			<button on:click={() => dispatch('probability-change', 1 / (1 / probability - 1))}>></button>
			<button on:click={() => dispatch('probability-change', probability * 2)}>>></button>
		</div>
	</section>

	<section>
		<p>Channel: {channel + 1}</p>
		<div class="buttons">
			<button on:click={() => dispatch('channel-change', channel - 1)}>&lt;</button>
			<button on:click={() => dispatch('channel-change', channel + 1)}>></button>
		</div>
	</section>

	<!-- 
	<label
		>Track type: {trackType}{trackType === 'audio' ? ' (under construction)' : ''}<input
			type="checkbox"
			checked={trackType === 'audio'}
			on:input={event =>
				dispatch('track-type-change', event.currentTarget.checked ? 'audio' : 'midi')}
		/>
	</label> -->

	<section>
		<label
			>Scale Mode: {scaleMode}
			<input
				type="checkbox"
				checked={scaleMode === 'per-track'}
				on:input={event =>
					dispatch('scale-mode-change', event.currentTarget.checked ? 'per-track' : 'per-pattern')}
			/>
		</label>
	</section>

	<section>
		<p>{scaleMode === 'per-pattern' ? 'Pattern' : 'Track'} Length: {length}</p>
		<div class="buttons">
			<button on:click={() => dispatch('length-change', length / 2)}>&lt;&lt;</button>
			<button on:click={() => dispatch('length-change', length - 1)}>&lt;</button>
			<button on:click={() => dispatch('length-change', length + 1)}>></button>
			<button on:click={() => dispatch('length-change', length * 2)}>>></button>
		</div>
	</section>

	<section>
		<p>{scaleMode === 'per-pattern' ? 'Pattern' : 'Track'} Scale: {scaleToString(scale)}</p>
		<div class="buttons">
			<button on:click={() => dispatch('scale-change', scale / 2)}>&lt;</button>
			<button on:click={() => dispatch('scale-change', scale * 2)}>></button>
		</div>
	</section>

	<section>
		{#if scaleMode === 'per-track'}
			<p>Change Length: {changeLength ?? 'off'}</p>
			<div class="buttons">
				<button on:click={() => dispatch('length-ch-change', (changeLength ?? patternLength) / 2)}
					>&lt;&lt;</button
				>
				<button on:click={() => dispatch('length-ch-change', (changeLength ?? patternLength) - 1)}
					>&lt;</button
				>
				<button on:click={() => dispatch('length-ch-change', (changeLength ?? patternLength) + 1)}
					>></button
				>
				<button on:click={() => dispatch('length-ch-change', (changeLength ?? patternLength) * 2)}
					>>></button
				>
			</div>
		{/if}
	</section>

	<section>
		{#if scaleMode === 'per-track'}
			<p>Pattern Length: {patternLength}</p>
			<div class="buttons">
				<button
					on:click={() =>
						dispatch(
							'length-ptn-change',
							patternLength === Infinity ? maxFiniteLength : patternLength / 2,
						)}>&lt;&lt;</button
				>
				<button
					on:click={() =>
						dispatch(
							'length-ptn-change',
							patternLength === Infinity ? maxFiniteLength : patternLength - 1,
						)}>&lt;</button
				>
				<button
					on:click={() =>
						dispatch(
							'length-ptn-change',
							patternLength === maxFiniteLength ? Infinity : patternLength + 1,
						)}>></button
				>
				<button
					on:click={() =>
						dispatch(
							'length-ptn-change',
							patternLength === maxFiniteLength ? Infinity : patternLength * 2,
						)}>>></button
				>
			</div>
		{/if}
	</section>

	<section>
		<label
			>Tempo Mode: {tempoMode}
			<input
				type="checkbox"
				checked={tempoMode === 'global'}
				on:input={event =>
					dispatch('tempo-mode-change', event.currentTarget.checked ? 'global' : 'per-pattern')}
			/>
		</label>
	</section>

	<section>
		<p>{tempoMode === 'global' ? 'Global' : 'Pattern'} BPM: {bpm}</p>
		<div class="buttons">
			<button on:click={() => dispatch('bpm-change', bpm - 16)}>&lt;&lt;</button>
			<button on:click={() => dispatch('bpm-change', bpm - 1)}>&lt;</button>
			<button on:click={() => dispatch('bpm-change', bpm + 1)}>></button>
			<button on:click={() => dispatch('bpm-change', bpm + 16)}>>></button>
		</div>
	</section>

	<section>
		<p>Pattern: {patternIndex}</p>
		<div class="buttons">
			<button on:click={() => dispatch('pattern-prev')}>&lt;</button>
			<button on:click={() => dispatch('pattern-next')}>></button>
			<button on:click={() => dispatch('pattern-new')}>New</button>
			<button on:click={() => dispatch('pattern-save')}>Save</button>
		</div>
	</section>

	<section>
		<label>
			Pattern Name: <input
				type="text"
				value={patternName}
				on:input={event => dispatch('pattern-name-set', event.currentTarget.value)}
			/>
		</label>
	</section>

	<section>
		<label
			>Pattern change mode: {patternChangeMode ? 'defer' : 'instant'}
			<input
				type="checkbox"
				checked={patternChangeMode}
				on:input={event => dispatch('pattern-change-mode-change', event.currentTarget.checked)}
			/>
		</label>
	</section>

	<section>
		<p>Project: {projectIndex}</p>
		<div class="buttons">
			<button on:click={() => dispatch('project-prev')}>&lt;</button>
			<button on:click={() => dispatch('project-next')}>></button>
			<button on:click={() => dispatch('project-new')}>New</button>
			<button on:click={() => dispatch('project-save')}>Save</button>
		</div>
	</section>

	<section>
		<label>
			Project Name: <input
				type="text"
				value={projectName}
				on:input={event => dispatch('project-name-set', event.currentTarget.value)}
			/>
		</label>
	</section>

	<!-- 
	<section>
		<p>MIDI Input: {midiInputName}</p>
		<div class="buttons">
			<button on:click={() => dispatch('midi-input-prev')}>&lt;</button>
			<button on:click={() => dispatch('midi-input-next')}>></button>
		</div>
	</section> -->

	<section>
		<p>MIDI Output: {midiOutputName}</p>
		<div class="buttons">
			<button on:click={() => dispatch('midi-output-prev')}>&lt;</button>
			<button on:click={() => dispatch('midi-output-next')}>></button>
		</div>
	</section>

	<section>
		<p>Disk:</p>
		<button on:click={() => dispatch('disk-clear')}>Clear</button>
	</section>

	<section>
		<label
			>Pulse mode: {pulseMode ? 'on' : 'off'}
			<input
				type="checkbox"
				checked={pulseMode}
				on:input={event => dispatch('pulse-mode-change', event.currentTarget.checked)}
			/>
		</label>
	</section>
</div>

<style>
	.controls {
		max-width: 65em;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 1em;
		row-gap: 0.5em;
	}

	section {
		display: flex;
		/* justify-content: center; */
		justify-content: space-between;
		align-items: center;
		gap: 0.5em;
	}

	p {
		display: flex;
		white-space: nowrap;
		align-items: center;
		gap: 0.5em;
	}

	.buttons {
		max-width: 15em;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: end;
		gap: 0.5em;
	}

	button,
	input[type='text'] {
		color: var(--vb);
		background-color: var(--v3);
		border-color: var(--v9);
		border-width: 1px;
		border-radius: 3px;
		min-width: 2em;
		padding: 0.3em;
		font-weight: bold;

		transition-property: color, background-color, border-color, box-shadow, text-shadow;
		transition-duration: 100ms;
	}

	button:is(.active, :active, :focus, :focus-visible),
	input[type='text']:is(.active, :active, :focus, :focus-visible) {
		text-shadow: 0 0 10px;
		outline: none;
	}

	button:is(.active, :focus, :focus-visible) {
		color: var(--v3);
		border-color: var(--v3);
		background-color: var(--vd);
		box-shadow: 0 0 5px 1px var(--vb);
	}

	button:active {
		color: var(--v1);
		border-color: var(--v1);
		background-color: var(--vf);
		box-shadow: 0 0 5px 1px var(--vf);
	}

	input[type='text']:is(.active, :active, :focus, :focus-visible) {
		color: var(--vf);
		border-color: var(--vb);
		background-color: var(--v1);
		box-shadow: 0 0 5px 1px var(--vb);
	}

	input[type='text'] {
		/* caret-shape: block; */
		max-width: 10em;
	}

	::selection {
		color: var(--v3);
		background-color: var(--vd);
	}

	label {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		user-select: none;
	}

	.help {
		position: relative;
		top: 1em;
	}
</style>
