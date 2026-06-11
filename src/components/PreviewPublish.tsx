import { useState } from 'react';
import { Edit3, Plus, Send } from 'lucide-react';
import { api } from '../api';
import { Question, Test } from '../types';
import { LoadingBlock, Metric, PageHeader, Spinner } from './common';

type PreviewPublishProps = {
  token: string;
  test: Test;
  questions: Question[];
  loading: boolean;
  onBackToQuestions: () => void;
  onEditTest: () => void;
  onPublished: (test: Test) => void;
  onError: (message: string) => void;
};

export function PreviewPublish({
  token,
  test,
  questions,
  loading,
  onBackToQuestions,
  onEditTest,
  onPublished,
  onError,
}: PreviewPublishProps) {
  const [publishing, setPublishing] = useState(false);
  const publish = async () => {
    if (!questions.length && !test.questions?.length) {
      onError('A test needs at least one question before publishing.');
      return;
    }
    setPublishing(true);
    onError('');
    try {
      onPublished(await api.updateTest(token, test.id, { status: 'live' }));
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to publish test');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Preview"
        title="Preview & Publish"
        action={
          <div className="actions">
            <button className="secondary" onClick={onEditTest}>
              <Edit3 size={16} /> Edit Test
            </button>
            <button className="primary" disabled={publishing || loading} onClick={publish}>
              {publishing ? <Spinner size="sm" /> : <Send size={16} />} Publish Test
            </button>
          </div>
        }
      />

      <section className="panel preview">
        <div className="preview-header">
          <div>
            <h2>{test.name}</h2>
            <p>{test.subject}</p>
          </div>
          <span className={`status ${test.status === 'live' ? 'live' : 'draft'}`}>{test.status ?? 'draft'}</span>
        </div>
        <div className="detail-grid">
          <Metric label="Type" value={test.type ?? 'chapterwise'} />
          <Metric label="Difficulty" value={test.difficulty} />
          <Metric label="Duration" value={`${test.total_time} min`} />
          <Metric label="Marks" value={test.total_marks} />
        </div>
        <div className="chips">
          {test.topics?.map((topic) => <span key={topic}>{topic}</span>)}
          {test.sub_topics?.map((subTopic) => <span key={subTopic}>{subTopic}</span>)}
        </div>
      </section>

      <section className="panel question-list">
        <div className="panel-toolbar">
          <h2>Questions</h2>
          <button className="secondary" onClick={onBackToQuestions}>
            <Plus size={16} /> Edit Questions
          </button>
        </div>
        {loading && <LoadingBlock label="Loading questions" />}
        {questions.map((question, index) => (
          <article className="preview-question" key={question.id}>
            <strong>
              {index + 1}. {question.question}
            </strong>
            <ol type="A">
              <li>{question.option1}</li>
              <li>{question.option2}</li>
              <li>{question.option3}</li>
              <li>{question.option4}</li>
            </ol>
            {question.explanation && <p>{question.explanation}</p>}
          </article>
        ))}
        {!questions.length && !loading && <div className="empty">No question details available for preview.</div>}
      </section>
    </>
  );
}
