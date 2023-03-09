import type { N16 } from './utils';

export interface NoteEvent {
	t: N16;
	channel?: N16;
	noteNumber: number;
	velocity: number;
	duration: number;
	timestamp: number;
}
