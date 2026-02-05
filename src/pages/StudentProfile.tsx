import { useEffect, useState } from 'react';
import { StudentApi } from '../api/student';
import ChangePassword from './ChangePassword';
import { useAuth } from '../context/AuthContext';

type Profile = {
  email: string;
  role: 'STUDENT';
  balance: number;
  mustChangePassword: boolean;
  group: { id: string; name: string } | null;
};

export default function StudentProfile() {
    const { setRole } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    
      console.log('[StudentProfile] load() start');
    setLoading(true);
    const data = await StudentApi.me();
      console.log('[StudentProfile] profile data:', data);
          setRole(data.role);
    setProfile(data);

    setLoading(false);
    
  }

  useEffect(() => {
      console.log('[StudentProfile] mounted');
    load();
  }, []);

  if (loading) {
    return <div className="student-root">Загрузка…</div>;
  }

  if (!profile) {
    return <div className="student-root">Ошибка профиля</div>;
  }

  // 🔒 БЛОКИРОВКА ПРОФИЛЯ
  if (profile.mustChangePassword) {
    return <ChangePassword onDone={load} />;
  }

  // ✅ НОРМАЛЬНЫЙ ПРОФИЛЬ
  return (
    <div className="student-root">
      <div className="student-header">
        <h1 className="student-title">Профиль ученика</h1>
        <div className="student-subtitle">{profile.email}</div>
      </div>

      <div className="student-grid">
        <div className="student-card student-card--pink">
          Баланс: {profile.balance} ⭐
        </div>

        <div className="student-card student-card--green">
          Группа: {profile.group?.name ?? 'Не назначена'}
        </div>

        <div className="student-card student-card--blue">
          Роль: {profile.role}
        </div>
      </div>
    </div>
  );
}
