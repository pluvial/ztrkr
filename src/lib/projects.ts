// 6.2.1 PROJECT
// A project contains 128 patterns. General settings and states are also stored in the project. When a
// project is loaded it becomes the active working state of the Syntakt. From here it is possible to edit the
// patterns and sounds of the project. Every time the Syntakt is switched on, it boots to the active working
// state, the active project. Projects are saved, loaded and managed in the SETTINGS menu. For more
// information, please see “9.1 SEQUENCER TEMPO” on page 35.

export interface Project {
	// TODO
}

export const projects: Project[] = Array.from({ length: 16 }, () => ({}));
