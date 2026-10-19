import {
  getDocument,
  getOpportunityOwnerId,
  isOpportunityVisible,
} from "@/features/opportunities/server";
import { routes } from "@/config/navigation";
import { getViewer, isAdmin } from "@/lib/auth";
import { presignDownload } from "@/lib/storage";

/**
 * Document download (ADR-0005): signed-in users only. Documents of hidden
 * opportunities are only available to their owner and admins.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/documents/[id]">) {
  const { id } = await ctx.params;
  const viewer = await getViewer();
  if (!viewer) {
    return Response.redirect(
      new URL(
        `${routes.signIn}?redirect_url=${encodeURIComponent(new URL(request.url).pathname)}`,
        request.url,
      ),
      302,
    );
  }
  if (viewer.isBanned || !/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 404 });

  const document = await getDocument(id);
  if (!document) return new Response(null, { status: 404 });

  if (!(await isOpportunityVisible(document.opportunityId))) {
    const ownerId = await getOpportunityOwnerId(document.opportunityId);
    if (ownerId !== viewer.userId && !(await isAdmin())) return new Response(null, { status: 404 });
  }

  const url = await presignDownload({ key: document.storageKey, fileName: document.fileName });
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "private, no-store" },
  });
}
