// 11. MIDI TRACK PARAMETERS
// 11.2.1 NOT1
// Note 1 sets the root note that should be sent by the MIDI track. (C0–G10)
// 11.2.2 NOT2–NOT4
// Note 2–4 will add more notes, offset from the root note by the selected values, to a note trig. This makes
// it possible for a MIDI track to send out chords that consists of up to 4 notes. If the root note is changed
// the offset notes will transpose accordingly. A value of 0 will remove the offset note.
// 11.2.3 VEL
// Trig Velocity controls the velocity of the notes the MIDI track sends out. A setting of 0 equals a NOTE
// OFF command.
// 11.2.4 LEN
// Trig Length sets the duration of the notes. When a note has finished playing a NOTE OFF command will
// be sent. The INF setting equals infinite note length.
// 11.2.5 PROB
// Trig Probability sets the probability that the trigs on the track plays or not. The probability outcome is
// re-evaluated every time a trig is set to play. The default setting is 100%, meaning that all the trigs on the
// track plays every time.
// This parameter changes temporarily to display and control COND (Trig Condition) when you add a condi-
// tional lock. For more information, please see “9.9.3 TRIG CONDITIONS AND CONDITIONAL LOCKS” on
// page 42.
// 11.2.6 LFO.T
// LFO Trig controls if the LFO will be trigged or not.
// 11.3.1 CHAN
// Channel sets the MIDI channel the track sends MIDI data to. If you set this parameter to OFF, it turns the
// MIDI track off. Please note that this parameter cannot be parameter locked.
// 11.3.2 BANK
// Bank sends a bank change message on CC 0 MSB.
// 11.3.3 SBNK
// Sub Bank sends a bank change message on CC 32 LSB.
// 11.3.4 PROG
// Program Change sends a Program Change message.
// 11.3.5 PB
// Pitch Bend controls the pitch bend data sent on the MIDI track.
// 11.3.6 AT
// Aftertouch controls the aftertouch data sent on the MIDI track.
// 11.3.7 MW
// Mod Wheel controls the modulation wheel data sent on the MIDI track.
// 11.3.8 BC
// Breath controller controls the breath control data sent on the MIDI track
// 11.4.1 VAL1-VAL8
// CC 1–8 Value controls the values that are sent for the CC commands, which are specified on the AMP
// (CC SELECT) page. These parameters default value is OFF. Press [TRIG] + DATA ENTRY knobs to acti-
// vate the parameters and then set a value
// 11.5.1 SEL1-SEL8
// CC 1–8 Select specifies the CC commands that are controlled by the parameters on the AMP PAGE 1
// (CC VALUE) page. The selectable values are the standard MIDI Control Change Messages.
// 11.6.1 SPD
// Speed sets the speed of the LFO. Try settings of 8, 16 or 32 to sync the LFO to straight beats. The pa-
// rameter is bipolar. The LFO cycle can be played backward by using negative values.
// 11.6.2 MULT
// Multiplier multiplies the SPD parameter by the set factor either by multiplying the current tempo (BPM
// settings), or by multiplying a fixed tempo of 120 BPM.
// 11.6.3 FADE
// Fade In/Out makes it possible to fade in/fade out the LFO modulation. The knob is bipolar. Positive val-
// ues give a fade-out, negative values give a fade in. 0 gives no fade in/fade out.
// 11.6.4 DEST
// Destination selects the modulation destination for the LFO. Preview how the LFO modulation will affect
// the sound by highlighting a destination. Press [YES] to confirm the selection. For more information,
// please see “APPENDIX C: LFO MODULATION DESTINATIONS” on page 112
// 11.6.5 WAVE
// Waveform sets the LFO waveform. The Triangle, Sine, Square, Sawtooth, and Random waveforms are
// bipolar. The Exponential and Ramp are unipolar.
// 11.6.6 SPH
// Start Phase sets the point within the wave cycle where the LFO will start when it is trigged. 0 makes the
// LFO start at the beginning of a complete wave cycle, 64 makes it start at the center. A small square at
// the start of the waveform shows that the wave cycle starts at a zero-crossing point.
// 11.6.7 MODE
// Trig Mode sets how the LFO will act when a note is trigged.
// • FREE is the default free-running mode. It makes the LFO run continuously, never restarting or
// stopping even if notes are trigged.
// • TRIG makes the LFO restart when a note is trigged.
// • HOLD makes the LFO run free in the background, but when a note is trigged the LFO output level is
// latched and held still until the next note is trigged.
// • ONE The LFO starts when a note is trigged, then runs to the end of the waveform and then stops.
// This makes the LFO function similar to an envelope.
// • HALF The LFO starts when a note is trigged, then runs to the middle of the waveform and then stops.
// 11.6.8 DEP
// Depth sets the depth and polarity of the LFO modulation. Both negative (inverted) and positive modula-
// tion depth is possible. A setting of 0, equals no modulation depth.

export interface Track {
	// TODO
}

export const tracks: Track[] = Array.from({ length: 16 }, () => ({}));

// 6.2.3 SOUNDS
// A sound is a collection of the audio track settings in the SYN, FLTR, AMP, and LFO PARAMETER pages.
// Sounds can be stored either in the Sound pool of the active project or the +Drive sound library. The
// Sound pool holds up to 128 sounds and the +Drive library holds up to 2048 sounds. You can use the
// SOUND MANAGER to manage sounds. For more information, please see “8.6.3 SOUND MANAGER” on
// page 32, and “8. PATTERNS AND SOUNDS” on page 28.
// When a sound is imported to a pattern, it becomes an independent copy of the sound on
// the +Drive and is not linked to the original sound. Instead, it fully becomes a part of the
// pattern.

// A sound contains:
// • The selected machine and the SYN, FLTR, AMP, and LFO pages settings for the audio track.
