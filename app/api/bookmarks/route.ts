import { db } from "@/db";
import { questionBookmarks, questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = (await request.json()) as { questionId?: number; saved?: boolean };
    const questionId = Number(body.questionId);
    if (!Number.isSafeInteger(questionId) || questionId < 1 || typeof body.saved !== "boolean") {
      return Response.json({ error: "Invalid bookmark" }, { status: 400 });
    }
    const [question] = await db.select({ id: questions.id }).from(questions).where(eq(questions.id, questionId)).limit(1);
    if (!question) return Response.json({ error: "Question not found" }, { status: 404 });
    if (body.saved) {
      await db.insert(questionBookmarks).values({ questionId }).onConflictDoNothing();
    } else {
      await db.delete(questionBookmarks).where(eq(questionBookmarks.questionId, questionId));
    }
    return Response.json({ ok: true, saved: body.saved });
  } catch (error) {
    console.error("Bookmark update failed", error);
    return Response.json({ error: "Unable to save bookmark" }, { status: 500 });
  }
}
