import { useEffect, useState } from 'react';
import { ClipboardList, LogOut, Plus } from 'lucide-react';
import { api } from './api';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { PreviewPublish } from './components/PreviewPublish';
import { QuestionBuilder } from './components/QuestionBuilder';
import { TestEditor } from './components/TestEditor';
import { Question, Session, Subject, Test } from './types';
import { upsertTest } from './utils';

type View = 'dashboard' | 'test-form' | 'questions' | 'preview';

export function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem('preproute-session');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState<View>('dashboard');
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notice, setNotice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);

  const saveSession = (next: Session | null) => {
    setSession(next);
    if (next) localStorage.setItem('preproute-session', JSON.stringify(next));
    else localStorage.removeItem('preproute-session');
  };

  const loadCoreData = async (token = session?.token) => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [subjectList, testList] = await Promise.all([api.subjects(token), api.tests(token)]);
      setSubjects(subjectList);
      setTests(testList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoreData();
  }, [session?.token]);

  const openCreate = () => {
    setActiveTest(null);
    setQuestions([]);
    setView('test-form');
    setNotice('');
    setError('');
  };

  const openEdit = (test: Test) => {
    setActiveTest(test);
    setQuestions([]);
    setView('test-form');
    setNotice('');
    setError('');
  };

  const openQuestions = async (test: Test) => {
    setActiveTest(test);
    setQuestions([]);
    setView('questions');
    setNotice('');
    setError('');
    if (!session?.token || !test.questions?.length) return;

    setLoading(true);
    try {
      setQuestions(await api.fetchQuestions(session.token, test.questions));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch existing questions');
    } finally {
      setLoading(false);
    }
  };

  const openPreview = async (test: Test) => {
    setActiveTest(test);
    setView('preview');
    setNotice('');
    setError('');
    if (!session?.token || !test.questions?.length) {
      setQuestions([]);
      return;
    }

    setLoading(true);
    try {
      setQuestions(await api.fetchQuestions(session.token, test.questions));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch saved questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteTest = async (test: Test) => {
    if (!session?.token) return;
    const snapshot = tests;
    setDeletingTestId(test.id);
    setTests((current) => current.filter((item) => item.id !== test.id));
    setNotice('Test removed from the dashboard.');
    try {
      await api.deleteTest(session.token, test.id);
    } catch {
      setTests(snapshot);
      setError('The backend did not accept delete for this test, so it was restored.');
    } finally {
      setDeletingTestId(null);
    }
  };

  const logout = () => {
    saveSession(null);
    setTests([]);
    setActiveTest(null);
    setQuestions([]);
    setView('dashboard');
  };

  if (!session) return <LoginPage onLogin={saveSession} />;

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="logo-mark">PrepRoute</div>
        <nav>
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
            <ClipboardList size={18} /> Tests
          </button>
          <button onClick={openCreate}>
            <Plus size={18} /> Create Test
          </button>
        </nav>
        <div className="user-box">
          <span>Signed in as</span>
          <strong>{session.user.name}</strong>
          <small>{session.user.userId}</small>
        </div>
        <button className="icon-text danger" onClick={logout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="workspace">
        {notice && <div className="notice success">{notice}</div>}
        {error && <div className="notice error">{error}</div>}

        {view === 'dashboard' && (
          <Dashboard
            tests={tests}
            loading={loading}
            deletingTestId={deletingTestId}
            onCreate={openCreate}
            onRefresh={() => loadCoreData()}
            onEdit={openEdit}
            onQuestions={openQuestions}
            onPreview={openPreview}
            onDelete={deleteTest}
          />
        )}

        {view === 'test-form' && (
          <TestEditor
            token={session.token}
            subjects={subjects}
            test={activeTest}
            onCancel={() => setView('dashboard')}
            onSaved={(test, next) => {
              setActiveTest(test);
              setTests((current) => upsertTest(current, test));
              setNotice(next === 'questions' ? 'Draft saved. Add at least one MCQ to continue.' : 'Test saved as draft.');
              setView(next === 'questions' ? 'questions' : 'dashboard');
            }}
            onError={setError}
          />
        )}

        {view === 'questions' && activeTest && (
          <QuestionBuilder
            token={session.token}
            test={activeTest}
            subjects={subjects}
            seedQuestions={questions}
            onBack={() => setView('test-form')}
            onSaved={(updatedTest, savedQuestions) => {
              setActiveTest(updatedTest);
              setQuestions(savedQuestions);
              setTests((current) => upsertTest(current, updatedTest));
              setNotice('Questions saved. Review the paper before publishing.');
              setView('preview');
            }}
            onError={setError}
          />
        )}

        {view === 'preview' && activeTest && (
          <PreviewPublish
            token={session.token}
            test={activeTest}
            questions={questions}
            loading={loading}
            onBackToQuestions={() => setView('questions')}
            onEditTest={() => setView('test-form')}
            onPublished={(published) => {
              setActiveTest(published);
              setTests((current) => upsertTest(current, published));
              setNotice('Test published successfully.');
              setView('dashboard');
            }}
            onError={setError}
          />
        )}
      </main>
    </div>
  );
}
