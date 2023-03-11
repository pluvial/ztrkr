const blocks = [
	['q', 'w', 'e', 'r'],
	['u', 'i', 'o', 'p'],
	['a', 's', 'd', 'f'],
	['j', 'k', 'l', ';'],
	// ['g', 'h', 'j', 'k'],
	// ['z', 'x', 'c', 'v'],
	// ['b', 'n', 'm', ','],
	// ['m', ',', '.', '/'],
];

const rows = [
	[...blocks[0], ...blocks[1]],
	[...blocks[2], ...blocks[3]],
];

export const keys = [...rows[0], ...rows[1]];

const keysEntries: [string, number][] = keys.map((key, step) => [key, step]);

const keysMap: Record<string, number | undefined> = Object.fromEntries(
	keysEntries
		.concat(keysEntries.map(([key, step]) => [key.toUpperCase(), step]))
		.concat([[':', 15]]),
);

export const keyToStep = (key: string) => keysMap[key];

const stepsKeysMap: Record<number, string> = Object.fromEntries(
	keys.map((key, step) => [step, key]),
);

export const stepToKey = (step: number) => stepsKeysMap[step];

export const codes = keys.map(key => (key === ';' ? 'Semicolon' : `Key${key.toUpperCase()}`));

const codesEntries: [string, number][] = codes.map((code, step) => [code, step]);

const codesMap: Record<string, number | undefined> = Object.fromEntries(
	codesEntries
		.concat(codesEntries.map(([code, step]) => [code.toUpperCase(), step]))
		.concat([[':', 15]]),
);

export const codeToStep = (code: string) => codesMap[code];

const stepsCodesMap: Record<number, string> = Object.fromEntries(
	codes.map((code, step) => [step, code]),
);

export const stepToCode = (step: number) => stepsCodesMap[step];

export const extraKeys = {
	rec: 'z',
	play: 'x',
	stop: 'c',
	func: 'Shift',
	trk: 'Tab',
	ptn: '`/~',
	bank: 'Esc',
	'page+': ']',
	'page-': '[',
};
