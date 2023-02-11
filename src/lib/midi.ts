const channels = 16;

export function sendMessage(
	output: WebMidi.MIDIOutput,
	message: number[] | Uint8Array,
	timestamp?: number,
) {
	console.debug({ message, timestamp });
	if (timestamp) {
		output.send(message, timestamp);
	} else {
		output.send(message);
	}
}

export function note(
	output: WebMidi.MIDIOutput,
	channel = 0,
	note = 60, // middle C
	velocity = 0x7f, // full velocity
	length = 120, // ms
	timestamp = performance.now(),
) {
	noteOn(output, channel, note, velocity, timestamp);
	noteOff(output, channel, note, velocity, timestamp + length);
}

export function noteOn(
	output: WebMidi.MIDIOutput,
	channel = 0,
	note = 60, // middle C
	velocity = 0x7f, // full velocity
	timestamp?: number,
) {
	const status = 0x90 + channel; // note on
	const message = [status, note, velocity];
	sendMessage(output, message, timestamp);
}

export function noteOff(
	output: WebMidi.MIDIOutput,
	channel = 0,
	note = 60, // middle C
	velocity = 0x40, // mid velocity
	// velocity = 0x7f, // full velocity
	timestamp?: number,
) {
	const status = 0x80 + channel; // note off
	const message = [status, note, velocity];
	sendMessage(output, message, timestamp);
}

export function allNotesOff(output: WebMidi.MIDIOutput, channel = 0, timestamp?: number) {
	const cc = 0xb0 + channel;
	const message = [cc, 123, 0];
	sendMessage(output, message, timestamp);
}

export function allChannelsAllNotesOff(output: WebMidi.MIDIOutput, timestamp?: number) {
	for (let channel = 0; channel < channels; ++channel) {
		allNotesOff(output, channel, timestamp);
	}
}
