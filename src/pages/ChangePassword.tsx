 import { useState } from 'react';
import { StudentApi } from '../api/student';

export default function ChangePassword({
  onDone,
}: {
  onDone: () => void;
}) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await StudentApi.changePassword(password);
      onDone();
    } catch (e: any) {
      setError(e.message ?? 'Ошибка смены пароля');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="student-root">
      <div className="student-header">
        <h1 className="student-title">Смена пароля</h1>
        <div className="student-subtitle">
          Это ваш первый вход. Задайте новый пароль.
        </div>
      </div>

      <form
        onSubmit={submit}
        style={{
          maxWidth: 360,
          margin: '0 auto',
          background: 'rgba(255,255,255,.8)',
          padding: 20,
          borderRadius: 16,
        }}
      >
        <input
          type="password"
          placeholder="Новый пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 12 }}
        />

        <button disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Сохраняем…' : 'Сохранить пароль'}
        </button>

        {error && (
          <div style={{ color: 'red', marginTop: 10 }}>{error}</div>
        )}
      </form>
    </div>
  );
}
