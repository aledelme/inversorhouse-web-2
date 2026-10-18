import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { OPPORTUNITY_TYPES, type OpportunityFilters } from "@/features/opportunities";

/**
 * URL contract of /oportunidades (Spanish keys, shareable links).
 * Shared by the server loader and the client filters (useQueryStates).
 *   ?tipo=CRV,NPL&ccaa=13&provincia=28&municipio=28079&ticket=25000&pagina=2
 */
export const searchParsers = {
  tipo: parseAsArrayOf(parseAsStringLiteral(OPPORTUNITY_TYPES)).withDefault([]),
  ccaa: parseAsString,
  provincia: parseAsString,
  municipio: parseAsString,
  ticket: parseAsInteger,
  pagina: parseAsInteger.withDefault(1),
};

export const loadSearchParams = createLoader(searchParsers);
export const serializeSearch = createSerializer(searchParsers);

export type SearchState = Awaited<ReturnType<typeof loadSearchParams>>;

const code = (value: string | null, digits: number) =>
  value && new RegExp(`^\\d{${digits}}$`).test(value) ? value : undefined;

/** URL state → query filters (drops malformed values instead of failing). */
export function toFilters(state: SearchState): OpportunityFilters {
  return {
    types: state.tipo.length ? state.tipo : undefined,
    community: code(state.ccaa, 2),
    province: code(state.provincia, 2),
    municipality: code(state.municipio, 5),
    maxTicket: state.ticket && state.ticket > 0 ? state.ticket : undefined,
    page: Math.max(1, state.pagina),
  };
}

export function countActiveFilters(state: SearchState) {
  return (
    (state.tipo.length ? 1 : 0) +
    (state.ccaa || state.provincia || state.municipio ? 1 : 0) +
    (state.ticket ? 1 : 0)
  );
}
