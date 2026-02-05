import { useState } from 'react';
import { AdminApi } from '../api/admin';

type Props = {
  student: {
    id: string;
    email: string;
    balance: number;
  };
};

export default function StudentCard({ student }: Props) {
  const [email, setEmail] = useState(student.email);
  const [saving, setSaving] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  async function saveEmail() {
    try {
      setSaving(true);
      await AdminApi.changeStudentEmail(student.id, email);
      alert('Логин сохранён');
    } catch (e: any) {
      alert(e.message ?? 'Ошибка');
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword() {
    if (!confirm('Сбросить пароль ученика?')) return;

    try {
      const res = await AdminApi.resetStudentPassword(student.id);
      setTempPassword(res.tempPassword);
    } catch (e: any) {
      alert(e.message ?? 'Ошибка');
    }
  }

  return (
    <div className="student-card student-card--admin">
      <div className="student-card-title">Ученик</div>

      <label>
        Email
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%' }}
        />
      </label>

      <div style={{ marginTop: 10 }}>
        <button onClick={saveEmail} disabled={saving}>
          Сохранить логин
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={resetPassword}>
          Сбросить пароль
        </button>
      </div>

      {tempPassword && (
        <div style={{ marginTop: 12 }}>
          <strong>Временный пароль:</strong>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 2,
              marginTop: 4,
            }}
          >
            {tempPassword}
          </div>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        Баланс: {student.balance}
      </div>
    </div>
  );
}
