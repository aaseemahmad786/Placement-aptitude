import { db } from "@/db";
import { topicProgress } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import type { TopicStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = (await request.json()) as { topicId?: number; status?: TopicStatus };
    const topicId = Math.round(Number(body.topicId));
    const valid: TopicStatus[] = ["not-started", "learning", "confident"];
    const status = valid.includes(body.status as TopicStatus) ? (body.status as TopicStatus) : "not-started";
    if (!Number.isFinite(topicId) || topicId < 1) {
      return Response.json({ error: "Invalid topic" }, { status: 400 });
    }
    const confidence = status === "confident" ? 2 : status === "learning" ? 1 : 0;

    await db
      .insert(topicProgress)
      .values({ topicId, status, confidence, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: topicProgress.topicId,
        set: { status, confidence, updatedAt: new Date() },
      });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to save topic progress", error);
    return Response.json({ error: "Unable to save topic status" }, { status: 500 });
  }
}
