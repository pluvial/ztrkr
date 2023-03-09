import type { Tuple16 } from './utils';

export enum MachineType {
	sine,
	square,
	saw,
	noise,
	kick,
	snare,
}

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
	MachineType.saw,
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
	MachineType.sine,
];

export const defaultMachines = (ctx: AudioContext) =>
	defaultMachineTypes.map(type => defaultMachine(ctx, type)) as Tuple16<Machine>;

export function defaultMachine(ctx: AudioContext, type = MachineType.sine): Machine {
	const oscillators = [new OscillatorNode(ctx, { frequency: 440 })];
	const filters = [new BiquadFilterNode(ctx, { frequency: 2000 })];
	const gains = [new GainNode(ctx, { gain: 0 })];
	if (type === MachineType.snare) {
		// TODO
	} else {
		oscillators[0].connect(filters[0]).connect(gains[0]);
	}
	const output = new GainNode(ctx, { gain: 1 });
	gains[0].connect(output);
	return { type, oscillators, filters, gains, output };
}

export interface NoteEvent {
	noteNumber: number;
	velocity: number;
	noteLength: number;
	timestamp: number;
}

export function note(
	ctx: AudioContext,
	machine: Machine,
	noteNumber = 60, // middle C
	velocity = 0x7f, // full velocity
	length = 120, // ms
	timestamp = performance.now(),
) {
	const when = ctx.currentTime + (timestamp - performance.now()) / 1e3;

	// TODO: revisit, using equal temperament for now
	const frequency = 440 * 2 ** ((noteNumber - 69) / 12);

	if (machine.type === MachineType.sine) {
		const oscillator = machine.oscillators[0];
		oscillator.frequency.setValueAtTime(frequency, when);
	} else if (machine.type === MachineType.square) {
		const oscillator = machine.oscillators[0];
		oscillator.frequency.setValueAtTime(frequency, when);
	} else if (machine.type === MachineType.saw) {
		const oscillator = machine.oscillators[0];
		oscillator.frequency.setValueAtTime(frequency, when);
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
	const envLength = (10 * length) / 1000;

	const gain = machine.gains[0].gain;
	gain.cancelScheduledValues(when);
	gain.setValueAtTime(envMax, when);
	gain.exponentialRampToValueAtTime(envMin, when + envLength);
}
