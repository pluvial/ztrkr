<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Track } from './state';
	import { probabilityToString, scaleToString, type N16, type T16, type Tuple16 } from '$lib/utils';

	const dispatch = createEventDispatcher();

	export let tracks: Tuple16<Track>;
	export let selectedTrack: N16;
	export let lengths: number[];
	export let scales: number[];
	export let patternSteps: T16;

	export let showKeys = false;

	$: tracksSteps = tracks.map((track, t) =>
		Array.from({ length: lengths[t] }, (_, s) => track.steps[s]),
	);

	$: len = showKeys ? 3 : 5;
	$: pad = (s: number | string) => String(s).padStart(len).slice(-len);
</script>

<ol class="flex" on:keydown on:keypress on:keyup>
	{#each tracks as track, t}
		<li
			class="track"
			class:selected={t === selectedTrack}
			on:pointerdown={() => dispatch('track-change', t)}
			on:pointerenter={event => {
				if (event.buttons !== 0) dispatch('track-change', t);
			}}
		>
			<button
				><pre>{#if showKeys}c:{/if}{pad(track.channel + 1)}</pre>
				<pre>{#if showKeys}p:{/if}{pad(probabilityToString(track.probability))}</pre>
				<pre>{#if showKeys}s:{/if}{pad(scaleToString(scales[t]))}</pre>
				<pre>{#if showKeys}l:{/if}{pad(lengths[t])}</pre></button
			>
			<ol>
				{#each tracksSteps[t] as trig, s}
					<li
						on:pointerdown={() => dispatch('step-toggle', { step: s, track: t })}
						on:pointerenter={event => {
							if (event.buttons !== 0) dispatch('step-toggle', { step: s, track: t });
						}}
					>
						<button
							class="row"
							class:active={patternSteps[t] === s}
							class:highlight={s % (4 * scales[t]) === 0}
							class:note={trig?.type === 'note'}
							class:lock={trig?.type === 'lock'}
							>{s.toString(16).padEnd(2)}{trig ? '***' : '---'}</button
						>
					</li>
				{/each}
			</ol>
		</li>
	{/each}
</ol>

<style>
	.flex {
		display: flex;
	}

	.track {
		border-color: #777;
		border-width: 2px 1px;
		border-radius: 1px;
		height: 100%;
	}

	.track:first-child {
		border-left-width: 2px;
	}

	.track:last-child {
		border-right-width: 2px;
	}

	.track.selected {
		background-color: #333;
		color: #eee;
		font-weight: bold;
		position: relative;
	}

	.track.selected::before {
		content: ' ';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		border-color: red;
		border-width: 2px;
		box-shadow: 0 0 2px 2px red;
		pointer-events: none;
	}

	.track > button {
		border-color: #777;
		border-bottom-width: 1px;
		width: 100%;
		padding: 0.2em 0;
	}

	.row {
		padding: 0.1em 0.3em;
		white-space: nowrap;
	}

	.row.active {
		background-color: #555;
	}

	.selected .row.active {
		background-color: #777;
	}

	.highlight {
		background-color: #333;
	}

	.selected .highlight {
		background-color: #555;
	}

	.note {
		background-color: #777;
		color: #111;
	}

	.selected .note {
		background-color: red;
		color: #eee;
	}

	.note.active {
		background-color: #ccc;
		color: #111;
	}

	.selected .note.active {
		background-color: #eee;
	}
</style>
