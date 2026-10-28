export function moveColour(colours: readonly string[], from: number, to: number): string[] {
  if (from < 0 || to < 0 || from >= colours.length || to >= colours.length || from === to) return [...colours];
  const result = [...colours];
  const [colour] = result.splice(from, 1);
  result.splice(to, 0, colour);
  return result;
}
