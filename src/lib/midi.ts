const channels = 16;

export let midi: WebMidi.MIDIAccess;
export let inputs: WebMidi.MIDIInput[] = [];
export let outputs: WebMidi.MIDIOutput[] = [];

export async function setup() {
	try {
		midi = await navigator.requestMIDIAccess();
	} catch {
		console.warn('No MIDI access');
		return;
	}

	inputs = [...midi.inputs.values()];
	outputs = [...midi.outputs.values()];

	if (inputs.length === 0) {
		console.warn('No MIDI inputs available');
	}
	if (outputs.length === 0) {
		console.warn('No MIDI outputs available');
	}

	function midimessage(event: WebMidi.MIDIMessageEvent) {
		let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
		for (const character of event.data) {
			str += `0x${character.toString(16)} `;
		}
		console.debug(str);
	}

	for (const input of inputs) {
		input.onmidimessage = midimessage;

		// debug logging
		console.debug(
			`Input port [type:'${input.type}']` +
				` id:'${input.id}'` +
				` manufacturer:'${input.manufacturer}'` +
				` name:'${input.name}'` +
				` version:'${input.version}'`,
		);
	}

	for (const output of outputs) {
		// debug logging
		console.debug(
			`Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
		);
	}
}

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
