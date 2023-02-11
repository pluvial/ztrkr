<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { scaleToString, type N16 } from './utils';

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
	export let midiInputName: string;
	export let midiOutputName: string;

	$: tempoModeChecked = tempoMode === 'global';
	$: scaleModeChecked = scaleMode === 'per-track';

	const dispatch = createEventDispatcher();
</script>

<p>
	<button type="button" on:click={() => dispatch('rec')}>Rec</button><button
		type="button"
		on:click={() => dispatch(playing ? 'pause' : 'play')}>{playing ? 'Pause' : 'Play'}</button
	><button type="button" on:click={() => dispatch('stop')}>Stop</button>
</p>

<p>
	<label>
		<input
			type="checkbox"
			bind:checked={tempoModeChecked}
			on:input={() => dispatch('tempo-mode-change', tempoModeChecked ? 'per-pattern' : 'global')}
		/>
		Tempo Mode: {tempoMode}
	</label>
</p>

<p>
	<button on:click={() => dispatch('bpm-change', bpm - 16)}>&lt;&lt;-</button>
	<button on:click={() => dispatch('bpm-change', bpm - 1)}>&lt;-</button>
	<button on:click={() => dispatch('bpm-change', bpm + 1)}>-></button>
	<button on:click={() => dispatch('bpm-change', bpm + 16)}>->></button>{tempoMode === 'global'
		? 'Global'
		: 'Pattern'} BPM: {bpm}
</p>

<p>
	<label>
		<input
			type="checkbox"
			bind:checked={scaleModeChecked}
			on:input={() => dispatch('scale-mode-change', scaleModeChecked ? 'per-pattern' : 'per-track')}
		/>
		Scale Mode: {scaleMode}
	</label>
</p>

<p>
	<button on:click={() => dispatch('scale-change', scale / 2)}>&lt;-</button>
	<button on:click={() => dispatch('scale-change', scale * 2)}>-></button>{scaleMode ===
	'per-pattern'
		? 'Pattern'
		: 'Track'} Scale: {scaleToString(scale)}
</p>
<p>
	<button on:click={() => dispatch('length-change', length / 2)}>&lt;&lt;-</button>
	<button on:click={() => dispatch('length-change', length - 1)}>&lt;-</button>
	<button on:click={() => dispatch('length-change', length + 1)}>-></button>
	<button on:click={() => dispatch('length-change', length * 2)}>->></button>{scaleMode ===
	'per-pattern'
		? 'Pattern'
		: 'Track'} Length: {length}
</p>

<p>
	<button on:click={() => dispatch('track-prev')}>&lt;-</button>
	<button on:click={() => dispatch('track-next')}>-></button>
	Track: {trackIndex}
</p>

<p>
	<button on:click={() => dispatch('pattern-prev')}>&lt;-</button>
	<button on:click={() => dispatch('pattern-next')}>-></button>
	<button on:click={() => dispatch('pattern-new')}>New</button>Pattern: {patternName} ({patternIndex})
</p>

<p>
	<button on:click={() => dispatch('project-prev')}>&lt;-</button>
	<button on:click={() => dispatch('project-next')}>-></button>
	<button on:click={() => dispatch('project-new')}>New</button>Project: {projectName} ({projectIndex})
</p>

<p>Press ? to toggle keybindings</p>

<p>
	<button on:click={() => dispatch('midi-input-prev')}>-</button><button
		on:click={() => dispatch('midi-input-next')}>+</button
	>MIDI Input: {midiInputName}
</p>

<p>
	<button on:click={() => dispatch('midi-output-prev')}>-</button><button
		on:click={() => dispatch('midi-output-next')}>+</button
	>MIDI Output: {midiOutputName}
</p>

<style>
	button {
		border: 1px solid #ccc;
		border-radius: 3px;
		padding: 0.3em;
		margin-right: 0.5em;
	}
</style>
