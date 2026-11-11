// Progress along a candidate's module path: the Next step (1-based) out of all steps,
// where the last step is the final test. Display only.
export function pathStep(sectionsDone: boolean[]) {
  const next = sectionsDone.findIndex((d) => !d);
  const total = sectionsDone.length + 1;
  return { step: next === -1 ? total : next + 1, total, done: sectionsDone.filter(Boolean).length };
}
