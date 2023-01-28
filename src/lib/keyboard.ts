export const blocks = [
	['q', 'w', 'e', 'r'],
	['u', 'i', 'o', 'p'],
	['a', 's', 'd', 'f'],
	['j', 'k', 'l', ';'],
	// ['g', 'h', 'j', 'k'],
	// ['z', 'x', 'c', 'v'],
	// ['b', 'n', 'm', ','],
	// ['m', ',', '.', '/'],
];

export const row1 = [...blocks[0], ...blocks[1]];
export const row2 = [...blocks[2], ...blocks[3]];
export const rows = [row1, row2];

export const keys = [...row1, ...row2];

const keysMap = Object.fromEntries(keys.map((key, index) => [key, index]));

export const keyToStep = (key: string) => keysMap[key];
