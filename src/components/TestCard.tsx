export default function TestCard() {
  return (
    <div style={card}>
      <h2>Пробный тест</h2>
      <p>Проверь свои знания</p>
      <button style={button}>Пройти тест</button>
    </div>
  );
}

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
};

const button = {
  marginTop: 16,
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
};
