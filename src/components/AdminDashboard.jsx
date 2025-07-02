import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "orders"));
        const allOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(allOrders.filter(o => o.status === "pending_admin"));
      } catch {
        setOrders([]);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpdate = async (orderId, status) => {
    setActionLoading(orderId + status);
    await updateDoc(doc(db, "orders", orderId), { status });
    setOrders(orders => orders.filter(o => o.id !== orderId));
    setActionLoading("");
  };

  if (!userProfile || userProfile.role !== "admin") return null;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      padding: '2rem 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 800,
        width: '100%',
        background: 'rgba(255,255,255,0.97)',
        padding: '2.5rem 2rem',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: 24, fontWeight: 900, fontSize: '2rem', letterSpacing: '-1px' }}>Admin Dashboard</h2>
        {loading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ color: '#64748b', fontWeight: 500 }}>No pending payments for review.</div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{ marginBottom: 32, padding: 20, border: '1.5px solid #c7d2fe', borderRadius: 14, background: '#f8fafc', boxShadow: '0 2px 8px rgba(37,99,235,0.06)' }}>
              <div style={{ color: '#1e293b', fontSize: 16 }}><strong>Order ID:</strong> {order.id}</div>
              <div style={{ color: '#334155' }}><strong>Buyer ID:</strong> {order.buyerId}</div>
              <div style={{ color: '#334155' }}><strong>Seller ID:</strong> {order.sellerId}</div>
              <div style={{ color: '#334155' }}><strong>Listing ID:</strong> {order.listingId}</div>
              {order.transactionId && (
                <div style={{ color: '#334155' }}><strong>Transaction ID:</strong> {order.transactionId}</div>
              )}
              {order.paymentScreenshotUrl && (
                <div style={{ margin: '12px 0' }}>
                  <strong style={{ color: '#334155' }}>Payment Screenshot:</strong><br />
                  <a href={order.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                    <img src={order.paymentScreenshotUrl} alt="Payment Screenshot" style={{ maxWidth: 220, maxHeight: 220, borderRadius: 8, marginTop: 6, border: '1.5px solid #c7d2fe' }} />
                  </a>
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={() => handleUpdate(order.id, 'confirmed')}
                  disabled={actionLoading === order.id + 'confirmed'}
                  style={{
                    marginRight: 8,
                    background: 'linear-gradient(90deg, #10b981 60%, #34d399 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    padding: '8px 24px',
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: actionLoading === order.id + 'confirmed' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
                    letterSpacing: '0.5px',
                    transition: 'background 0.2s',
                  }}
                >
                  {actionLoading === order.id + 'confirmed' ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleUpdate(order.id, 'rejected')}
                  disabled={actionLoading === order.id + 'rejected'}
                  style={{
                    background: 'linear-gradient(90deg, #ef4444 60%, #f87171 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    padding: '8px 24px',
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: actionLoading === order.id + 'rejected' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.08)',
                    letterSpacing: '0.5px',
                    transition: 'background 0.2s',
                  }}
                >
                  {actionLoading === order.id + 'rejected' ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 