import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc, addDoc, collection, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';

export default function AccessInstructions({ order, isSeller, isAdmin, currentUserId }) {
  const [link, setLink] = useState(order.accessInstructions || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState(null);
  const [viewed, setViewed] = useState(false);
  const [shared, setShared] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Seller: Share a secret (credential)
  const handleShareSecret = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      // Save secret to Firestore subcollection with expiry (10 min)
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60000));
      await addDoc(collection(db, `orders/${order.id}/secrets`), {
        value: link,
        createdAt: serverTimestamp(),
        expiresAt,
        used: false,
        buyerId: order.buyerId,
      });
      setSuccess('Secret shared securely!');
      setLink('');
      setShared(true);
    } catch {
      setError('Failed to share secret.');
    }
    setLoading(false);
  };

  // Buyer: View the secret (one-time)
  const handleViewSecret = async () => {
    setError('');
    setLoading(true);
    try {
      const secretsSnap = await getDocs(collection(db, `orders/${order.id}/secrets`));
      const secretDoc = secretsSnap.docs.find(doc => !doc.data().used);
      if (!secretDoc) {
        setError('No secret available or already viewed.');
        setLoading(false);
        return;
      }
      const secretVal = secretDoc.data().value;
      setSecret(secretVal);
      setViewed(true);
      // Mark as used
      await updateDoc(doc(db, `orders/${order.id}/secrets/${secretDoc.id}`), { used: true });
    } catch {
      setError('Failed to fetch secret.');
    }
    setLoading(false);
  };

  // Seller UI
  if (isSeller && order.status === 'confirmed') {
    return (
      <form onSubmit={handleShareSecret} style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          value={link}
          onChange={e => setLink(e.target.value)}
          placeholder="Paste credential or access link"
          required
          style={{ width: 260, padding: 10, fontSize: 15, borderRadius: 10, border: '1.5px solid #c7d2fe', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
          disabled={loading || shared}
        />
        <button type="submit" disabled={loading || shared} style={{ padding: '10px 22px', borderRadius: 999, background: 'linear-gradient(90deg, #10b981 60%, #34d399 100%)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: (loading || shared) ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s' }}>
          {loading ? 'Sharing...' : shared ? 'Secret Shared' : 'Share Secret'}
        </button>
        {success && <div style={{ color: 'green', marginTop: 8, fontWeight: 500 }}>{success}</div>}
        {error && <div style={{ color: 'red', marginTop: 8, fontWeight: 500 }}>{error}</div>}
      </form>
    );
  }

  // Buyer UI (not admin)
  if (!isAdmin && !isSeller && order.status === 'confirmed' && currentUserId === order.buyerId) {
    return (
      <div style={{ marginTop: 16 }}>
        {secret ? (
          <div>
            <strong>Secret:</strong> <span style={{ color: '#2563eb', fontWeight: 600 }}>{secret}</span>
            <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>(This secret is now marked as used and cannot be viewed again.)</div>
          </div>
        ) : viewed ? (
          <div style={{ color: 'red', fontWeight: 500 }}>Secret already viewed or expired.</div>
        ) : (
          <button onClick={handleViewSecret} disabled={loading} style={{ padding: '10px 22px', borderRadius: 999, background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s' }}>
            {loading ? 'Loading...' : 'View Secret'}
          </button>
        )}
        {error && <div style={{ color: 'red', marginTop: 8, fontWeight: 500 }}>{error}</div>}
      </div>
    );
  }

  return null;
} 