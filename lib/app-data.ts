import { db } from "@/db";
import {
  attemptAnswers,
  chapters,
  questions,
  questionBookmarks,
  dailyProgress,
  dayPlans,
  profile,
  testAttempts,
  topicProgress,
  topics,
} from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { ensureSeeded } from "@/lib/seed";
import { ALL_CHAPTERS, SECTION_META, addDays, buildDayPlans, dayDifference, todayIso } from "@/lib/curriculum";
import { getLearningNotes } from "@/lib/learning-notes/index";
import type {
  AppData,
  AttemptDTO,
  BankQuestionDTO,
  ChapterDTO,
  DailyProgressDTO,
  DayPlanDTO,
  ProfileDTO,
  SectionKey,
  SectionStat,
  TopicDTO,
  TopicProgressDTO,
  TopicStat,
  TopicStatus,
} from "@/lib/types";

function iso(value: Date | string | null) {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function dateKey(value: Date | string) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function getStaticAppData(): AppData {
  const startDate = todayIso();
  const dayPlanDTOs = buildDayPlans();
  const chapterDTOs: ChapterDTO[] = ALL_CHAPTERS.map((ch, index) => ({
    id: index + 1,
    slug: ch.slug,
    section: ch.section,
    title: ch.title,
    summary: ch.summary,
    icon: ch.icon,
    priority: ch.priority,
    examWeight: ch.examWeight,
    estimatedMinutes: ch.estimatedMinutes,
    practiceQuestionCount: 0,
    orderIndex: index + 1,
  }));
  const topicDTOs: TopicDTO[] = ALL_CHAPTERS.flatMap((ch, chIdx) =>
    ch.topics.map((t, tIdx) => {
      const note = getLearningNotes(ch.slug, t.title, t.keyIdea);
      return {
        id: chIdx * 100 + tIdx + 1,
        chapterId: chIdx + 1,
        chapterSlug: ch.slug,
        title: t.title,
        minutes: t.minutes,
        difficulty: t.difficulty,
        keyIdea: t.keyIdea,
        routine: t.routine,
        notes: note.notes,
        shortNotes: note.shortNotes,
        tricks: note.tricks,
        orderIndex: tIdx + 1,
      };
    }),
  );
  const sectionStats: SectionStat[] = (["numerical", "verbal", "reasoning"] as SectionKey[]).map((key) => {
    const meta = SECTION_META[key];
    return {
      section: key,
      label: meta.label,
      attempted: 0,
      correct: 0,
      accuracy: 0,
      mastery: 0,
      color: meta.color,
    };
  });
  return {
    bankQuestions: [],
    bookmarkedQuestionIds: [],
    chapters: chapterDTOs,
    topics: topicDTOs,
    dayPlans: dayPlanDTOs,
    profile: {
      startDate,
      examDate: addDays(startDate, 59),
      dailyGoalMinutes: 90,
    },
    dailyProgress: [],
    topicProgress: [],
    attempts: [],
    metrics: {
      currentDay: 1,
      daysCompleted: 0,
      totalMinutes: 0,
      streak: 0,
      testsTaken: 0,
      averageAccuracy: 0,
      topicsMastered: 0,
      totalTopics: topicDTOs.length,
      readiness: 0,
      sectionStats,
      topicStats: [],
      weakAreas: [],
      weeklyAccuracy: Array.from({ length: 7 }, (_, index) => {
        const date = addDays(todayIso(), index - 6);
        const weekday = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
        return { label: weekday, accuracy: 0, tests: 0 };
      }),
    },
  };
}

export async function getAppData(): Promise<AppData> {
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.npm_lifecycle_event === "build"
  ) {
    return getStaticAppData();
  }

  try {
    await ensureSeeded();

    const [
      chapterRows,
      topicRows,
      planRows,
      profileRows,
      dailyRows,
      progressRows,
      attemptRows,
      answerRows,
      practiceCounts,
      previousRows,
      bookmarkRows,
    ] = await Promise.all([
      db.select().from(chapters).orderBy(chapters.orderIndex),
      db.select().from(topics).orderBy(topics.chapterId, topics.orderIndex),
      db.select().from(dayPlans).orderBy(dayPlans.dayNumber),
      db.select().from(profile).limit(1),
      db.select().from(dailyProgress),
      db.select().from(topicProgress),
      db.select().from(testAttempts).orderBy(desc(testAttempts.createdAt)).limit(40),
      db.select().from(attemptAnswers),
      db.select({ chapterId: questions.chapterId, total: count() }).from(questions).where(eq(questions.source, "practice")).groupBy(questions.chapterId),
      db.select().from(questions).where(eq(questions.source, "previous-year")).orderBy(questions.orderIndex),
      db.select().from(questionBookmarks),
    ]);

    const practiceCountByChapter = new Map(practiceCounts.map(row => [row.chapterId, row.total]));
    const chapterById = new Map(chapterRows.map((row) => [row.id, row]));
    const chapterBySlug = new Map(chapterRows.map((row) => [row.slug, row]));

    const chapterDTOs: ChapterDTO[] = chapterRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      section: row.section,
      title: row.title,
      summary: row.summary,
      icon: row.icon,
      priority: row.priority,
      examWeight: row.examWeight,
      estimatedMinutes: row.estimatedMinutes,
      practiceQuestionCount: practiceCountByChapter.get(row.id) ?? 0,
      orderIndex: row.orderIndex,
    }));

    const topicDTOs: TopicDTO[] = topicRows.map((row) => {
      const chapter = chapterById.get(row.chapterId);
      return {
        id: row.id,
        chapterId: row.chapterId,
        chapterSlug: chapter?.slug ?? "",
        title: row.title,
        minutes: row.minutes,
        difficulty: row.difficulty,
        keyIdea: row.keyIdea,
        routine: (row.routine ?? []) as string[],
        notes: (row.notes ?? []) as string[],
        shortNotes: (row.shortNotes ?? []) as string[],
        tricks: (row.tricks ?? []) as string[],
        orderIndex: row.orderIndex,
      };
    });

    const planDTOs: DayPlanDTO[] = planRows.map((row) => ({
      dayNumber: row.dayNumber,
      phase: row.phase,
      title: row.title,
      focus: row.focus,
      section: row.section as SectionKey | "mixed",
      chapterSlugs: (row.chapterSlugs ?? []) as string[],
      topicTitles: (row.topicTitles ?? []) as string[],
      tasks: row.tasks,
      targetMinutes: row.targetMinutes,
      testKind: row.testKind,
      isMilestone: row.isMilestone,
    }));

    const profileRecord = profileRows[0];
    const startDate = profileRecord ? profileRecord.startDate : todayIso();
    const profileDTO: ProfileDTO = {
      startDate,
      examDate: profileRecord?.examDate ?? null,
      dailyGoalMinutes: profileRecord?.dailyGoalMinutes ?? 90,
    };

    const dailyDTOs: DailyProgressDTO[] = dailyRows.map((row) => ({
      dayNumber: row.dayNumber,
      completed: row.completed,
      minutes: row.minutes,
      note: row.note,
      updatedAt: iso(row.updatedAt),
    }));

    const topicProgressDTOs: TopicProgressDTO[] = progressRows.map((row) => ({
      topicId: row.topicId,
      status: row.status,
      confidence: row.confidence,
      updatedAt: iso(row.updatedAt),
    }));

    const attemptDTOs: AttemptDTO[] = attemptRows.map((row) => ({
      id: row.id,
      scope: row.scope,
      title: row.title,
      section: row.section,
      chapterSlug: row.chapterSlug,
      score: row.score,
      total: row.total,
      accuracy: Math.round(row.accuracy),
      seconds: row.seconds,
      createdAt: iso(row.createdAt),
    }));

    const completedDaySet = new Set(dailyRows.filter((row) => row.completed).map((row) => row.dayNumber));
    const daysCompleted = completedDaySet.size;
    const totalMinutes = dailyRows.reduce((sum, row) => sum + (row.minutes || 0), 0);

    const dayDiff = dayDifference(startDate, todayIso());
    const currentDay = Math.max(1, Math.min(60, dayDiff + 1));

    let streak = 0;
    for (let day = currentDay; day >= 1; day -= 1) {
      if (completedDaySet.has(day)) {
        streak += 1;
      } else if (day !== currentDay) {
        break;
      }
    }

    const progressByTopic = new Map(topicProgressDTOs.map((row) => [row.topicId, row]));
    const topicsMastered = topicProgressDTOs.filter((row) => row.status === "confident").length;
    const testsTaken = attemptDTOs.length;
    const averageAccuracy = Math.round(average(attemptDTOs.map((row) => row.accuracy)));

    const sectionStats: SectionStat[] = (["numerical", "verbal", "reasoning"] as SectionKey[]).map((key) => {
      const meta = SECTION_META[key];
      const sectionChapters = chapterDTOs.filter((chapter) => chapter.section === key);
      const sectionChapterIds = new Set(sectionChapters.map((chapter) => chapter.id));
      const sectionTopics = topicDTOs.filter((topic) => sectionChapterIds.has(topic.chapterId));
      const sectionAttempts = answerRows.filter((row) => row.section === key);
      const attempted = sectionAttempts.length;
      const correct = sectionAttempts.filter((row) => row.isCorrect).length;
      const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
      const mastered = sectionTopics.filter((topic) => progressByTopic.get(topic.id)?.status === "confident").length;
      const mastery = sectionTopics.length ? Math.round((mastered / sectionTopics.length) * 100) : 0;
      return {
        section: key,
        label: meta.label,
        attempted,
        correct,
        accuracy,
        mastery,
        color: meta.color,
      };
    });

    const answerByTopic = new Map<string, { attempted: number; correct: number }>();
    for (const answer of answerRows) {
      const key = `${answer.chapterId}:${answer.topicTitle}`;
      const current = answerByTopic.get(key) ?? { attempted: 0, correct: 0 };
      current.attempted += 1;
      if (answer.isCorrect) current.correct += 1;
      answerByTopic.set(key, current);
    }

    const topicStats: TopicStat[] = topicDTOs.map((topic) => {
      const chapter = chapterById.get(topic.chapterId)!;
      const result = answerByTopic.get(`${topic.chapterId}:${topic.title}`) ?? { attempted: 0, correct: 0 };
      const progress = progressByTopic.get(topic.id);
      return {
        topicId: topic.id,
        title: topic.title,
        chapterTitle: chapter.title,
        chapterSlug: chapter.slug,
        section: chapter.section,
        attempted: result.attempted,
        correct: result.correct,
        accuracy: result.attempted ? Math.round((result.correct / result.attempted) * 100) : 0,
        confidence: progress?.confidence ?? 0,
        status: (progress?.status ?? "not-started") as TopicStatus,
      };
    });

    const chapterWeight = new Map(chapterDTOs.map((chapter) => [chapter.slug, chapter.examWeight]));
    const weaknessScore = (stat: TopicStat) => {
      const examWeight = chapterWeight.get(stat.chapterSlug) ?? 5;
      if (stat.attempted) return 100 - stat.accuracy + examWeight / 4;
      return 70 - stat.confidence * 18 + examWeight / 3;
    };
    const weakAreas = [...topicStats]
      .filter((stat) => stat.status !== "confident")
      .sort((a, b) => weaknessScore(b) - weaknessScore(a))
      .slice(0, 8);

    const weeklyAccuracy = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(todayIso(), index - 6);
      const attemptsOnDate = attemptRows.filter((row) => dateKey(row.createdAt) === date);
      const weekday = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
      return {
        label: weekday,
        accuracy: Math.round(average(attemptsOnDate.map((row) => row.accuracy))),
        tests: attemptsOnDate.length,
      };
    });

    const planScore = (daysCompleted / 60) * 100;
    const masteryScore = topicDTOs.length ? (topicsMastered / topicDTOs.length) * 100 : 0;
    const testScore = Math.min(100, (testsTaken / 8) * 100);
    const readiness = Math.round(planScore * 0.35 + averageAccuracy * 0.3 + masteryScore * 0.25 + testScore * 0.1);

    const bankQuestions: BankQuestionDTO[] = previousRows.map(row => ({
      id: row.id, prompt: row.prompt, options: row.options, section: row.section,
      chapterSlug: chapterById.get(row.chapterId)?.slug ?? "", chapterTitle: chapterById.get(row.chapterId)?.title ?? "",
      topicTitle: row.topicTitle, difficulty: row.difficulty, year: row.year ?? 2021,
      sourceName: row.sourceName ?? "Publicly reported collection", sourceUrl: row.sourceUrl ?? "",
      yearStatus: row.yearStatus, explanation: row.explanation, correctAnswer: row.options[row.correctIndex],
    }));
    return {
      bankQuestions,
      bookmarkedQuestionIds: bookmarkRows.map(row => row.questionId),
      chapters: chapterDTOs,
      topics: topicDTOs,
      dayPlans: planDTOs,
      profile: profileDTO,
      dailyProgress: dailyDTOs,
      topicProgress: topicProgressDTOs,
      attempts: attemptDTOs,
      metrics: {
        currentDay,
        daysCompleted,
        totalMinutes,
        streak,
        testsTaken,
        averageAccuracy,
        topicsMastered,
        totalTopics: topicDTOs.length,
        readiness,
        sectionStats,
        topicStats,
        weakAreas,
        weeklyAccuracy,
      },
    };
  } catch (error) {
    console.warn("Failed to load database data in getAppData, using static fallback:", error);
    return getStaticAppData();
  }
}
