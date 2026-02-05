import { AdminApi } from '../api/admin';

export default function CreateStudent({ onCreated }: { onCreated: () => void }) {
  async function create() {
    const email = prompt('Email ученика');
    if (!email) return;

    try {
      const res = await AdminApi.createStudent(email);
      alert(`Ученик создан:\n${res.email}\nВременный пароль: ${res.tempPassword}`);
      onCreated();
    } catch (err: any) {
      alert(err?.message ?? 'Ошибка создания ученика');
    }
  }

  return (
    <button
      onClick={create}
      style={{
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid #111',
        background: '#fff',
        cursor: 'pointer',
      }}
    >
      + Добавить ученика
    </button>
  );
}
