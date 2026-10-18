/** Cache tags (ADR-0007). Every mutation must update the ones it affects. */
export const OPPORTUNITIES_TAG = "opportunities";
export const opportunityTag = (id: string) => `opportunity:${id}`;
