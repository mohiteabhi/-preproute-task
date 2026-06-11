import { useMemo, useState } from 'react';
import { BookOpen, Edit3, Eye, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Test } from '../types';
import { formatDate } from '../utils';
import { InlineLoader, Metric, PageHeader, Spinner, TableLoader } from './common';

type DashboardProps = {
  tests: Test[];
  loading: boolean;
  deletingTestId: string | null;
  onCreate: () => void;
  onRefresh: () => void;
  onEdit: (test: Test) => void;
  onQuestions: (test: Test) => void;
  onPreview: (test: Test) => void;
  onDelete: (test: Test) => void;
};

export function Dashboard({
  tests,
  loading,
  deletingTestId,
  onCreate,
  onRefresh,
  onEdit,
  onQuestions,
  onPreview,
  onDelete,
}: DashboardProps) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tests;
    return tests.filter((test) =>
      [test.name, test.subject, test.status ?? 'draft', ...(test.topics ?? [])].join(' ').toLowerCase().includes(needle),
    );
  }, [query, tests]);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="All Tests"
        action={
          <div className="actions">
            <button className="secondary" onClick={onRefresh}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="primary" onClick={onCreate}>
              <Plus size={16} /> Create New Test
            </button>
          </div>
        }
      />

      <section className="metrics">
        <Metric label="Total tests" value={tests.length} />
        <Metric label="Live" value={tests.filter((test) => test.status === 'live').length} />
        <Metric label="Drafts" value={tests.filter((test) => test.status !== 'live').length} />
      </section>

      <section className="panel">
        <div className="panel-toolbar">
          <label className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tests" />
          </label>
          <span>{loading ? <InlineLoader label="Loading tests" /> : `${filtered.length} tests`}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Topics</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !filtered.length && (
                <tr>
                  <td colSpan={6}>
                    <TableLoader />
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((test) => (
                  <tr key={test.id}>
                    <td>
                      <strong>{test.name}</strong>
                      <small>{test.total_questions} questions</small>
                    </td>
                    <td>{test.subject}</td>
                    <td>{test.topics?.join(', ') || 'No topics'}</td>
                    <td>
                      <span className={`status ${test.status === 'live' ? 'live' : 'draft'}`}>
                        {test.status ?? 'draft'}
                      </span>
                    </td>
                    <td>{formatDate(test.created_at)}</td>
                    <td>
                      <div className="row-actions">
                        <button title="Edit test" disabled={deletingTestId === test.id} onClick={() => onEdit(test)}>
                          <Edit3 size={16} />
                        </button>
                        <button
                          title="Add questions"
                          disabled={deletingTestId === test.id}
                          onClick={() => onQuestions(test)}
                        >
                          <BookOpen size={16} />
                        </button>
                        <button title="Preview" disabled={deletingTestId === test.id} onClick={() => onPreview(test)}>
                          <Eye size={16} />
                        </button>
                        <button title="Delete" disabled={deletingTestId === test.id} onClick={() => onDelete(test)}>
                          {deletingTestId === test.id ? <Spinner size="sm" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && !filtered.length && (
                <tr>
                  <td colSpan={6} className="empty">
                    No tests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
