/* global setTimeout */
// A function to strongly-type an inlined data structure.
//    See more at https://stackoverflow.com/a/54837072/678505
export const strictType = <T>(x: T) => x;

export function pause(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
