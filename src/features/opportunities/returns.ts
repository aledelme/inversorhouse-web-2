/**
 * Business rule #5: annual return defaults to the simple (non-compounded)
 * annualisation of the total return: nominal × 12 / termMonths.
 */
export function annualFromNominal(nominal: number, termMonths: number): number {
  if (!Number.isFinite(nominal) || !Number.isFinite(termMonths) || termMonths <= 0) return 0;
  return Math.round(((nominal * 12) / termMonths) * 100) / 100;
}
