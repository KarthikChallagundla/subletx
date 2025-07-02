import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import AccessInstructions from "./AccessInstructions";

export default function OrderHistory() {
  const { user, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [processingOrders, setProcessingOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "orders"));
        const allOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(allOrders);
      } catch {
        setOrders([]);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

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

  const handleUpdate = async (orderId, status) => {
    setProcessingOrders(prev => [...prev, orderId]);
    setActionLoading(orderId + status);
    await updateDoc(doc(db, "orders", orderId), { status });
    if (userProfile?.role === 'admin') {
      setOrders(orders => orders.filter(o => o.id !== orderId));
    } else {
      setOrders(orders => orders.map(o => o.id === orderId ? { ...o, status } : o));
    }
    setActionLoading("");
    setProcessingOrders(prev => prev.filter(id => id !== orderId));
  };

  if (!user) return null;
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>Loading...</div>;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      padding: isMobile ? '1rem 0.2rem' : '2rem 0',
      position: 'relative',
      overflow: 'hidden',
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
        opacity: 0.13,
        zIndex: 0,
      }} />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: isMobile ? 360 : 800,
        width: '100%',
        background: 'rgba(255,255,255,0.97)',
        padding: isMobile ? '1.2rem 0.5rem' : '2.5rem 2rem',
        borderRadius: isMobile ? 16 : 24,
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: 24, fontWeight: 900, fontSize: isMobile ? '1.3rem' : '2rem', letterSpacing: '-1px' }}>Order History</h2>
        {orders.length === 0 ? (
          <div style={{ color: '#64748b', fontWeight: 500 }}>No orders found.</div>
        ) : (
          (userProfile?.role === 'admin'
            ? orders
            : orders.filter(order => order.sellerId === user.uid || order.buyerId === user.uid)
          ).map(order => (
            <div key={order.id} style={{ marginBottom: isMobile ? 18 : 32, padding: isMobile ? 12 : 20, border: '1.5px solid #c7d2fe', borderRadius: isMobile ? 10 : 14, background: '#f8fafc', boxShadow: '0 2px 8px rgba(37,99,235,0.06)' }}>
              <div style={{ color: '#1e293b', fontSize: isMobile ? 14 : 16 }}><strong>Order ID:</strong> {order.id}</div>
              <div style={{ color: '#2563eb', fontWeight: 600, fontSize: isMobile ? 14 : 16 }}><strong>Status:</strong> {order.status}</div>
              <div style={{ color: '#334155', fontSize: isMobile ? 13 : 15 }}><strong>Listing ID:</strong> {order.listingId}</div>
              <div style={{ color: '#334155', fontSize: isMobile ? 13 : 15 }}><strong>Buyer ID:</strong> {order.buyerId}</div>
              <div style={{ color: '#334155', fontSize: isMobile ? 13 : 15 }}><strong>Seller ID:</strong> {order.sellerId}</div>
              {order.transactionId && (
                <div style={{ color: '#334155', fontSize: isMobile ? 13 : 15 }}><strong>Transaction ID:</strong> {order.transactionId}</div>
              )}
              {order.paymentScreenshotUrl && (
                <div style={{ margin: '12px 0' }}>
                  <strong style={{ color: '#334155' }}>Payment Screenshot:</strong><br />
                  <a href={order.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                    <img src={order.paymentScreenshotUrl} alt="Payment Screenshot" style={{ maxWidth: isMobile ? 120 : 220, maxHeight: isMobile ? 120 : 220, borderRadius: 8, marginTop: 6, border: '1.5px solid #c7d2fe' }} />
                  </a>
                </div>
              )}
              {/* Admin review controls */}
              {userProfile?.role === 'admin' && (
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => handleUpdate(order.id, 'confirmed')}
                    disabled={processingOrders.includes(order.id)}
                    style={{
                      marginRight: 8,
                      background: 'linear-gradient(90deg, #10b981 60%, #34d399 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 999,
                      padding: isMobile ? '7px 16px' : '8px 24px',
                      fontWeight: 800,
                      fontSize: isMobile ? 13 : 15,
                      cursor: processingOrders.includes(order.id) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
                      letterSpacing: '0.5px',
                      transition: 'background 0.2s',
                    }}
                  >
                    {actionLoading === order.id + 'confirmed' ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleUpdate(order.id, 'rejected')}
                    disabled={processingOrders.includes(order.id)}
                    style={{
                      background: 'linear-gradient(90deg, #ef4444 60%, #f87171 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 999,
                      padding: isMobile ? '7px 16px' : '8px 24px',
                      fontWeight: 800,
                      fontSize: isMobile ? 13 : 15,
                      cursor: processingOrders.includes(order.id) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(239,68,68,0.08)',
                      letterSpacing: '0.5px',
                      transition: 'background 0.2s',
                    }}
                  >
                    {actionLoading === order.id + 'rejected' ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              )}
              {/* Seller confirmation removed for pending orders */}
              <AccessInstructions 
                order={order} 
                isSeller={order.sellerId === user.uid}
                isAdmin={userProfile?.role === 'admin'}
                currentUserId={user.uid}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 