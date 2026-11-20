import type {
  DayPlanDTO,
  DayTask,
  Difficulty,
  QuizSeed,
  SectionKey,
} from "@/lib/types";
import { numericalChapters } from "@/lib/data/numerical";
import { verbalChapters } from "@/lib/data/verbal";
import { reasoningChapters } from "@/lib/data/reasoning";

export const SECTION_META: Record<
  SectionKey,
  { label: string; short: string; icon: string; color: string; soft: string; description: string }
> = {
  numerical: {
    label: "Numerical Ability",
    short: "Quant",
    icon: "∑",
    color: "#5b5bd6",
    soft: "#eeedff",
    description: "Arithmetic, algebra, statistics and data interpretation",
  },
  verbal: {
    label: "Verbal Ability",
    short: "Verbal",
    icon: "Aa",
    color: "#0f9c8a",
    soft: "#e4f7f3",
    description: "Comprehension, grammar, vocabulary and communication",
  },
  reasoning: {
    label: "Reasoning Ability",
    short: "Reasoning",
    icon: "✦",
    color: "#e8833a",
    soft: "#fff0e3",
    description: "Logic, patterns, arrangements and decision making",
  },
};

export const PHASES = [
  { name: "Foundation Build", days: "Days 1–14", detail: "Core concepts and formula sheets" },
  { name: "Speed & Accuracy", days: "Days 15–35", detail: "Complete the chapter syllabus with timed drills" },
  { name: "Application Sprint", days: "Days 36–52", detail: "Mixed sets, advanced problems and weak-area repair" },
  { name: "Mock & Revision", days: "Days 53–60", detail: "Full simulations, analysis and final recall" },
];

export const ALL_CHAPTERS = [
  ...numericalChapters,
  ...verbalChapters,
  ...reasoningChapters,
];

export type QuestionSeed = QuizSeed & {
  chapterSlug: string;
  topicTitle: string;
  section: SectionKey;
  difficulty: Difficulty;
  source: "authored" | "concept" | "practice";
};

function hash(text: string) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

function seededShuffle<T>(items: T[], seed: number) {
  const result = [...items];
  let state = seed || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeOptionQuestion(
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
  seed: string,
): QuizSeed {
  const unique = [correct, ...distractors.filter((value) => value !== correct)];
  while (unique.length < 4) unique.push(`None of the above (${unique.length})`);
  const options = seededShuffle(unique.slice(0, 4), hash(seed));
  return {
    prompt,
    options: options as [string, string, string, string],
    correct: options.indexOf(correct),
    explanation,
  };
}

const allKeyIdeas = ALL_CHAPTERS.flatMap((chapter) => chapter.topics.map((topic) => topic.keyIdea));
const allTopicTitles = ALL_CHAPTERS.flatMap((chapter) => chapter.topics.map((topic) => topic.title));

export function buildQuestionBank(): QuestionSeed[] {
  const bank: QuestionSeed[] = [];

  for (const chapter of ALL_CHAPTERS) {
    chapter.quiz.forEach((question, index) => {
      bank.push({
        ...question,
        chapterSlug: chapter.slug,
        topicTitle: chapter.topics[index % chapter.topics.length].title,
        section: chapter.section,
        difficulty: index === 0 ? "Medium" : "Hard",
        source: "authored",
      });
    });

    chapter.topics.slice(0, 3).forEach((topic, index) => {
      const ideaDistractors = allKeyIdeas
        .filter((idea) => idea !== topic.keyIdea)
        .slice((hash(chapter.slug + index) % 40), (hash(chapter.slug + index) % 40) + 3);
      const titleDistractors = allTopicTitles
        .filter((title) => title !== topic.title)
        .slice((hash(chapter.slug + "title" + index) % 40), (hash(chapter.slug + "title" + index) % 40) + 3);

      const keyIdeaQuestion = makeOptionQuestion(
        `Which key idea best describes “${topic.title}” in ${chapter.title}?`,
        topic.keyIdea,
        ideaDistractors,
        `${topic.title}: ${topic.keyIdea}`,
        chapter.slug + "idea" + index,
      );

      const classificationQuestion = makeOptionQuestion(
        `A problem asks you to apply this idea: “${topic.keyIdea}” Which subtopic of ${chapter.title} should you use?`,
        topic.title,
        titleDistractors,
        `This is the core technique for ${topic.title}.`,
        chapter.slug + "classify" + index,
      );

      const routineQuestion = makeOptionQuestion(
        `After a timed ${topic.title} drill, what is the highest-value next step in your topic routine?`,
        "Log mistakes, rewrite the shortcut, and recall it after 10 minutes",
        [
          "Move immediately to a new chapter without review",
          "Memorise answer letters but skip the method",
          "Only count the score and close the notebook",
        ],
        "Error-log review plus delayed recall converts a timed drill into durable exam speed.",
        chapter.slug + "routine" + index,
      );

      [
        keyIdeaQuestion,
        classificationQuestion,
        routineQuestion,
      ].forEach((question) => {
        bank.push({
          ...question,
          chapterSlug: chapter.slug,
          topicTitle: topic.title,
          section: chapter.section,
          difficulty: topic.difficulty,
          source: "concept",
        });
      });
    });
  }

  return bank;
}

function task(label: string, minutes: number, detail: string, type: DayTask["type"]): DayTask {
  return { label, minutes, detail, type };
}

function chaptersFor(day: number, count: number, pool = ALL_CHAPTERS) {
  return Array.from({ length: count }, (_, index) => pool[(day * 3 + index * 7) % pool.length].slug);
}

export function buildDayPlans(): DayPlanDTO[] {
  const plans: DayPlanDTO[] = [];
  const highPriority = ALL_CHAPTERS.filter((chapter) => chapter.priority === "Very High");

  for (let day = 1; day <= 60; day++) {
    let phase: string;
    let title: string;
    let focus: string;
    let section: SectionKey | "mixed";
    let chapterSlugs: string[];
    let topicTitles: string[];
    let tasks: DayTask[];
    let testKind: string;

    if (day <= 35) {
      const chapter = ALL_CHAPTERS[day - 1];
      const topics = chapter.topics;
      phase = day <= 14 ? "Foundation Build" : day <= 28 ? "Speed & Accuracy" : "Syllabus Completion";
      title = `Master: ${chapter.title}`;
      focus = `${SECTION_META[chapter.section].short} · ${chapter.priority} priority · ${chapter.examWeight}% weight`;
      section = chapter.section;
      chapterSlugs = [chapter.slug];
      topicTitles = topics.map((topic) => topic.title);
      tasks = [
        task("Concept + formula sheet", 20, `Revise ${topics[0].title}: ${topics[0].keyIdea}`, "learn"),
        task("Guided examples", 20, `Solve 8 worked examples on ${topics[1].title} and ${topics[2].title}.`, "practice"),
        task("Timed topic drill", 30, `Complete 20 mixed questions covering all ${topics.length} subtopics at 90 seconds per question.`, "practice"),
        task("Chapter test + error log", 20, `Take the ${chapter.title} chapter test, then write one correction for every mistake.`, "test"),
      ];
      if (day % 7 === 0) {
        tasks.push(task("Weekly consolidation", 20, "Recap all six previous chapters, rebuild one-page shortcuts, and repeat missed questions.", "review"));
      }
      testKind = day % 7 === 0 ? "Chapter test + weekly review" : "Chapter test";
    } else if (day <= 45) {
      const pair = chaptersFor(day, 2, highPriority);
      const first = ALL_CHAPTERS.find((chapter) => chapter.slug === pair[0])!;
      const second = ALL_CHAPTERS.find((chapter) => chapter.slug === pair[1])!;
      phase = "Application Sprint";
      title = "Mixed application & speed set";
      focus = "Two high-weight chapters · alternate question types under time pressure";
      section = "mixed";
      chapterSlugs = pair;
      topicTitles = [first.topics[day % first.topics.length].title, second.topics[day % second.topics.length].title];
      tasks = [
        task("Rapid formula recall", 15, `Without notes, write the rules for ${first.title} and ${second.title}.`, "review"),
        task("Interleaved drill", 35, `Solve 25 questions alternating between ${first.title} and ${second.title}.`, "practice"),
        task("Speed technique", 20, `Use ${first.topics[0].keyIdea} and ${second.topics[1].keyIdea} to shorten your solutions.`, "learn"),
        task("Section test + analysis", 30, "Take a mixed 15-question section test and classify every error as concept, calculation or timing.", "test"),
      ];
      testKind = "Section test";
    } else if (day <= 52) {
      const set = chaptersFor(day, 4);
      phase = "Advanced Aptitude";
      title = day % 2 === 0 ? "Advanced reasoning lab" : "Advanced quantitative lab";
      focus = "Multi-concept sets, data sufficiency and weak-area repair";
      section = "mixed";
      chapterSlugs = set;
      topicTitles = set.flatMap((slug) => {
        const chapter = ALL_CHAPTERS.find((item) => item.slug === slug)!;
        return [chapter.topics[day % chapter.topics.length].title];
      });
      tasks = [
        task("Weak-area repair", 25, "Open Performance, choose your lowest-accuracy topics, and redo their missed-question patterns.", "review"),
        task("Advanced problem set", 35, `Solve 12 harder questions drawn from ${set.length} mixed chapters.`, "practice"),
        task("Timing simulation", 20, "Attempt one 15-question advanced sprint in 25 minutes with no pauses.", "test"),
        task("Two-pass analysis", 20, "Categorise errors, rewrite the fastest method, and schedule the next repeat.", "review"),
      ];
      testKind = "Advanced sprint";
    } else if (day <= 58) {
      const mockNumber = day - 52;
      phase = "Full Mock Cycle";
      title = `Full-length aptitude mock ${mockNumber}`;
      focus = "75-minute Foundation simulation + 25-minute Advanced section";
      section = "mixed";
      chapterSlugs = chaptersFor(day, 6);
      topicTitles = ["Timed numerical set", "Timed verbal set", "Timed reasoning set", "Advanced mixed set"];
      tasks = [
        task("Exam warm-up", 10, "Recall percentage, ratio and series shortcuts; set a single visible timer.", "review"),
        task("Foundation mock", 75, "Attempt numerical, verbal and reasoning blocks back-to-back with section timing.", "test"),
        task("Advanced mock", 25, "Attempt a harder shared quant + reasoning set without checking answers.", "test"),
        task("Deep analysis", 30, "Score the mock, tag every miss by chapter, and add the weakest three topics to tomorrow's repair list.", "review"),
      ];
      testKind = "Full mock";
    } else if (day === 59) {
      phase = "Final Revision";
      title = "Full syllabus rapid revision";
      focus = "One-page shortcuts for every high-weight chapter";
      section = "mixed";
      chapterSlugs = highPriority.map((chapter) => chapter.slug);
      topicTitles = ["Formula sheets", "Grammar rules", "Logic patterns", "Error-log revisits"];
      tasks = [
        task("Numerical recall", 30, "Revise all high-weight formula sheets and redo 20 previously missed quant questions.", "review"),
        task("Verbal recall", 25, "Review error-detection rules, connectors, collocations and the email template.", "review"),
        task("Reasoning recall", 25, "Rebuild seating, series, syllogism and direction-sense shortcut cards.", "review"),
        task("Light mixed set", 20, "Attempt 10 easy-to-medium questions to protect confidence, then stop studying early.", "practice"),
      ];
      testKind = "Light recall set";
    } else {
      phase = "Exam Readiness";
      title = "Final simulation & exam-day plan";
      focus = "Short confidence mock, strategy review and calm recovery";
      section = "mixed";
      chapterSlugs = chaptersFor(day, 5);
      topicTitles = ["Question selection", "Skip rule", "Time checkpoints", "Accuracy over attempts"];
      tasks = [
        task("Confidence mock", 40, "Take a short mixed quiz and focus on clean execution rather than volume.", "test"),
        task("Strategy sheet", 20, "Write your first-pass question types, skip threshold and section checkpoints.", "review"),
        task("Final error scan", 20, "Read only your red-flag mistakes and one-line corrections.", "review"),
        task("Reset", 10, "Plan sleep, documents and arrival time; avoid new topics.", "review"),
      ];
      testKind = "Final readiness check";
    }

    const targetMinutes = tasks.reduce((sum, item) => sum + item.minutes, 0);
    plans.push({
      dayNumber: day,
      phase,
      title,
      focus,
      section,
      chapterSlugs: [...new Set(chapterSlugs)],
      topicTitles: [...new Set(topicTitles)],
      tasks,
      targetMinutes,
      testKind,
      isMilestone: day % 7 === 0 || day === 35 || day === 60,
    });
  }

  return plans;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, amount: number) {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function dayDifference(startIso: string, endIso: string) {
  const start = new Date(`${startIso}T12:00:00Z`).getTime();
  const end = new Date(`${endIso}T12:00:00Z`).getTime();
  return Math.floor((end - start) / 86400000);
}
