// 6.2.2 PATTERNS
// The patterns are the primary data container for the Syntakt. Sixteen patterns are available for each of
// the eight banks, which means that 128 patterns are available for each project. A pattern contains of up
// to twelve sounds (one for each audio track), sequencer data like trigs and parameter locks together with
// the settings on the TRIG page and BPM, length, swing, and time signature settings. The pattern also
// contains all the parameter settings for any MIDI tracks. For more information, please see “8. PATTERNS
// AND SOUNDS” on page 28.

// A Pattern contains:
// • Up to twelve audio track sounds.
// • LEVEL settings for the audio tracks.
// • All parameter settings for the MIDI tracks.
// • Sequencer data such as trigs and parameter locks.
// • The settings on the TRIG PARAMETERS page, BPM, length, swing and time signature settings.

// 9. THE SEQUENCER
// The sequencer of the Syntakt stores information in patterns. A pattern controls the playback of the audio/
// MIDI tracks, the FX track, and various pattern-specific aspects of the tracks. Each of the eight banks, A
// to H, contains 16 patterns, which means 128 patterns are available for each project. For more information,
// please see “14.3 PATTERN” on page 71

// A pattern contains:
// • General trig settings on the TRIG page (default note pitch, velocity et cetera).
// • The parameter settings on the SYN, FLTR, AMP, and LFO pages.
// • The settings on the DELAY, REVERB, and MIXER pages.
// • The parameter settings on the FX track.
// • Quantization settings.
// • Note trigs and Lock trigs for all tracks.
// • Parameter/sound locks.
// • Length and time signature for the tracks.

export interface Pattern {
	// TODO
	// kit data
	// sequence data
}

export const patterns: Pattern[] = Array.from({ length: 16 }, () => ({}));
