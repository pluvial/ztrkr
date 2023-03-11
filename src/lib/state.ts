import { t16, type N16, type S16, type Tuple16 } from './utils';

export interface Global {
	// play state
	playing: boolean;
	// display state
	// keyboard state
	// keyboard mode state
}

export enum Mode {
	Default,
	GridRec,
	StepRec,
	LiveRec,
}

export enum KeysMode {
	Default,
	Keyboard,
	TrackChange,
	PatternChange,
	BankChange,
	TrackMutes,
	PatternMutes,
}

export interface Disk {
	projects: Project[];
}

export interface Project {
	name?: string; // if undefined, fallback to 'Undefined' or generate from project number
	tempo: number; // bpm

	muteMode: KeysMode.TrackMutes | KeysMode.PatternMutes;
	mutes: S16;
	patterns: Pattern[];
	patternChangeMode: boolean;
	songs: Song[];
}

export const maxFiniteLength = 2 << 11;

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
	type: 'audio' | 'midi';

	length?: number;
	scale?: number;

	noteNumber: number;
	velocity: number;
	duration: number;
	probability: number;

	channel: N16;

	steps: (Trig | undefined)[];
}

export interface Trig {
	type: 'lock' | 'note';
	noteNumber?: number; // only for note trigs
	velocity?: number; // only for note trigs
	duration?: number;
	probability?: number;

	channel?: N16;
	// TODO: flesh out
}

export const defaultSteps = () => new Array<Trig | undefined>(16);

export const defaultTrack = (t: N16): Track => ({
	length: 16,
	scale: 1,
	channel: t,
	noteNumber: 60,
	duration: 125, // 1/16th at 120BPM
	velocity: 64,
	probability: 1,
	type: 'midi',
	steps: defaultSteps(),
});

export const defaultTracks = () => t16.map(defaultTrack) as Tuple16<Track>;

export const defaultPattern = (): Pattern => ({
	tempoMode: 'per-pattern',
	tempo: 120,
	swing: 50,
	scaleMode: 'per-track',
	// scaleMode: 'per-pattern',
	length: 16,
	scale: 1,
	// changeLength: 16,

	mutes: new Set(),
	tracks: defaultTracks(),
});

export const defaultProject = (): Project => ({
	tempo: 120,
	muteMode: KeysMode.TrackMutes,
	mutes: new Set(),
	patterns: [defaultPattern()],
	patternChangeMode: true,
	songs: [],
});

// TODO: load from localStorage or async from IndexedDB or FS API
export const defaultDisk = (): Disk => ({ projects: [defaultProject()] });
