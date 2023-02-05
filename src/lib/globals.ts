import { writable } from 'svelte/store';

// TODO: per-pattern tempo
export const tempo = writable(120); // bpm

// TODO: per-pattern mutes
export const mutes = writable(new Set<number>());
