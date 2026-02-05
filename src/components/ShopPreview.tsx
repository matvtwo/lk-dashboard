export default function ShopPreview() {
  return (
    <div style={card}>
      <h2>Магазин</h2>
      <p>Доступные товары и бонусы</p>
      <ul>
        <li>🎓 Доп. занятие — 50</li>
        <li>📘 Материал недели — 20</li>
        <li>⭐ Индивидуальный разбор — 100</li>
      </ul>
    </div>
  );
}

const card = {
  background: '#fff',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
};
