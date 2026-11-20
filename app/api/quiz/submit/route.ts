import { submitQuiz } from "@/lib/quiz";
import type { QuizSubmission } from "@/lib/quiz";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuizSubmission;
    const result = await submitQuiz(body);
    return Response.json(result);
  } catch (error) {
    console.error("Failed to submit quiz", error);
    return Response.json({ error: "Unable to grade the test" }, { status: 500 });
  }
}
