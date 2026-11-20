import { db } from "@/db";
import { profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = (await request.json()) as {
      startDate?: string;
      examDate?: string | null;
      dailyGoalMinutes?: number;
    };
    const startDate = datePattern.test(String(body.startDate)) ? String(body.startDate) : undefined;
    const examDate = datePattern.test(String(body.examDate)) ? String(body.examDate) : null;
    const dailyGoalMinutes = Math.max(30, Math.min(240, Math.round(Number(body.dailyGoalMinutes) || 90)));

    await db
      .update(profile)
      .set({
        ...(startDate ? { startDate } : {}),
        examDate,
        dailyGoalMinutes,
      })
      .where(eq(profile.id, 1));

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to save profile", error);
    return Response.json({ error: "Unable to save plan settings" }, { status: 500 });
  }
}
