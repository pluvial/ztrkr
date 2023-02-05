// 9.11 SONG MODE
// A song is an arrangement of patterns set up to play in sequence. Each row in the SONG mode arrangement
// can have separate settings for pattern, row repeat, row length, tempo, and mute. A song can be up to 99
// rows in length, and each project can contain up to 16 songs.

export interface Song {
	// TODO
}

export const songs: Song[] = Array.from({ length: 16 }, () => ({}));
