import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { api } from '../api';
import { defaultTestValues } from '../constants';
import { Subject, SubTopic, Test, TestFormValues, Topic } from '../types';
import { Field, InlineLoader, PageHeader, Spinner } from './common';

type TestEditorProps = {
  token: string;
  subjects: Subject[];
  test: Test | null;
  onCancel: () => void;
  onSaved: (test: Test, next: 'dashboard' | 'questions') => void;
  onError: (message: string) => void;
};

export function TestEditor({ token, subjects, test, onCancel, onSaved, onError }: TestEditorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [nextAction, setNextAction] = useState<'dashboard' | 'questions'>('dashboard');
  const [saving, setSaving] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);
  const subjectId = subjects.find((subject) => subject.name === test?.subject)?.id ?? '';
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TestFormValues>({
    defaultValues: test
      ? {
          ...defaultTestValues,
          name: test.name,
          type: (test.type as TestFormValues['type']) ?? 'chapterwise',
          subject: subjectId,
          correct_marks: test.correct_marks,
          wrong_marks: test.wrong_marks,
          unattempt_marks: test.unattempt_marks,
          difficulty: (test.difficulty as TestFormValues['difficulty']) ?? 'easy',
          total_time: test.total_time,
          total_marks: test.total_marks,
          total_questions: test.total_questions,
        }
      : defaultTestValues,
  });
  const selectedSubject = watch('subject');
  const selectedTopics = watch('topics');

  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      return;
    }
    setLoadingTopics(true);
    api
      .topicsBySubject(token, selectedSubject)
      .then((items) => {
        setTopics(items);
        if (test?.topics?.length) {
          setValue(
            'topics',
            items.filter((topic) => test.topics.includes(topic.name)).map((topic) => topic.id),
          );
        }
      })
      .catch((err) => onError(err instanceof Error ? err.message : 'Unable to load topics'))
      .finally(() => setLoadingTopics(false));
  }, [selectedSubject, token]);

  useEffect(() => {
    if (!selectedTopics?.length) {
      setSubTopics([]);
      setValue('sub_topics', []);
      return;
    }
    setLoadingSubTopics(true);
    api
      .subTopicsByTopics(token, selectedTopics)
      .catch(() => Promise.all(selectedTopics.map((topicId) => api.subTopicsByTopic(token, topicId))).then((sets) => sets.flat()))
      .then((items) => {
        setSubTopics(items);
        if (test?.sub_topics?.length) {
          setValue(
            'sub_topics',
            items.filter((subTopic) => test.sub_topics?.includes(subTopic.name)).map((subTopic) => subTopic.id),
          );
        }
      })
      .catch((err) => onError(err instanceof Error ? err.message : 'Unable to load sub-topics'))
      .finally(() => setLoadingSubTopics(false));
  }, [selectedTopics?.join(','), token]);

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    onError('');
    try {
      const payload = { ...values, status: 'draft' as const };
      const saved = test ? await api.updateTest(token, test.id, payload) : await api.createTest(token, payload);
      onSaved(saved, nextAction);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to save test');
    } finally {
      setSaving(false);
    }
  });

  return (
    <>
      <PageHeader
        eyebrow="Test Details"
        title={test ? 'Edit Test' : 'Create Test'}
        action={
          <button className="secondary" onClick={onCancel}>
            <ArrowLeft size={16} /> Dashboard
          </button>
        }
      />

      <form className="panel form-grid" onSubmit={submit}>
        <div className="stepper">
          <span className="done">Details</span>
          <span>Questions</span>
          <span>Preview</span>
        </div>

        <div className="two-column">
          <Field label="Subject" error={errors.subject?.message}>
            <select {...register('subject', { required: 'Subject is required' })}>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Name of Test" error={errors.name?.message}>
            <input {...register('name', { required: 'Test name is required' })} placeholder="Enter test name" />
          </Field>
          <Field label="Test Type">
            <select {...register('type')}>
              <option value="chapterwise">Chapterwise</option>
              <option value="mock">Mock</option>
              <option value="practice">Practice</option>
              <option value="pyq">PYQ</option>
            </select>
          </Field>
          <Field label="Topic" error={errors.topics?.message}>
            <select
              multiple
              disabled={!selectedSubject || loadingTopics}
              {...register('topics', { validate: (value) => value.length > 0 || 'Select at least one topic' })}
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
            {loadingTopics && <InlineLoader label="Loading topics" />}
          </Field>
          <Field label="Sub Topic">
            <select multiple disabled={!selectedTopics?.length || loadingSubTopics} {...register('sub_topics')}>
              {subTopics.map((subTopic) => (
                <option key={subTopic.id} value={subTopic.id}>
                  {subTopic.name}
                </option>
              ))}
            </select>
            {loadingSubTopics && <InlineLoader label="Loading sub-topics" />}
          </Field>
          <Field label="Duration (Minutes)">
            <input type="number" min={1} {...register('total_time', { valueAsNumber: true, min: 1 })} />
          </Field>
        </div>

        <div>
          <h2>Test Difficulty Level</h2>
          <div className="radio-row">
            {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
              <label key={difficulty}>
                <input type="radio" value={difficulty} {...register('difficulty')} />
                {difficulty}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2>Marking Scheme</h2>
          <div className="marking-grid">
            <Field label="Wrong Answer">
              <input type="number" {...register('wrong_marks', { valueAsNumber: true })} />
            </Field>
            <Field label="Unattempted">
              <input type="number" {...register('unattempt_marks', { valueAsNumber: true })} />
            </Field>
            <Field label="Correct Answer">
              <input type="number" {...register('correct_marks', { valueAsNumber: true })} />
            </Field>
            <Field label="No of Questions">
              <input type="number" min={1} {...register('total_questions', { valueAsNumber: true, min: 1 })} />
            </Field>
            <Field label="Total Marks">
              <input type="number" min={1} {...register('total_marks', { valueAsNumber: true, min: 1 })} />
            </Field>
          </div>
        </div>

        <div className="form-actions">
          <button className="secondary" disabled={saving} type="submit" onClick={() => setNextAction('dashboard')}>
            {saving && nextAction === 'dashboard' ? <Spinner size="sm" /> : null}
            Save as Draft
          </button>
          <button className="primary" disabled={saving} type="submit" onClick={() => setNextAction('questions')}>
            {saving && nextAction === 'questions' ? <Spinner size="sm" /> : null}
            Next: Add Questions
          </button>
        </div>
      </form>
    </>
  );
}
