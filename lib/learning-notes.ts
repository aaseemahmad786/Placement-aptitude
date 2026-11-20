export type LearningNote = { notes: string[]; shortNotes: string[]; tricks: string[] };
export function l(notes: string[], shortNotes: string[], tricks: string[]): LearningNote { return { notes, shortNotes, tricks }; }
