import type { Difficulty, QuizSeed } from "@/lib/types";
import type { QuestionSeed } from "@/lib/curriculum";

export type PracticeQuestion = QuizSeed & { difficulty?: Difficulty };
export type PracticeAsk = (prompt: string, correct: string, distractors: string[], explanation: string, difficulty?: Difficulty) => PracticeQuestion;
export type PracticeBuilder = (variant: number, ask: PracticeAsk) => PracticeQuestion;
export type WordSet = [string, string, string, string];

export function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : Math.abs(a); }
export function lcm(a: number, b: number) { return a * b / gcd(a, b); }
export function factorial(n: number): number { let value = 1; for (let i = 2; i <= n; i++) value *= i; return value; }
export function choose(n: number, r: number) { return factorial(n) / (factorial(r) * factorial(n - r)); }
export function isPrime(n: number) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
export function formatNumber(value: number) { return Number(value.toFixed(2)).toString(); }
export function fraction(a: number, b: number) { const d = gcd(a, b) || 1; return b / d === 1 ? String(a / d) : `${a / d}/${b / d}`; }

export function num(ask: PracticeAsk, prompt: string, correct: number, wrong: number[], explanation: string, unit = "", prefix = "") {
  const answer = formatNumber(correct);
  const distractors = [...new Set(wrong)].filter(value => formatNumber(value) !== answer);
  const step = Math.max(0.01, Math.abs(correct) * 0.1);
  let offset = 1;
  while (distractors.length < 3) {
    const candidate = Number((correct + step * offset++).toFixed(2));
    if (formatNumber(candidate) !== answer && !distractors.some(value => formatNumber(value) === formatNumber(candidate))) distractors.push(candidate);
  }
  return ask(prompt, `${prefix}${answer}${unit}`, distractors.slice(0, 3).map(value => `${prefix}${formatNumber(value)}${unit}`), explanation);
}

export function wordSets(ask: PracticeAsk, prompt: string, sets: string[][], explanation: string, variant: number) {
  const set = sets[variant] ?? sets[0];
  return ask(prompt, set[0], set.slice(1), explanation);
}

export function buildChapterPractice(slug: string, topicTitles: string[], builders: PracticeBuilder[], section: "numerical" | "verbal" | "reasoning"): QuestionSeed[] {
  if (builders.length !== 10) throw new Error(`${slug}: expected 10 question families`);
  const questions: QuestionSeed[] = [];
  for (let variant = 0; variant < 5; variant++) {
    builders.forEach((builder, family) => {
      const topicIndex = Math.floor(family / 2) % topicTitles.length;
      const ask: PracticeAsk = (prompt, correct, distractors, explanation, difficulty) => {
        const unique = [...new Set(distractors)].filter(value => value !== correct).slice(0, 3);
        const match = correct.match(/^([^0-9-]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
        const base = match ? Number(match[2]) : 0;
        const step = Math.max(0.01, Math.abs(base) * 0.1);
        let offset = 1;
        while (unique.length < 3) {
          const candidate = match ? `${match[1]}${formatNumber(base + step * offset++)}${match[3]}` : `Alternative ${offset++}`;
          if (candidate !== correct && !unique.includes(candidate)) unique.push(candidate);
        }
        const options = [correct, ...unique];
        let state = 2166136261;
        const seed = `${slug}:${family}:${variant}:${prompt}:${correct}`;
        for (let i = 0; i < seed.length; i++) { state ^= seed.charCodeAt(i); state = Math.imul(state, 16777619); }
        state = Math.abs(state) || 1;
        for (let i = options.length - 1; i > 0; i--) { state = (state * 1664525 + 1013904223) >>> 0; const j = state % (i + 1); [options[i], options[j]] = [options[j], options[i]]; }
        return { prompt, options: options as [string, string, string, string], correct: options.indexOf(correct), explanation: explanation || `The correct answer is ${correct}.` };
      };
      const question = builder(variant, ask);
      questions.push({ ...question, chapterSlug: slug, topicTitle: topicTitles[topicIndex], section, difficulty: question.difficulty ?? "Medium", source: "practice" });
    });
  }
  const seen = new Set<string>();
  questions.forEach((question, index) => { if (seen.has(question.prompt)) question.prompt += ` (practice item ${index + 1})`; seen.add(question.prompt); });
  return questions;
}
