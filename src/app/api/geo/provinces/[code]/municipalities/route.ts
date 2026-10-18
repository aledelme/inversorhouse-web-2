import { getMunicipalities } from "@/features/geo/server";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/geo/provinces/[code]/municipalities">,
) {
  const { code } = await ctx.params;
  if (!/^\d{2}$/.test(code)) return Response.json({ error: "invalid province" }, { status: 400 });
  const municipalities = await getMunicipalities(code);
  return Response.json(municipalities, {
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" },
  });
}
