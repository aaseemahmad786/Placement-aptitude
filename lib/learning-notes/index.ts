import topicNotes from "@/lib/data/topic-notes.json";
import { ALL_CHAPTERS } from "@/lib/curriculum";
import { l, type LearningNote } from "@/lib/learning-notes";

export const learningNotes: Record<string, LearningNote[]> = topicNotes;

export function getLearningNotes(chapterSlug: string, topicTitle: string, keyIdea: string): LearningNote {
  const chapter = ALL_CHAPTERS.find(item => item.slug === chapterSlug);
  const index = chapter?.topics.findIndex(topic => topic.title === topicTitle) ?? -1;
  return learningNotes[chapterSlug]?.[index] ?? l(
    [keyIdea, "Work through examples, then practise under a timer.", "Review mistakes and recall the method without notes."],
    [keyIdea],
    ["Write the rule from memory before checking notes.", "Review the error log after each timed drill."],
  );
}
