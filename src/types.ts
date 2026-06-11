export type ApiEnvelope<T> = {
  success?: boolean;
  status?: 'success' | 'error';
  message?: string;
  data: T;
};

export type User = {
  id: string;
  userId: string;
  name: string;
  role: string;
  subrole?: string;
};

export type Session = {
  token: string;
  user: User;
};

export type Subject = {
  id: string;
  name: string;
};

export type Topic = {
  id: string;
  name: string;
  subject_id?: string;
  subjectId?: string;
};

export type SubTopic = {
  id: string;
  name: string;
  topic_id?: string;
  topicId?: string;
};

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TestType = 'chapterwise' | 'mock' | 'practice' | 'pyq';
export type TestStatus = 'draft' | 'live' | null;

export type Test = {
  id: string;
  name: string;
  type?: TestType | string;
  subject: string;
  topics: string[];
  sub_topics?: string[];
  questions?: string[] | null;
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty | string;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: TestStatus;
  created_at: string;
  updated_at?: string | null;
};

export type TestPayload = {
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status: TestStatus;
};

export type QuestionPayload = {
  type: 'mcq';
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: 'option1' | 'option2' | 'option3' | 'option4';
  explanation?: string;
  difficulty?: Difficulty;
  topic?: string;
  sub_topic?: string;
  media_url?: string;
  test_id: string;
};

export type Question = QuestionPayload & {
  id: string;
};

export type TestFormValues = {
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty;
  total_time: number;
  total_marks: number;
  total_questions: number;
};

export type QuestionFormValues = Omit<QuestionPayload, 'test_id'>;
