/** "Málaga", "Málaga" → "Málaga"; "Marbella", "Málaga" → "Marbella, Málaga". */
export function formatPlace(municipality: string, province: string) {
  const same = municipality.localeCompare(province, "es", { sensitivity: "base" }) === 0;
  return same ? municipality : `${municipality}, ${province}`;
}
