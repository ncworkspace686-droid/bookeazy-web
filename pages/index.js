export default function Home() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: '#F5F6FF',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
        }}>
          <span style={{ fontSize: 24 }}>📅</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1E1B4B', margin: '0 0 8px' }}>
          BookEazy
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>
          Online appointment booking for Indian businesses
        </p>
      </div>
    </div>
  );
}
