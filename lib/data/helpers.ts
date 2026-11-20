import type { Difficulty, QuizSeed, TopicDefinition } from "@/lib/types";

export function t(
  title: string,
  minutes: number,
  difficulty: Difficulty,
  keyIdea: string,
): TopicDefinition {
  const drillMinutes = Math.max(10, Math.round(minutes * 0.45));
  return {
    title,
    minutes,
    difficulty,
    keyIdea,
    routine: [
      `Learn the rule: ${keyIdea}`,
      "Work through 5 guided examples, writing every step",
      `Run a ${drillMinutes}-minute timed drill and aim for 80% accuracy`,
      "Log mistakes, rewrite the shortcut, and recall it after 10 minutes",
    ],
  };
}

export function q(
  prompt: string,
  options: [string, string, string, string],
  correct: number,
  explanation: string,
): QuizSeed {
  return { prompt, options, correct, explanation };
}
