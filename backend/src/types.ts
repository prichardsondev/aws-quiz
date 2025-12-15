export interface Question {
  question: string;
  answer: string;
  distractors: string[];
}

export interface ServicesFile {
  catagory: Record<string, Question[]>;
}

export type QuestionPayload = Partial<Question>;
