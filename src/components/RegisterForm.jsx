import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkIsMobile() {
      setIsMobile(window.innerWidth <= 600);
    }
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!upiId) {
      setError("UPI ID is required");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, upiId);
      setSuccess(true);
      navigate('/listings');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #e3eafc 0%, #2563eb 100%)',
      position: 'relative',
      overflow: 'hidden',
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
        opacity: 0.22,
        zIndex: 0,
      }} />
      <form onSubmit={handleSubmit} style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: isMobile ? 340 : 400,
        width: '100%',
        background: 'rgba(255,255,255,0.93)',
        padding: isMobile ? '1.2rem 0.5rem' : '2.7rem 2.2rem',
        borderRadius: isMobile ? 18 : 28,
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: 18, fontWeight: 900, fontSize: isMobile ? '1.3rem' : '2.1rem', letterSpacing: '-1px' }}>Register</h2>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: isMobile ? 16 : 18, padding: isMobile ? 12 : 14, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: isMobile ? 16 : 18, padding: isMobile ? 12 : 14, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm Password"
          required
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: isMobile ? 16 : 18, padding: isMobile ? 12 : 14, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <input
          type="text"
          value={upiId}
          onChange={e => setUpiId(e.target.value)}
          placeholder="UPI ID (e.g., demo@upi)"
          required
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: isMobile ? 16 : 18, padding: isMobile ? 12 : 14, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <button type="submit" disabled={loading} style={{
          width: "100%",
          fontSize: isMobile ? 18 : 20,
          fontWeight: 800,
          padding: isMobile ? '0.9rem 0' : '1.3rem 0',
          borderRadius: 999,
          background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
          color: '#fff',
          border: 'none',
          marginTop: 8,
          boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
          cursor: 'pointer',
          letterSpacing: '0.5px',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 40%, #60a5fa 100%)'}
        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)'}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {error && <div style={{ color: "#ef4444", marginTop: 12, fontWeight: 500 }}>{error}</div>}
        {success && <div style={{ color: "#10b981", marginTop: 12, fontWeight: 500 }}>Registration successful! You can now log in.</div>}
      </form>
    </div>
  );
} 