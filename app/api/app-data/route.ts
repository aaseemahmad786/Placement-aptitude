import { getAppData } from "@/lib/app-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAppData();
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load app data", error);
    return Response.json({ error: "Unable to load planner data" }, { status: 500 });
  }
}
