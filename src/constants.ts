import { QuestionFormValues, TestFormValues } from './types';

export const testTubeImage = 'https://www.figma.com/api/mcp/asset/da46d0f0-3589-4122-9c97-e24c0f01dfdb';

export const defaultLoginValues = {
  userId: import.meta.env.VITE_DEFAULT_USER_ID ?? '',
  password: import.meta.env.VITE_DEFAULT_PASSWORD ?? '',
};

export const defaultTestValues: TestFormValues = {
  name: '',
  type: 'chapterwise',
  subject: '',
  topics: [],
  sub_topics: [],
  correct_marks: 5,
  wrong_marks: -1,
  unattempt_marks: 0,
  difficulty: 'easy',
  total_time: 60,
  total_marks: 250,
  total_questions: 50,
};

export const defaultQuestionValues: QuestionFormValues = {
  type: 'mcq',
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: 'option1',
  explanation: '',
  difficulty: 'easy',
  topic: '',
  sub_topic: '',
  media_url: '',
};
