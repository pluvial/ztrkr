export type N16 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type M16<T> = Map<N16, T>;
export type S16 = Set<N16>;

export type Tuple16<T> = [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T];
export type T16 = Tuple16<number>;

export const array16 = Array.from.bind(null, { length: 16 });
export const array16V = (value: number) => array16(() => value) as T16;
export const seq16 = () => array16((_, index) => index) as Tuple16<N16>;
export const zero16 = () => array16V(0);

export const t16 = seq16();

export function scaleToString(scale: number) {
	const mul = scale >= 1;
	return `${mul ? 'x' : '/'}${mul ? scale : 1 / scale}`;
}

export const probabilityToString = (probability: number) =>
	probability === 1 ? 1 : `1/${Math.round(100 / probability) / 100}`;
