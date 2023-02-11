<script lang="ts">
	import type { Track } from '$lib/state';
	import { scaleToString, type N16, type T16, type Tuple16 } from '$lib/utils';

	export let selectedTrack: N16;
	export let lengths: number[];
	export let scales: number[];
	export let patternSteps: T16;
	export let tracks: Tuple16<Track>;

	$: tracksSteps = tracks.map((track, t) =>
		Array.from({ length: lengths[t] }, (_, s) => track.steps[s]),
	);
</script>

<ol class="flex">
	{#each tracks as track, t}
		<li class="track" class:selected={selectedTrack == t}>
			<p>{scaleToString(scales[t])}</p>
			<p>{lengths[t]}</p>
			<ol class="column">
				{#each tracksSteps[t] as trig, s}
					<li
						class="row"
						class:active={patternSteps[t] == s}
						class:note={trig?.type === 'note'}
						class:lock={trig?.type === 'lock'}
					>
						{s.toString(16)} - {trig ? '*' : '-'}
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
		height: 100%;
		border-radius: 3px;
	}

	.track.selected {
		background-color: #333;
		color: #eee;
		font-weight: bold;
	}

	.track > p {
		padding: 0.1em 0.3em;
	}

	.column {
		border-color: #999;
		border-width: 2px 1px;
		border-radius: 3px;
	}

	.selected > .column {
		border-color: red;
	}

	.row {
		white-space: nowrap;
		padding: 0.1em 0.3em;
	}

	.row.active {
		background-color: #333;
	}

	.selected .row.active {
		background-color: #777;
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
