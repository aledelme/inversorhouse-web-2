import type { Route } from "next";

/** Main navigation. Labels are keys of the "nav" namespace in messages/*.json. */
export const mainNav = [
  { href: "/oportunidades", label: "opportunities" },
  { href: "/#como-funciona", label: "howItWorks" },
  { href: "/#promotores", label: "forPromoters" },
] as const satisfies readonly { href: Route; label: string }[];

// Typed routes model optional catch-alls ([[...sign-in]]) as "/sign-in/…" only,
// so the bare paths are cast. They are valid Clerk routes.
const signIn = "/sign-in" as Route;
const signUp = "/sign-up" as Route;

export const routes = {
  home: "/",
  search: "/oportunidades",
  publish: "/panel/oportunidades/nueva",
  panel: "/panel",
  admin: "/admin",
  signIn,
  signUp,
} as const satisfies Record<string, Route>;
