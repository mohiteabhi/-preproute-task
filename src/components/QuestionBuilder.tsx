import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import { api } from '../api';
import { defaultQuestionValues } from '../constants';
import { Question, QuestionFormValues, QuestionPayload, Subject, SubTopic, Test, Topic } from '../types';
import { isSavedQuestion, normalizeQuestion } from '../utils';
import { Field, PageHeader, Spinner } from './common';

type QuestionBuilderProps = {
  token: string;
  test: Test;
  subjects: Subject[];
  seedQuestions: Question[];
  onBack: () => void;
  onSaved: (test: Test, questions: Question[]) => void;
  onError: (message: string) => void;
};

export function QuestionBuilder({
  token,
  test,
  subjects,
  seedQuestions,
  onBack,
  onSaved,
  onError,
}: QuestionBuilderProps) {
  const [drafts, setDrafts] = useState<QuestionPayload[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<Question[]>(seedQuestions);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingSubTopics, setLoadingSubTopics] = useState(false);
  const subject = subjects.find((item) => item.name === test.subject);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuestionFormValues>({ defaultValues: defaultQuestionValues });
  const selectedTopic = watch('topic');

  useEffect(() => {
    if (!subject) return;
    setLoadingTopics(true);
    api
      .topicsBySubject(token, subject.id)
      .then(setTopics)
      .catch(() => setTopics([]))
      .finally(() => setLoadingTopics(false));
  }, [subject?.id, token]);

  useEffect(() => {
    if (!selectedTopic) {
      setSubTopics([]);
      return;
    }
    setLoadingSubTopics(true);
    api
      .subTopicsByTopic(token, selectedTopic)
      .then(setSubTopics)
      .catch(() => setSubTopics([]))
      .finally(() => setLoadingSubTopics(false));
  }, [selectedTopic, token]);

  const addQuestion = handleSubmit((values) => {
    const question = normalizeQuestion({ ...values, test_id: test.id });
    if (editingIndex === null) {
      setDrafts((current) => [...current, question]);
    } else {
      setDrafts((current) => current.map((item, index) => (index === editingIndex ? question : item)));
      setEditingIndex(null);
    }
    reset(defaultQuestionValues);
  });

  const saveAll = async () => {
    if (!drafts.length && !savedQuestions.length) {
      onError('Add at least one question before continuing.');
      return;
    }
    setSaving(true);
    onError('');
    try {
      const created = drafts.length ? await api.bulkCreateQuestions(token, drafts) : [];
      const merged = [...savedQuestions, ...created];
      const mergedIds = Array.from(new Set([...(test.questions ?? []), ...merged.map((question) => question.id)]));
      const updated = await api.updateTest(token, test.id, {
        questions: mergedIds,
        total_questions: mergedIds.length,
        total_marks: mergedIds.length * test.correct_marks,
      });
      setSavedQuestions(merged);
      setDrafts([]);
      onSaved(updated, merged);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to save questions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Question Builder"
        title="Add MCQ Questions"
        action={
          <button className="secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Test Details
          </button>
        }
      />

      <section className="test-summary">
        <strong>{test.name}</strong>
        <span>{test.subject}</span>
        <span>{test.difficulty}</span>
        <span>
          {test.correct_marks} / {test.wrong_marks} / {test.unattempt_marks}
        </span>
      </section>

      <div className="builder-layout">
        <form className="panel form-grid" onSubmit={addQuestion}>
          <Field label="Question Text" error={errors.question?.message}>
            <textarea {...register('question', { required: 'Question text is required' })} placeholder="Type the question" />
          </Field>
          <div className="options-grid">
            {(['option1', 'option2', 'option3', 'option4'] as const).map((option, index) => (
              <Field key={option} label={`Option ${index + 1}`} error={errors[option]?.message}>
                <input {...register(option, { required: `Option ${index + 1} is required` })} />
              </Field>
            ))}
          </div>
          <div className="two-column">
            <Field label="Correct Option">
              <select {...register('correct_option')}>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
                <option value="option4">Option 4</option>
              </select>
            </Field>
            <Field label="Difficulty">
              <select {...register('difficulty')}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </Field>
            <Field label="Topic">
              <select disabled={loadingTopics} {...register('topic')}>
                <option value="">{loadingTopics ? 'Loading topics...' : 'Optional topic'}</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sub-topic">
              <select disabled={!selectedTopic || loadingSubTopics} {...register('sub_topic')}>
                <option value="">{loadingSubTopics ? 'Loading sub-topics...' : 'Optional sub-topic'}</option>
                {subTopics.map((subTopic) => (
                  <option key={subTopic.id} value={subTopic.id}>
                    {subTopic.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Explanation">
            <textarea {...register('explanation')} placeholder="Optional explanation" />
          </Field>
          <Field label="Media URL">
            <input {...register('media_url')} placeholder="https://..." />
          </Field>
          <div className="form-actions">
            <button className="secondary" type="button" onClick={() => reset(defaultQuestionValues)}>
              Clear
            </button>
            <button className="primary" type="submit" disabled={saving}>
              {editingIndex === null ? 'Add Another Question' : 'Update Question'}
            </button>
          </div>
        </form>

        <section className="panel question-list">
          <div className="panel-toolbar">
            <h2>Added Questions</h2>
            <span>{savedQuestions.length + drafts.length} total</span>
          </div>
          {[...savedQuestions, ...drafts].map((question, index) => (
            <article key={isSavedQuestion(question) ? question.id : `${question.question}-${index}`} className="question-card">
              <strong>{question.question}</strong>
              <small>Correct: {question.correct_option.replace('option', 'Option ')}</small>
              {'id' in question ? (
                <span className="status live">saved</span>
              ) : (
                <div className="row-actions">
                  <button
                    title="Edit draft"
                    onClick={() => {
                      const draftIndex = index - savedQuestions.length;
                      setEditingIndex(draftIndex);
                      reset(drafts[draftIndex]);
                    }}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    title="Delete draft"
                    onClick={() => setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index - savedQuestions.length))}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </article>
          ))}
          {!savedQuestions.length && !drafts.length && <div className="empty">No questions added yet.</div>}
          <button className="primary wide" disabled={saving} onClick={saveAll}>
            {saving ? <Spinner size="sm" /> : <CheckCircle2 size={16} />} Save & Continue
          </button>
        </section>
      </div>
    </>
  );
}
