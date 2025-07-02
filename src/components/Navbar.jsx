import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navLinks = [
    { to: "/listings", label: "Listings" },
    ...(user ? [
      { to: "/orders", label: "Orders" },
      { to: "/manage-listings", label: "Manage Listings" },
      { to: "/profile", label: "Profile" },
    ] : [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" },
    ])
  ];
  return (
    <nav style={{
      width: '100%',
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
      borderBottom: 'none',
      borderRadius: 0,
      boxShadow: '0 2px 12px rgba(37,99,235,0.08)',
      marginBottom: 0,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.1rem 2.2rem',
        flexWrap: 'wrap',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <Link to="/" style={{ fontWeight: 800, fontSize: '1.35rem', color: '#fff', textDecoration: 'none', letterSpacing: '-1px' }}>
          SubletX
        </Link>
        <button
          onClick={() => setOpen(!open)}
          style={{ display: 'none', background: 'none', border: 'none', fontSize: 28, color: '#fff', cursor: 'pointer' }}
          className="navbar-toggle"
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <div
          className="navbar-links"
          style={{
            display: '', // let CSS handle display
          }}
        >
          {navLinks.map(link => (
            (link.to !== "/manage-listings" || userProfile?.role !== 'admin') && (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  textDecoration: 'none',
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: '1.08rem',
                  padding: '7px 18px',
                  borderRadius: 8,
                  background: location.pathname === link.to ? 'rgba(255,255,255,0.13)' : 'none',
                  transition: 'background 0.18s',
                  display: 'block',
                }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            )
          ))}
          {userProfile?.role === 'admin' && (
            <Link
              to="/admin"
              style={{
                textDecoration: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.08rem',
                padding: '7px 18px',
                borderRadius: 8,
                background: location.pathname === '/admin' ? 'rgba(255,255,255,0.13)' : 'none',
                transition: 'background 0.18s',
                border: '2px solid #fff',
                marginLeft: 8,
                display: 'block',
              }}
              onClick={() => setOpen(false)}
            >
              Admin
            </Link>
          )}
          {user && (
            <button
              onClick={async () => {
                await logout();
                navigate('/');
                setOpen(false);
              }}
              style={{ background: 'rgba(255,255,255,0.13)', border: 'none', color: '#fff', borderRadius: 8, padding: '7px 18px', fontWeight: 500, fontSize: '1.08rem', cursor: 'pointer', marginLeft: 8, display: 'block' }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
      <style>{`
        @media (min-width: 601px) {
          .navbar-links {
            display: flex !important;
            flex-direction: row !important;
            gap: 22px;
            align-items: center;
            position: static !important;
            background: none !important;
            box-shadow: none !important;
            width: auto !important;
            padding: 0 !important;
          }
          .navbar-toggle {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          .navbar-links {
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
            display: ${open ? 'flex' : 'none'} !important;
            background: linear-gradient(90deg, #2563eb 60%, #60a5fa 100%);
            padding: 1rem 0;
            position: absolute;
            top: 100%;
            left: 0;
            border-radius: 0 0 18px 18px;
            box-shadow: 0 4px 16px rgba(37,99,235,0.10);
          }
          .navbar-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
} 