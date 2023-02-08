import { array16, type S16, type Tuple16 } from './utils';

export interface Global {
	// display state
	// play state
	// keyboard mode state
}

export interface Disk {
	projects: Project[];
}

export interface Project {
	name?: string; // if undefined, fallback to 'Undefined' or generate from project number
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

	noteNumber: number;
	velocity: number;
	noteLength: number;
	probability: number;

	channel: number;

	steps: (Trig | undefined)[];
}

export interface Trig {
	type: 'lock' | 'note';
	noteNumber?: number; // only for note trigs
	velocity?: number; // only for note trigs
	noteLength?: number;
	probability?: number;

	channel?: number;
	// TODO: flesh out
}

export const defaultSteps = () => new Array<Trig | undefined>(16);

export const defaultTracks = () =>
	array16(
		(_, index) =>
			({
				length: 16,
				scale: 1,
				channel: index,
				noteNumber: 60,
				noteLength: 500,
				velocity: 64,
				probability: 1,
				steps: defaultSteps(),
			} as Track),
	) as Tuple16<Track>;

export const defaultPattern = (): Pattern => ({
	tempoMode: 'per-pattern',
	tempo: 120,
	swing: 50,
	scaleMode: 'per-pattern',
	length: 16,
	scale: 1,

	mutes: new Set(),
	tracks: defaultTracks(),
});

export const defaultProject = (): Project => ({
	tempo: 120,
	mutes: new Set(),
	patterns: [defaultPattern()],
	songs: [],
});

// TODO: load from localStorage or async from IndexedDB or FS API
export const disk: Disk = { projects: [defaultProject()] };

export const { projects } = disk;
export const { patterns } = projects[0];
export const { tracks } = patterns[0];