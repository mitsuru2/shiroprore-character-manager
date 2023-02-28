export function makeNumberArray(max: number): number[] {
  const ret = [];
  for (let i = 0; i < max; ++i) {
    ret.push(i);
  }
  return ret;
}
