import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk session handling + a first filter for private areas: signed-out users are
 * sent to sign-in. Real authorization happens in every page/action via @/lib/auth
 * (ADR-0006) — this check is only a UX shortcut, never the security boundary.
 */
const PRIVATE_AREA = /^\/(panel|admin)(\/|$)/;

export default clerkMiddleware(async (auth, request) => {
  if (PRIVATE_AREA.test(request.nextUrl.pathname)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
