/** Spanish collation ("Ávila" sorts with "A"). The DB collation may be "C". */
const collator = new Intl.Collator("es", { sensitivity: "base" });

export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => collator.compare(a.name, b.name));
}
