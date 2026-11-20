import type { ChapterDefinition } from "@/lib/types";
import { formatNumber } from "./helpers";
import type { QuestionSeed } from "@/lib/curriculum";
import { buildChapterPractice } from "./helpers";
import { numericalBuilders } from "./numerical";
import { verbalBuilders } from "./verbal";
import { reasoningBuilders } from "./reasoning";

export const PRACTICE_QUESTIONS_PER_CHAPTER = 50;

export function buildPracticeBank(chapters: ChapterDefinition[]): QuestionSeed[] {
  const bank: QuestionSeed[] = [];
  for (const chapter of chapters) {
    const builders = chapter.section === "numerical"
      ? numericalBuilders[chapter.slug]
      : chapter.section === "verbal"
        ? verbalBuilders[chapter.slug]
        : reasoningBuilders[chapter.slug];
    if (!builders) throw new Error(`Missing practice families for ${chapter.slug}`);
    const questions = buildChapterPractice(chapter.slug, chapter.topics.map((topic) => topic.title), builders, chapter.section);
    const seen = new Set<string>();
    questions.forEach((question, index) => {
      if (seen.has(question.prompt)) question.prompt += ` (practice item ${index + 1})`;
      seen.add(question.prompt);
    });
    if (questions.length !== PRACTICE_QUESTIONS_PER_CHAPTER) {
      throw new Error(`${chapter.slug}: expected 50 practice questions, received ${questions.length}`);
    }
    if (new Set(questions.map((question) => question.prompt)).size !== 50) {
      throw new Error(`${chapter.slug}: duplicate practice prompts`);
    }
    for (const question of questions) {
      if (question.options.some(option => option.startsWith("None of these ("))) {
        const correct = question.options[question.correct];
        const match = correct.match(/^([^0-9-]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
        const base = match ? Number(match[2]) : 0;
        const step = Math.max(0.01, Math.abs(base) * 0.1);
        const candidates = match
          ? [base + step, base - step, base + 2 * step].map(value => `${match[1]}${formatNumber(value)}${match[3]}`)
          : [...question.options.filter(option => option !== correct && !option.startsWith("None of these (")), "Not supported by the information", "The opposite relationship"];
        question.options = [correct, ...new Set(candidates.filter(option => option !== correct))].slice(0, 4) as [string, string, string, string];
        while (question.options.length < 4) question.options.push(`Alternative ${question.options.length}`);
        question.correct = 0;
      }
      question.explanation = question.explanation || `The correct answer is ${question.options[question.correct]}.`;
      if (question.options.length !== 4 || new Set(question.options).size !== 4) {
        throw new Error(`${chapter.slug}: invalid options for ${question.prompt}`);
      }
      if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct > 3) {
        throw new Error(`${chapter.slug}: invalid correct answer`);
      }
      if (!question.explanation || question.options.some((option) => option.startsWith("None of these ("))) {
        throw new Error(`${chapter.slug}: incomplete or placeholder question`);
      }
    }
    bank.push(...questions);
  }
  return bank;
}
