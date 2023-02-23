import { browser } from '$app/environment';
import { defaultDisk, type Disk } from './state';

export const key = 'ztrkr';

export const reviver = (key: string, value: any) => (key === 'mutes' ? new Set(value) : value);

export function get(): Disk | null {
	if (!browser) return null;
	const value = localStorage.getItem(key);
	if (!value) return null;
	console.debug('storage.get()');
	return JSON.parse(value, reviver);
}

export const replacer = (key: string, value: any) => (key === 'mutes' ? [...value] : value);

export function set(disk: Disk) {
	if (!browser) return;
	console.debug('storage.set()');
	localStorage.setItem(key, JSON.stringify(disk, replacer));
}

export function clear() {
	if (!browser) return;
	console.debug('storage.clear()');
	localStorage.removeItem(key);
	// localStorage.setItem(key, JSON.stringify(defaultDisk(), replacer));
}
