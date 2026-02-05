import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const nav = useNavigate();

  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { accessToken } = await login(email, password);
      localStorage.setItem('token', accessToken);
      onLogin();
      nav('/student/profile'); // или '/admin/groups'
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '120px auto' }}>
      <h2>Вход</h2>

      <form onSubmit={submit}>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button disabled={loading}>{loading ? 'Входим…' : 'Войти'}</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
}
