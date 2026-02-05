import { useState } from 'react';
import { AdminApi } from '../api/admin';

type Student = {
  id: string;
  email: string;
};

export default function StudentModal({
  student,
  onClose,
  onUpdated,
}: {
  student: Student;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [email, setEmail] = useState(student.email);
  const [loading, setLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveEmail() {
    try {
      setLoading(true);
      setError(null);
      await AdminApi.changeStudentEmail(student.id, email);
      onUpdated();
      alert('Email сохранён');
    } catch (e: any) {
      setError(e.message ?? 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    if (!confirm('Сбросить пароль ученика?')) return;

    try {
      setLoading(true);
      setError(null);
      const res = await AdminApi.resetStudentPassword(student.id);
      setTempPassword(res.tempPassword);
    } catch (e: any) {
      setError(e.message ?? 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 20,
          minWidth: 340,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Ученик</h3>

        {error && (
          <div style={{ color: '#7a0000', marginBottom: 8 }}>
            {error}
          </div>
        )}

        <label>
          Email
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>

        <div style={{ marginTop: 12 }}>
          <button onClick={saveEmail} disabled={loading}>
            Сохранить логин
          </button>
        </div>

        <div style={{ marginTop: 8 }}>
          <button onClick={resetPassword} disabled={loading}>
            Сбросить пароль
          </button>
        </div>

        {tempPassword && (
          <div style={{ marginTop: 12 }}>
            <b>Временный пароль:</b>
            <div style={{ fontSize: 18, letterSpacing: 2 }}>
              {tempPassword}
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
}
