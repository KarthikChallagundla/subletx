import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FaPencilAlt } from 'react-icons/fa';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editField, setEditField] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      setLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setProfile(snap.data());
        }
      } catch (err) {
        setError("Failed to fetch profile");
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 600);
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleEdit = (field) => {
    setEditField(field);
    setFieldValue(profile[field] || "");
    setSuccess("");
    setError("");
  };

  const handleSave = async () => {
    if (!editField) return;
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { [editField]: fieldValue });
      setProfile(prev => ({ ...prev, [editField]: fieldValue }));
      setEditField("");
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
    }
    setLoading(false);
  };

  if (!user) return null;
  if (!profile) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>Loading...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(120deg, #e3eafc 0%, #2563eb 100%)',
      position: 'relative',
      overflow: 'hidden',
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
        opacity: 0.18,
        zIndex: 0,
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: isMobile ? 340 : 600,
        width: '100%',
        background: 'rgba(255,255,255,0.97)',
        padding: isMobile ? '1.2rem 0.5rem' : '3.2rem 2.5rem',
        borderRadius: isMobile ? 18 : 32,
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
        marginTop: isMobile ? 16 : 32,
        marginBottom: isMobile ? 16 : 32,
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: isMobile ? 18 : 32, fontWeight: 900, fontSize: isMobile ? '1.3rem' : '2.4rem', letterSpacing: '-1.5px', textAlign: 'center' }}>Profile</h2>
        {['email', 'displayName', 'upiId'].map(field => (
          <div key={field} style={{ marginBottom: isMobile ? 16 : 28, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', fontSize: isMobile ? 15 : 18 }}>
            <strong style={{ textTransform: 'capitalize', color: '#1e293b', minWidth: isMobile ? 90 : 120 }}>{field === 'upiId' ? 'UPI ID' : field}</strong>:
            {editField === field ? (
              <>
                <input
                  type="text"
                  value={fieldValue}
                  onChange={e => setFieldValue(e.target.value)}
                  style={{ marginLeft: isMobile ? 0 : 16, marginTop: isMobile ? 8 : 0, fontSize: isMobile ? 15 : 17, padding: isMobile ? 9 : 12, width: isMobile ? '100%' : 220, borderRadius: 12, border: '1.5px solid #c7d2fe', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
                  disabled={loading}
                />
                <button onClick={handleSave} disabled={loading} style={{ marginLeft: isMobile ? 0 : 12, marginTop: isMobile ? 8 : 0, padding: isMobile ? '8px 16px' : '10px 22px', borderRadius: 999, background: 'linear-gradient(90deg, #10b981 60%, #34d399 100%)', color: '#fff', border: 'none', fontWeight: 800, fontSize: isMobile ? 14 : 16, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s', width: isMobile ? '100%' : undefined }}>Save</button>
                <button onClick={() => setEditField("")} disabled={loading} style={{ marginLeft: isMobile ? 0 : 8, marginTop: isMobile ? 8 : 0, padding: isMobile ? '8px 16px' : '10px 22px', borderRadius: 999, background: '#aaa', color: '#fff', border: 'none', fontWeight: 800, fontSize: isMobile ? 14 : 16, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px', transition: 'background 0.2s', width: isMobile ? '100%' : undefined }}>Cancel</button>
              </>
            ) : (
              <>
                {isMobile ? (
                  <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                    <span style={{ color: '#334155', fontSize: 15 }}>{profile[field] || '-'}</span>
                    <button onClick={() => handleEdit(field)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 22, color: '#2563eb', display: 'flex', alignItems: 'center', marginLeft: 8 }} aria-label={`Edit ${field}`}>
                      <FaPencilAlt />
                    </button>
                  </span>
                ) : (
                  <>
                    <span style={{ marginLeft: 16, color: '#334155', fontSize: 17 }}>{profile[field] || '-'}</span>
                    <button onClick={() => handleEdit(field)} style={{ marginLeft: 18, marginTop: 0, padding: '10px 22px', borderRadius: 999, background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s', width: undefined }}>Edit</button>
                  </>
                )}
              </>
            )}
          </div>
        ))}
        {error && <div style={{ color: 'red', marginTop: 16, fontWeight: 500, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 16, fontWeight: 500, textAlign: 'center' }}>{success}</div>}
      </div>
    </div>
  );
} 