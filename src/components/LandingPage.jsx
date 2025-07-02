import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 600);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #e3eafc 0%, #2563eb 100%)',
      flexDirection: isMobile ? 'column' : 'row',
      padding: isMobile ? '1rem 0.2rem' : '0',
    }}>
      {/* Blurred blue accent shape */}
      <div style={{
        position: 'absolute',
        top: isMobile ? '-60px' : '-100px',
        right: isMobile ? '-60px' : '-120px',
        width: isMobile ? 220 : 380,
        height: isMobile ? 220 : 380,
        background: 'radial-gradient(circle at 60% 40%, #2563eb 60%, #60a5fa 100%)',
        filter: 'blur(90px)',
        opacity: 0.25,
        zIndex: 0,
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: isMobile ? 340 : 500,
        width: '100%',
        padding: isMobile ? '1.2rem 0.5rem' : '3.2rem 2.2rem',
        borderRadius: isMobile ? 18 : 28,
        background: 'rgba(255,255,255,0.90)',
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
        backdropFilter: 'blur(6px)',
        textAlign: 'center',
      }}>
        {/* Blue accent icon */}
        <h1 style={{ fontSize: isMobile ? '1.3rem' : '2.7rem', fontWeight: 900, marginBottom: 14, color: '#1e293b', letterSpacing: '-1px', lineHeight: 1.1, textAlign: isMobile ? 'center' : undefined }}>
          Welcome to <span style={{ color: '#2563eb' }}>SubletX</span>
        </h1>
        <h2 style={{ color: '#2563eb', fontWeight: 500, fontSize: isMobile ? '1rem' : '1.22rem', marginBottom: 26 }}>
          Secure, temporary access to digital subscriptions—made easy.
        </h2>
        <p style={{ fontSize: isMobile ? '0.98rem' : '1.08rem', color: '#334155', marginBottom: 36, lineHeight: 1.6 }}>
          Rent, share, or sublet digital subscriptions (like Netflix, Canva, Adobe, and more) securely and affordably. Perfect for students, freelancers, and creators who need premium tools—just for when you need them.
        </p>
        <button
          style={{
            background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: isMobile ? '0.9rem 0' : '1.1rem 2.7rem',
            fontSize: isMobile ? '1.1rem' : '1.18rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(37,99,235,0.10)',
            transition: 'background 0.2s',
            letterSpacing: '0.5px',
            width: isMobile ? '100%' : undefined,
            marginTop: isMobile ? '1.2rem' : undefined,
          }}
          onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 40%, #60a5fa 100%)'}
          onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)'}
          onClick={() => navigate('/register')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
} 