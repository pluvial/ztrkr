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
	const filters = [new BiquadFilterNode(ctx, { frequency: 2000 })];
	const gains = [new GainNode(ctx, { gain: 0 })];
	if (type in oscillatorTypes) {
		oscillators[0].type = oscillatorTypes[type as MachineOscillatorType];
	}
	if (type === MachineType.snare) {
		// TODO
	} else {
		oscillators[0].connect(filters[0]).connect(gains[0]);
	}
	const output = new GainNode(ctx, { gain: 1 });
	gains[0].connect(output);
	return { type, oscillators, filters, gains, output };
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
		// TODO:
	} else if (machine.type === MachineType.kick) {
		const oscillator = machine.oscillators[0];
		oscillator.frequency.setValueAtTime(150, when);
		oscillator.frequency.exponentialRampToValueAtTime(0.001, when + 0.5);
	} else if (machine.type === MachineType.snare) {
		// TODO:
	}

	const envMax = velocity / 127;
	const envMin = 0.001 * envMax;
	const envDuration = (5 * duration) / 1e3;

	const gain = machine.gains[0].gain;
	gain.cancelScheduledValues(when);
	gain.setValueAtTime(envMax, when);
	gain.exponentialRampToValueAtTime(envMin, when + envDuration);
}
