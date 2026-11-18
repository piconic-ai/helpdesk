export type Aliases = Record<number, number>
export function canonical(aliases: Aliases, number: number) {
  const seen = new Set<number>()
  while (aliases[number] !== undefined) {
    if (seen.has(number)) throw new Error('Cyclic conversation alias')
    seen.add(number)
    number = aliases[number]
  }
  return number
}
