import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeacherApi } from '../../api/teacher';

export default function TeacherGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    TeacherApi.groups()
      .then(setGroups)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="student-root">Загрузка…</div>;
  }

  return (
    <div className="student-root">
      <h1 className="student-title">Мои группы</h1>

      <div className="student-grid">
        {groups.map(g => (
          <div
            key={g.id}
            className="student-card student-card--blue"
            style={{ cursor: 'pointer' }}
            onClick={() => nav(`/teacher/groups/${g.id}`)}
          >
            <div className="student-card-title">{g.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
