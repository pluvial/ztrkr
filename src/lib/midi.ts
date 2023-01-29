export function sendMidiMessage(
	output: WebMidi.MIDIOutput,
	message: number[] | Uint8Array,
	timestamp?: number,
) {
	console.log({ message, timestamp });
	if (timestamp) {
		output.send(message, timestamp);
	} else {
		output.send(message);
	}
}

export function sendNoteOnMessage(output: WebMidi.MIDIOutput, timestamp?: number) {
	const channel = 0;
	const noteOn = 0x90 + channel;
	const note = 60; // middle C
	const velocity = 0x7f; // full velocity
	const message = [noteOn, note, velocity];
	sendMidiMessage(output, message, timestamp);
}

export function sendNoteOffMessage(output: WebMidi.MIDIOutput, timestamp?: number) {
	const channel = 0;
	const noteOff = 0x80 + channel;
	const note = 60; // middle C
	const velocity = 0x7f; // full velocity
	const message = [noteOff, note, velocity];
	sendMidiMessage(output, message, timestamp);
}

export function sendAllNotesOffMessage(output: WebMidi.MIDIOutput, timestamp?: number) {
	const channel = 0;
	const cc = 0xb0 + channel;
	const message = [cc, 123, 0];
	sendMidiMessage(output, message, timestamp);
}
