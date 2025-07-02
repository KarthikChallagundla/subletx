import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

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
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
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
        opacity: 0.18,
        zIndex: 0,
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 600,
        width: '100%',
        background: 'rgba(255,255,255,0.97)',
        padding: '3.2rem 2.5rem',
        borderRadius: 32,
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
        marginTop: 32,
        marginBottom: 32,
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: 32, fontWeight: 900, fontSize: '2.4rem', letterSpacing: '-1.5px', textAlign: 'center' }}>Profile</h2>
        {['email', 'displayName', 'upiId'].map(field => (
          <div key={field} style={{ marginBottom: 28, display: 'flex', alignItems: 'center', fontSize: 18 }}>
            <strong style={{ textTransform: 'capitalize', color: '#1e293b', minWidth: 120 }}>{field === 'upiId' ? 'UPI ID' : field}</strong>:
            {editField === field ? (
              <>
                <input
                  type="text"
                  value={fieldValue}
                  onChange={e => setFieldValue(e.target.value)}
                  style={{ marginLeft: 16, fontSize: 17, padding: 12, width: 220, borderRadius: 12, border: '1.5px solid #c7d2fe', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
                  disabled={loading}
                />
                <button onClick={handleSave} disabled={loading} style={{ marginLeft: 12, padding: '10px 22px', borderRadius: 999, background: 'linear-gradient(90deg, #10b981 60%, #34d399 100%)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s' }}>Save</button>
                <button onClick={() => setEditField("")} disabled={loading} style={{ marginLeft: 8, padding: '10px 22px', borderRadius: 999, background: '#aaa', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px', transition: 'background 0.2s' }}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ marginLeft: 16, color: '#334155', fontSize: 17 }}>{profile[field] || '-'}</span>
                <button onClick={() => handleEdit(field)} style={{ marginLeft: 18, padding: '10px 22px', borderRadius: 999, background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s' }}>Edit</button>
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