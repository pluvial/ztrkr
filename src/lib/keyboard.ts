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

const keysMap: Record<string, number | undefined> = Object.fromEntries(
	keys.map((key, index) => [key, index]),
);

export const keyToStep = (key: string) => keysMap[key];

const stepsMap: Record<number, string> = Object.fromEntries(keys.map((key, index) => [index, key]));

export const stepToKey = (step: number) => stepsMap[step];
