import { db } from "@/db";
import { dailyProgress } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = (await request.json()) as {
      dayNumber?: number;
      completed?: boolean;
      minutes?: number;
      note?: string;
    };
    const dayNumber = Math.round(Number(body.dayNumber));
    if (!Number.isFinite(dayNumber) || dayNumber < 1 || dayNumber > 60) {
      return Response.json({ error: "Invalid day number" }, { status: 400 });
    }
    const values = {
      dayNumber,
      completed: Boolean(body.completed),
      minutes: Math.max(0, Math.min(600, Math.round(Number(body.minutes) || 0))),
      note: String(body.note ?? "").slice(0, 500),
      updatedAt: new Date(),
    };

    await db
      .insert(dailyProgress)
      .values(values)
      .onConflictDoUpdate({
        target: dailyProgress.dayNumber,
        set: {
          completed: values.completed,
          minutes: values.minutes,
          note: values.note,
          updatedAt: values.updatedAt,
        },
      });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to save day progress", error);
    return Response.json({ error: "Unable to save day progress" }, { status: 500 });
  }
}
