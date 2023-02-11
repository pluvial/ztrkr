import { tick } from 'svelte';
import { derived, writable } from 'svelte/store';
import * as state from './state';
import type { N16 } from './utils';

export const disk = writable(state.disk);
export const projects = writable(state.projects);
export const patterns = writable(state.patterns);
export const tracks = writable(state.tracks);
// export const projects = derived(disk, $disk => $disk.projects);
// export const patterns = derived(project, $project => $project.patterns);
// export const tracks = derived(pattern, $pattern => $pattern.tracks);

export const projectIndex = writable(0);
export const patternIndex = writable(0);
// export const patternIndex = writable<N16>(0);
export const trackIndex = writable<N16>(0);

export const project = derived(
	[projects, projectIndex],
	([$projects, $projectIndex]) => $projects[$projectIndex],
);
export const pattern = derived(
	[patterns, patternIndex],
	([$patterns, $patternIndex]) => $patterns[$patternIndex],
);
export const track = derived(
	[tracks, trackIndex],
	([$tracks, $trackIndex]) => $tracks[$trackIndex],
);

disk.subscribe($disk => {
	projects.set($disk.projects);
	projectIndex.set(0);
});
project.subscribe($project => {
	patterns.set($project.patterns);
	patternIndex.set(0);
});
pattern.subscribe($pattern => tracks.set($pattern.tracks));

export const newProject = () =>
	projects.update($projects => {
		const updatedProjects = [...$projects, state.defaultProject()];
		tick().then(() => projectIndex.set(updatedProjects.length - 1));
		// projectIndex.set(updatedProjects.length - 1);
		return updatedProjects;
	});

export const newPattern = () =>
	patterns.update($patterns => {
		const updatedPatterns = [...$patterns, state.defaultPattern()];
		tick().then(() => patternIndex.set(updatedPatterns.length - 1));
		// patternIndex.set(updatedPatterns.length - 1);
		return updatedPatterns;
	});
