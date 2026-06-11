import {
  ApiEnvelope,
  Question,
  QuestionPayload,
  Session,
  Subject,
  SubTopic,
  Test,
  TestPayload,
  Topic,
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

type RequestOptions = RequestInit & { token?: string | null };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.status === 'error' || payload?.success === false) {
    throw new Error(payload?.message ?? 'Something went wrong');
  }

  return (payload?.data ?? payload) as T;
}

export const api = {
  login: (userId: string, password: string) =>
    request<Session>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    }),
  subjects: (token: string) => request<Subject[]>('/subjects', { token }),
  topicsBySubject: (token: string, subjectId: string) => request<Topic[]>(`/topics/subject/${subjectId}`, { token }),
  subTopicsByTopic: (token: string, topicId: string) =>
    request<SubTopic[]>(`/sub-topics/topic/${topicId}`, { token }),
  subTopicsByTopics: (token: string, topicIds: string[]) =>
    request<SubTopic[]>('/sub-topics/multi-topics', {
      method: 'POST',
      token,
      body: JSON.stringify({ topicIds }),
    }),
  tests: (token: string) => request<Test[]>('/tests', { token }),
  test: (token: string, testId: string) => request<Test>(`/tests/${testId}`, { token }),
  createTest: (token: string, payload: TestPayload) =>
    request<Test>('/tests', { method: 'POST', token, body: JSON.stringify(payload) }),
  updateTest: (token: string, testId: string, payload: Partial<TestPayload> & Record<string, unknown>) =>
    request<Test>(`/tests/${testId}`, { method: 'PUT', token, body: JSON.stringify(payload) }),
  deleteTest: (token: string, testId: string) =>
    request<ApiEnvelope<unknown>>(`/tests/${testId}`, { method: 'DELETE', token }),
  bulkCreateQuestions: (token: string, questions: QuestionPayload[]) =>
    request<Question[]>('/questions/bulk', {
      method: 'POST',
      token,
      body: JSON.stringify({ questions }),
    }),
  fetchQuestions: (token: string, questionIds: string[]) =>
    request<Question[]>('/questions/fetchBulk', {
      method: 'POST',
      token,
      body: JSON.stringify({ question_ids: questionIds }),
    }),
};
