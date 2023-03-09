import type { Tuple16 } from './utils';

export enum MachineType {
	sine,
	triangle,
	square,
	sawtooth,
	noise,
	kick,
	snare,
}

type MachineOscillatorType =
	| MachineType.sine
	| MachineType.triangle
	| MachineType.square
	| MachineType.sawtooth;

const oscillatorTypes: Record<MachineOscillatorType, OscillatorType> = {
	[MachineType.sine]: 'sine',
	[MachineType.triangle]: 'triangle',
	[MachineType.square]: 'square',
	[MachineType.sawtooth]: 'sawtooth',
};

export interface Machine {
	type: MachineType;
	oscillators: OscillatorNode[];
	bufferSources: AudioBufferSourceNode[];
	filters: BiquadFilterNode[];
	gains: GainNode[];
	analysers?: AnalyserNode[];
	output: GainNode;
}

export const defaultMachineTypes: Tuple16<MachineType> = [
	MachineType.sine,
	MachineType.square,
	MachineType.sawtooth,
	MachineType.triangle,
	MachineType.noise,
	MachineType.kick,
	MachineType.snare,
	MachineType.sine,
	MachineType.sine,
	MachineType.sine,
	MachineType.sine,
	MachineType.sine,
	MachineType.sine,
	MachineType.sine,
	MachineType.sine,
	MachineType.sine,
];

export const defaultMachines = (ctx: AudioContext) =>
	defaultMachineTypes.map(type => defaultMachine(ctx, type)) as Tuple16<Machine>;

export function defaultMachine(ctx: AudioContext, type = MachineType.sine): Machine {
	const oscillators = [new OscillatorNode(ctx, { frequency: 440 })];
	const bufferSources: AudioBufferSourceNode[] = [];
	const filters = [new BiquadFilterNode(ctx, { frequency: 2000 })];
	const gains = [new GainNode(ctx, { gain: 0 })];
	const output = new GainNode(ctx, { gain: 1 });
	if (type in oscillatorTypes) {
		oscillators[0].type = oscillatorTypes[type as MachineOscillatorType];
	}
	if (type === MachineType.noise) {
		const noise = defaultNoise(ctx);
		bufferSources.push(noise);
		noise.connect(filters[0]).connect(gains[0]).connect(output);
	} else if (type === MachineType.snare) {
		const noise = defaultNoise(ctx);
		bufferSources.push(noise);
		filters[0].type = 'highpass';
		filters[0].frequency.value = 1000;
		noise.connect(filters[0]).connect(gains[0]);
		gains.push(new GainNode(ctx, { gain: 0 }));
		oscillators[0].type = 'triangle';
		oscillators[0].connect(gains[1]);
		gains[0].connect(output);
		gains[1].connect(output);
	} else {
		oscillators[0].connect(filters[0]).connect(gains[0]);
		gains[0].connect(output);
	}
	return { type, oscillators, bufferSources, filters, gains, output };
}

export function defaultNoise(ctx: AudioContext, duration = 1) {
	const bufferSize = ctx.sampleRate * duration;
	const buffer = new AudioBuffer({
		length: bufferSize,
		sampleRate: ctx.sampleRate,
	});
	const data = buffer.getChannelData(0);
	for (let i = 0; i < bufferSize; ++i) {
		data[i] = Math.random() * 2 - 1;
	}
	const noise = new AudioBufferSourceNode(ctx, { buffer, loop: true });
	return noise;
}

export function note(
	ctx: AudioContext,
	machine: Machine,
	noteNumber = 60, // middle C
	velocity = 0x7f, // full velocity
	duration = 120, // ms
	timestamp = performance.now(),
) {
	const when = ctx.currentTime + (timestamp - performance.now()) / 1e3;

	// TODO: revisit, using equal temperament for now
	const frequency = 440 * 2 ** ((noteNumber - 69) / 12);

	const envMax = velocity / 127;
	const envMin = 0.001 * envMax;
	const envDuration = (5 * duration) / 1e3;

	if (machine.type in oscillatorTypes) {
		const oscillator = machine.oscillators[0];
		oscillator.frequency.setValueAtTime(frequency, when);
		const filter = machine.filters[0];
		filter.Q.cancelScheduledValues(when);
		filter.Q.setValueAtTime(20, when);
		filter.frequency.cancelScheduledValues(when);
		filter.frequency.setValueAtTime(2000, when);
		filter.frequency.exponentialRampToValueAtTime(100, when + 0.5);
	} else if (machine.type === MachineType.noise) {
		const filter = machine.filters[0];
		filter.frequency.cancelScheduledValues(when);
		filter.frequency.setValueAtTime(2000 + frequency, when);
		filter.frequency.exponentialRampToValueAtTime(100, when + 0.5);
	} else if (machine.type === MachineType.kick) {
		const oscillator = machine.oscillators[0];
		oscillator.frequency.setValueAtTime(150, when);
		oscillator.frequency.exponentialRampToValueAtTime(0.001, when + 0.5);
	} else if (machine.type === MachineType.snare) {
		const oscGain = machine.gains[1].gain;
		oscGain.cancelScheduledValues(when);
		oscGain.setValueAtTime(0.7 * envMax, when);
		oscGain.exponentialRampToValueAtTime(envMin, when + envDuration / 2);
	}

	const gain = machine.gains[0].gain;
	gain.cancelScheduledValues(when);
	gain.setValueAtTime(envMax, when);
	gain.exponentialRampToValueAtTime(envMin, when + envDuration);
}
