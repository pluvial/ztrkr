import { writable } from 'svelte/store';

export type N16 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type M16<T> = Map<N16, T>;
export type S16 = Set<N16>;

export type Tuple16<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type T16 = Tuple16<boolean>;
// export type T16 = Tuple16<N16>;

export interface Global {
	// display state
	// play state
	// keyboard mode state
}

export interface Disk {
	projects: Project[];
}

export interface Project {
	tempo: number; // bpm

	mutes: S16;
	patterns: Pattern[];
	songs: Song[];
}

export interface Pattern {
	name?: string; // if undefined, fallback to 'Undefined' or generate from pattern number

	tempoMode: 'global' | 'per-pattern';
	tempo?: number; // bpm, only in per-pattern tempo mode
	swing: number; // percent

	scaleMode: 'per-pattern' | 'per-track';
	length: number; // master length in per-track scale mode, can be set to Infinity
	scale?: number; // only in per-pattern scale mode
	changeLength?: number; // only in per-track scale mode

	mutes: S16;
	tracks: Tuple16<Track>;
}

export interface Song {
	rows: SongRow[];
	end: 'loop' | 'stop';
}

export interface SongRow {
	// TODO: flesh out
	label?: 'verse' | 'chorus' | 'fill'; // if undefined, fallback to pattern name
	pattern: number; // index of pattern in project.patterns array
	repeat?: number; // if undefined, fallback to 1
	length?: number; // if undefined, fallback to pattern length
	mutes?: S16; // if undefined, fallback to pattern mutes
	tempoMode: 'song' | 'per-pattern' | 'per-row';
	tempo?: number; // bpm, only in per-row tempo mode
}

export interface Track {
	length?: number;
	scale?: number;

	channel: number;

	steps: Trig[];
}

export interface Trig {
	duration: number;
}

export const patterns: Pattern[] = [
	{
		tempoMode: 'per-pattern',
		tempo: 120,
		swing: 50,
		scaleMode: 'per-pattern',
		length: 16,
		scale: 1,

		mutes: new Set(),
		// tracks: Array.from({ length: 16 }, (_, index) => ({ channel: index })),
		tracks: [
			{ steps: [], channel: 0 },
			{ steps: [], channel: 1 },
			{ steps: [], channel: 2 },
			{ steps: [], channel: 3 },
			{ steps: [], channel: 4 },
			{ steps: [], channel: 5 },
			{ steps: [], channel: 6 },
			{ steps: [], channel: 7 },
			{ steps: [], channel: 8 },
			{ steps: [], channel: 9 },
			{ steps: [], channel: 10 },
			{ steps: [], channel: 11 },
			{ steps: [], channel: 12 },
			{ steps: [], channel: 13 },
			{ steps: [], channel: 14 },
			{ steps: [], channel: 15 },
		],
	},
];

export const stores = {
	patterns: writable(patterns),
	tracks: writable(patterns[0].tracks),
};
