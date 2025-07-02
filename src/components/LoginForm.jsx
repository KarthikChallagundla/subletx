import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
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
    }}>
      {/* Blurred blue accent shape */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-120px',
        width: 380,
        height: 380,
        background: 'radial-gradient(circle at 60% 40%, #2563eb 60%, #60a5fa 100%)',
        filter: 'blur(90px)',
        opacity: 0.22,
        zIndex: 0,
      }} />
      <form onSubmit={handleSubmit} style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 400,
        width: '100%',
        background: 'rgba(255,255,255,0.93)',
        padding: '2.7rem 2.2rem',
        borderRadius: 28,
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: 18, fontWeight: 900, fontSize: '2.1rem', letterSpacing: '-1px' }}>Login</h2>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: 16, padding: 12, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: 16, padding: 12, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <button type="submit" disabled={loading} style={{
          width: "100%",
          fontSize: 18,
          fontWeight: 800,
          padding: '1.1rem 0',
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
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div style={{ color: "#ef4444", marginTop: 12, fontWeight: 500 }}>{error}</div>}
      </form>
    </div>
  );
} 