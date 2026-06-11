import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../api';
import { defaultLoginValues, testTubeImage } from '../constants';
import { Session } from '../types';

export function LoginPage({ onLogin }: { onLogin: (session: Session) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ userId: string; password: string }>({
    defaultValues: defaultLoginValues,
  });

  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError('');
    try {
      onLogin(await api.login(values.userId, values.password));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <main className="login-page">
      <section className="login-art">
        <img src={testTubeImage} alt="" />
      </section>
      <section className="login-panel">
        <form onSubmit={submit} className="login-form">
          <div className="brand-word">PrepRoute</div>
          <div>
            <h1>Login</h1>
            <p>Use your company provided Login credentials</p>
          </div>
          <label>
            User ID
            <input placeholder="Enter User ID" {...register('userId', { required: 'User ID is required' })} />
            {errors.userId && <span className="field-error">{errors.userId.message}</span>}
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Enter Password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </label>
          <button className="primary wide" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="notice error">{error}</div>}
        </form>
      </section>
    </main>
  );
}
