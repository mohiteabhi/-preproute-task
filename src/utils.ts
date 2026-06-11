import { Question, QuestionPayload, Test } from './types';

export function upsertTest(tests: Test[], test: Test) {
  const exists = tests.some((item) => item.id === test.id);
  if (exists) return tests.map((item) => (item.id === test.id ? test : item));
  return [test, ...tests];
}

export function normalizeQuestion(question: QuestionPayload): QuestionPayload {
  return {
    ...question,
    explanation: question.explanation?.trim() || undefined,
    media_url: question.media_url?.trim() || undefined,
    topic: question.topic || undefined,
    sub_topic: question.sub_topic || undefined,
  };
}

export function isSavedQuestion(question: Question | QuestionPayload): question is Question {
  return 'id' in question && typeof question.id === 'string';
}

export function formatDate(value: string) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}
