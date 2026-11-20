export type SectionKey = "numerical" | "verbal" | "reasoning";
export type Priority = "Very High" | "High" | "Medium";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type TopicStatus = "not-started" | "learning" | "confident";
export type TestScope = "chapter" | "practice" | "bank" | "topic" | "section" | "full" | "advanced" | "weak";

export type TopicDefinition = {
  title: string;
  minutes: number;
  difficulty: Difficulty;
  keyIdea: string;
  routine: string[];
};

export type QuizSeed = {
  prompt: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
};

export type ChapterDefinition = {
  slug: string;
  section: SectionKey;
  title: string;
  summary: string;
  icon: string;
  priority: Priority;
  examWeight: number;
  estimatedMinutes: number;
  topics: TopicDefinition[];
  quiz: QuizSeed[];
};

export type DayTask = {
  label: string;
  minutes: number;
  detail: string;
  type: "learn" | "practice" | "test" | "review";
};

export type ChapterDTO = {
  id: number;
  slug: string;
  section: SectionKey;
  title: string;
  summary: string;
  icon: string;
  priority: Priority;
  examWeight: number;
  estimatedMinutes: number;
  practiceQuestionCount: number;
  orderIndex: number;
};

export type TopicDTO = {
  id: number;
  chapterId: number;
  chapterSlug: string;
  title: string;
  minutes: number;
  difficulty: Difficulty;
  keyIdea: string;
  routine: string[];
  notes: string[];
  shortNotes: string[];
  tricks: string[];
  orderIndex: number;
};

export type DayPlanDTO = {
  dayNumber: number;
  phase: string;
  title: string;
  focus: string;
  section: SectionKey | "mixed";
  chapterSlugs: string[];
  topicTitles: string[];
  tasks: DayTask[];
  targetMinutes: number;
  testKind: string;
  isMilestone: boolean;
};

export type ProfileDTO = {
  startDate: string;
  examDate: string | null;
  dailyGoalMinutes: number;
};

export type DailyProgressDTO = {
  dayNumber: number;
  completed: boolean;
  minutes: number;
  note: string;
  updatedAt: string;
};

export type TopicProgressDTO = {
  topicId: number;
  status: TopicStatus;
  confidence: number;
  updatedAt: string;
};

export type AttemptDTO = {
  id: number;
  scope: string;
  title: string;
  section: string | null;
  chapterSlug: string | null;
  score: number;
  total: number;
  accuracy: number;
  seconds: number;
  createdAt: string;
};

export type SectionStat = {
  section: SectionKey;
  label: string;
  attempted: number;
  correct: number;
  accuracy: number;
  mastery: number;
  color: string;
};

export type TopicStat = {
  topicId: number;
  title: string;
  chapterTitle: string;
  chapterSlug: string;
  section: SectionKey;
  attempted: number;
  correct: number;
  accuracy: number;
  confidence: number;
  status: TopicStatus;
};

export type AppMetrics = {
  currentDay: number;
  daysCompleted: number;
  totalMinutes: number;
  streak: number;
  testsTaken: number;
  averageAccuracy: number;
  topicsMastered: number;
  totalTopics: number;
  readiness: number;
  sectionStats: SectionStat[];
  topicStats: TopicStat[];
  weakAreas: TopicStat[];
  weeklyAccuracy: { label: string; accuracy: number; tests: number }[];
};

export type AppData = {
  chapters: ChapterDTO[];
  topics: TopicDTO[];
  dayPlans: DayPlanDTO[];
  profile: ProfileDTO;
  dailyProgress: DailyProgressDTO[];
  topicProgress: TopicProgressDTO[];
  attempts: AttemptDTO[];
  bankQuestions: BankQuestionDTO[];
  bookmarkedQuestionIds: number[];
  metrics: AppMetrics;
};

export type PublicQuestion = {
  id: number;
  prompt: string;
  options: string[];
  section: SectionKey;
  chapterSlug: string;
  chapterTitle: string;
  topicTitle: string;
  difficulty: string;
  year?: number;
  sourceName?: string;
  sourceUrl?: string;
  yearStatus?: string;
};

export type QuizResultItem = {
  questionId: number;
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  prompt: string;
  correctAnswer: string;
  topicTitle: string;
  section: SectionKey;
};

export type BankQuestionDTO = PublicQuestion & {
  year: number;
  sourceName: string;
  sourceUrl: string;
  yearStatus: string;
  explanation: string;
  correctAnswer: string;
};

export type QuizResult = {
  attemptId: number;
  score: number;
  total: number;
  accuracy: number;
  seconds: number;
  title: string;
  results: QuizResultItem[];
  sectionBreakdown: { section: string; correct: number; total: number }[];
};
