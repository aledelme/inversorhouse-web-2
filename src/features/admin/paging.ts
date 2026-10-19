/** Rows per page in the admin lists. */
export const ADMIN_PAGE_SIZE = 50;

/** `?pagina=` → page number ≥ 1 (anything invalid means the first page). */
export function parsePage(value: unknown): number {
  const page = typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(page) && page > 1 ? page : 1;
}

export function pageInfo(page: number, total: number) {
  return {
    page,
    pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    offset: (page - 1) * ADMIN_PAGE_SIZE,
  };
}
