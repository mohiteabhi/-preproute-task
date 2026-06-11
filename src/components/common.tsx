import { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {action}
    </header>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return <span className={`spinner ${size}`} aria-hidden="true" />;
}

export function InlineLoader({ label }: { label: string }) {
  return (
    <span className="inline-loader" role="status">
      <Spinner size="sm" />
      {label}
    </span>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="loading-block" role="status">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function TableLoader() {
  return (
    <div className="table-loader" role="status" aria-label="Loading tests">
      {Array.from({ length: 4 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
