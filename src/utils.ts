export function range(size:number):ReadonlyArray<number> {
    return Array.from({length: size}, (x, i) => i);
}