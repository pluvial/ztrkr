<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { KeysMode, Mode } from './state';
	import { probabilityToString, scaleToString, type N16 } from './utils';

	export let mode: Mode;
	export let keysMode: KeysMode;
	export let helpMode: boolean;
	export let pulseMode: boolean;
	export let projectIndex: number;
	export let projectName: string;
	export let patternIndex: number;
	export let patternName: string;
	export let trackIndex: N16;
	export let playing: boolean;
	export let tempoMode: 'global' | 'per-pattern';
	export let bpm: number;
	export let scaleMode: 'per-pattern' | 'per-track';
	export let scale: number;
	export let length: number;
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

{#if helpMode}
	<ul>
		{#each Object.entries(helpKeys) as [key, help]}
			<li>{key} - {help}</li>
		{/each}
	</ul>
{:else}
	<p>Press ? to toggle help mode</p>
{/if}

<div class="controls">
	<section>
		<div class="buttons">
			<button
				type="button"
				on:click={() => {
					if (mode !== Mode.GridRec) dispatch('mode-set', Mode.GridRec);
					else dispatch('mode-set', Mode.Default);
				}}>GridRec</button
			>
			<button
				type="button"
				on:click={() => {
					if (mode !== Mode.LiveRec) dispatch('mode-set', Mode.LiveRec);
					else dispatch('mode-set', Mode.Default);
				}}>LiveRec</button
			>
			<button
				type="button"
				on:click={() => {
					if (mode !== Mode.StepRec) dispatch('mode-set', Mode.StepRec);
					else dispatch('mode-set', Mode.Default);
				}}>StepRec</button
			>
		</div>
	</section>

	<section>
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
		<p>Pulse mode: {pulseMode ? 'on' : 'off'}</p>
		<input
			type="checkbox"
			checked={pulseMode}
			on:input={event => dispatch('pulse-mode-change', event.currentTarget.checked)}
		/>
	</section>

	<section>
		<p>Tempo Mode: {tempoMode}</p>
		<input
			type="checkbox"
			checked={tempoMode === 'global'}
			on:input={event =>
				dispatch('tempo-mode-change', event.currentTarget.checked ? 'global' : 'per-pattern')}
		/>
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
		<p>Scale Mode: {scaleMode}</p>
		<input
			type="checkbox"
			checked={scaleMode === 'per-track'}
			on:input={event =>
				dispatch('scale-mode-change', event.currentTarget.checked ? 'per-track' : 'per-pattern')}
		/>
	</section>

	<section>
		<p>{scaleMode === 'per-pattern' ? 'Pattern' : 'Track'} Scale: {scaleToString(scale)}</p>
		<div class="buttons">
			<button on:click={() => dispatch('scale-change', scale / 2)}>&lt;</button>
			<button on:click={() => dispatch('scale-change', scale * 2)}>></button>
		</div>
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
		<p>Track: {trackIndex}</p>
		<div class="buttons">
			<button on:click={() => dispatch('track-prev')}>&lt;</button>
			<button on:click={() => dispatch('track-next')}>></button>
		</div>
	</section>

	<section>
		<p>Pattern: {patternName} ({patternIndex})</p>
		<div class="buttons">
			<button on:click={() => dispatch('pattern-prev')}>&lt;</button>
			<button on:click={() => dispatch('pattern-next')}>></button>
			<button on:click={() => dispatch('pattern-new')}>New</button>
			<button on:click={() => dispatch('pattern-save')}>Save</button>
		</div>
	</section>

	<section>
		<p>Project: {projectName} ({projectIndex})</p>
		<div class="buttons">
			<button on:click={() => dispatch('project-prev')}>&lt;</button>
			<button on:click={() => dispatch('project-next')}>></button>
			<button on:click={() => dispatch('project-new')}>New</button>
			<button on:click={() => dispatch('project-save')}>Save</button>
		</div>
	</section>

	<section>
		<p>MIDI Input: {midiInputName}</p>
		<div class="buttons">
			<button on:click={() => dispatch('midi-input-prev')}>&lt;</button>
			<button on:click={() => dispatch('midi-input-next')}>></button>
		</div>
	</section>

	<section>
		<p>MIDI Output: {midiOutputName}</p>
		<div class="buttons">
			<button on:click={() => dispatch('midi-output-prev')}>&lt;</button>
			<button on:click={() => dispatch('midi-output-next')}>></button>
		</div>
	</section>

	<section>
		<p>Disk Storage</p>
		<div class="buttons">
			<button on:click={() => dispatch('disk-clear')}>Clear Disk</button>
			<button on:click={() => dispatch('storage-clear')}>Clear Storage</button>
		</div>
	</section>
</div>

<style>
	.controls {
		max-width: 80em;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 1em;
		row-gap: 1em;
	}

	section {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1em;
	}

	.buttons {
		display: flex;
		gap: 0.5em;
	}

	button {
		border: 1px solid #ccc;
		border-radius: 3px;
		min-width: 2em;
		padding: 0.3em;
		font-weight: bold;
	}
</style>
