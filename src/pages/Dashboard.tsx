import BalanceCard from '../components/BalanceCard';
import ShopPreview from '../components/ShopPreview';
import TestCard from '../components/TestCard';

export default function Dashboard() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Личный кабинет ученика</h1>

      <div style={styles.grid}>
        <BalanceCard />
        <ShopPreview />
        <TestCard />
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '40px 24px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  },
  title: {
    marginBottom: 32,
    fontSize: 28,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  },
};
