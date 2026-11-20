import { createQuiz } from "@/lib/quiz";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { scope?: string; chapterSlug?: string; section?: string };
    const quiz = await createQuiz(body);
    return Response.json(quiz, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to start quiz", error);
    return Response.json({ error: error instanceof Error ? error.message : "Unable to start the test" }, { status: 500 });
  }
}
