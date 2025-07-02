import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function ManageListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newListing, setNewListing] = useState({
    serviceName: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    tags: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    if (!user) return;
    async function fetchListings() {
      setLoading(true);
      try {
        const q = query(collection(db, 'listings'), where('ownerId', '==', user.uid));
        const snap = await getDocs(q);
        setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {
        setListings([]);
      }
      setLoading(false);
    }
    fetchListings();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleEdit = (listing) => {
    setEditId(listing.id);
    setEditData({ ...listing });
    setError('');
    setSuccess('');
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const { id, ...data } = editData;
      await updateDoc(doc(db, 'listings', id), data);
      setListings(listings => listings.map(l => l.id === id ? { ...l, ...data } : l));
      setEditId(null);
      setSuccess('Listing updated!');
    } catch {
      setError('Failed to update listing.');
    }
    setActionLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await deleteDoc(doc(db, 'listings', id));
      setListings(listings => listings.filter(l => l.id !== id));
      setSuccess('Listing deleted.');
    } catch {
      setError('Failed to delete listing.');
    }
    setActionLoading(false);
  };

  const handleNewListingChange = (field, value) => {
    setNewListing(prev => ({ ...prev, [field]: value }));
  };

  const handleAddListing = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');
    setSuccess('');
    try {
      const docRef = await addDoc(collection(db, 'listings'), {
        serviceName: newListing.serviceName,
        description: newListing.description,
        price: Number(newListing.price),
        duration: Number(newListing.duration),
        category: newListing.category,
        tags: newListing.tags.split(',').map(t => t.trim()).filter(Boolean),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });
      setListings(listings => [
        { id: docRef.id, ...newListing, price: Number(newListing.price), duration: Number(newListing.duration), tags: newListing.tags.split(',').map(t => t.trim()).filter(Boolean), ownerId: user.uid },
        ...listings
      ]);
      setNewListing({ serviceName: '', description: '', price: '', duration: '', category: '', tags: '' });
      setSuccess('Listing added!');
    } catch {
      setError('Failed to add listing.');
    }
    setAddLoading(false);
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(120deg, #e3eafc 0%, #2563eb 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: isMobile ? '1rem 0.2rem' : '0' }}>
      <div style={{ position: 'absolute', top: isMobile ? '-60px' : '-100px', right: isMobile ? '-60px' : '-120px', width: isMobile ? 220 : 380, height: isMobile ? 220 : 380, background: 'radial-gradient(circle at 60% 40%, #2563eb 60%, #60a5fa 100%)', filter: 'blur(90px)', opacity: 0.18, zIndex: 0 }} />
      <div style={{ maxWidth: isMobile ? 360 : 900, width: '100%', background: 'rgba(255,255,255,0.97)', borderRadius: isMobile ? 18 : 28, boxShadow: '0 8px 32px rgba(37,99,235,0.10)', padding: isMobile ? '1.2rem 0.5rem' : '2.5rem 2rem', marginTop: 40, zIndex: 1 }}>
        <h2 style={{ color: '#2563eb', fontWeight: 900, fontSize: isMobile ? '1.3rem' : '2.2rem', marginBottom: 18, letterSpacing: '-1px', textAlign: 'center' }}>Manage Listings</h2>
        <button
          onClick={() => navigate('/list')}
          style={{
            display: 'block',
            margin: '0 auto 32px auto',
            background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: isMobile ? '10px 18px' : '12px 38px',
            fontWeight: 800,
            fontSize: isMobile ? 15 : 18,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
            letterSpacing: '0.5px',
            marginBottom: 32,
            width: isMobile ? '100%' : undefined
          }}
        >
          Create Listing
        </button>
        {loading ? (
          <div>Loading...</div>
        ) : listings.length === 0 ? (
          <div style={{ color: '#64748b', fontWeight: 500, fontSize: isMobile ? 15 : 18, margin: '2rem 0' }}>No listings found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 24 }}>
            {listings.map(listing => (
              <div key={listing.id} style={{ background: 'rgba(243,244,246,0.95)', borderRadius: isMobile ? 12 : 16, boxShadow: '0 2px 12px rgba(37,99,235,0.08)', padding: isMobile ? 12 : 22, border: '1.5px solid #c7d2fe', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {editId === listing.id ? (
                  <>
                    <input
                      value={editData.serviceName || ''}
                      onChange={e => handleEditChange('serviceName', e.target.value)}
                      placeholder="Service Name"
                      style={{ marginBottom: 8, fontSize: isMobile ? 14 : 16, padding: isMobile ? 8 : 10, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111' }}
                    />
                    <textarea
                      value={editData.description || ''}
                      onChange={e => handleEditChange('description', e.target.value)}
                      placeholder="Description"
                      rows={2}
                      style={{ marginBottom: 8, fontSize: isMobile ? 14 : 16, padding: isMobile ? 8 : 10, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111', resize: 'vertical' }}
                    />
                    <input
                      type="number"
                      value={editData.price || ''}
                      onChange={e => handleEditChange('price', e.target.value)}
                      placeholder="Price"
                      style={{ marginBottom: 8, fontSize: isMobile ? 14 : 16, padding: isMobile ? 8 : 10, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111' }}
                    />
                    <input
                      type="number"
                      value={editData.duration || ''}
                      onChange={e => handleEditChange('duration', e.target.value)}
                      placeholder="Duration (days)"
                      style={{ marginBottom: 8, fontSize: isMobile ? 14 : 16, padding: isMobile ? 8 : 10, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111' }}
                    />
                    <input
                      value={editData.category || ''}
                      onChange={e => handleEditChange('category', e.target.value)}
                      placeholder="Category"
                      style={{ marginBottom: 8, fontSize: isMobile ? 14 : 16, padding: isMobile ? 8 : 10, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111' }}
                    />
                    <input
                      value={editData.tags ? editData.tags.join(', ') : ''}
                      onChange={e => handleEditChange('tags', e.target.value.split(',').map(t => t.trim()))}
                      placeholder="Tags (comma separated)"
                      style={{ marginBottom: 8, fontSize: isMobile ? 14 : 16, padding: isMobile ? 8 : 10, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111' }}
                    />
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button onClick={handleSave} disabled={actionLoading} style={{ background: 'linear-gradient(90deg, #10b981 60%, #34d399 100%)', color: '#fff', border: 'none', borderRadius: 999, padding: isMobile ? '7px 18px' : '8px 24px', fontWeight: 800, fontSize: isMobile ? 13 : 15, cursor: actionLoading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s' }}>Save</button>
                      <button onClick={() => setEditId(null)} disabled={actionLoading} style={{ background: '#aaa', color: '#fff', border: 'none', borderRadius: 999, padding: isMobile ? '7px 18px' : '8px 24px', fontWeight: 800, fontSize: isMobile ? 13 : 15, cursor: actionLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px', transition: 'background 0.2s' }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 800, color: '#2563eb', fontSize: isMobile ? 16 : 18 }}>{listing.serviceName}</div>
                    <div style={{ color: '#334155', fontSize: isMobile ? 13 : 15, marginBottom: 4 }}>{listing.description}</div>
                    <div style={{ fontWeight: 700, color: '#2563eb', fontSize: isMobile ? 13 : 15 }}>₹{listing.price} / {listing.duration} day(s)</div>
                    <div style={{ fontSize: isMobile ? 11 : 13, color: '#64748b' }}>Category: {listing.category}</div>
                    {listing.tags && listing.tags.length > 0 && (
                      <div style={{ fontSize: isMobile ? 10 : 12, color: '#888', marginTop: 4 }}>Tags: {listing.tags.join(', ')}</div>
                    )}
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button onClick={() => handleEdit(listing)} style={{ background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)', color: '#fff', border: 'none', borderRadius: 999, padding: isMobile ? '7px 18px' : '8px 24px', fontWeight: 800, fontSize: isMobile ? 13 : 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s' }}>Edit</button>
                      <button onClick={() => handleDelete(listing.id)} style={{ background: 'linear-gradient(90deg, #ef4444 60%, #f87171 100%)', color: '#fff', border: 'none', borderRadius: 999, padding: isMobile ? '7px 18px' : '8px 24px', fontWeight: 800, fontSize: isMobile ? 13 : 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s' }}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {error && <div style={{ color: 'red', marginTop: 16, fontWeight: 500, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 16, fontWeight: 500, textAlign: 'center' }}>{success}</div>}
      </div>
    </div>
  );
} 