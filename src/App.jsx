import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import LandingPage from "./components/LandingPage";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ListingForm from "./components/ListingForm";
import { db } from "./firebaseConfig";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import PaymentModal from "./components/PaymentModal";
import ProfilePage from "./components/ProfilePage";
import OrderHistory from "./components/OrderHistory";
import AdminDashboard from "./components/AdminDashboard";
import ManageListings from "./components/ManageListings";

function ListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sellers, setSellers] = useState({});
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    async function fetchListingsAndSellers() {
      setLoading(true);
      try {
        const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const listingsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setListings(listingsData);
        // Fetch seller profiles
        const ownerIds = Array.from(new Set(listingsData.map(l => l.ownerId).filter(Boolean)));
        if (ownerIds.length > 0) {
          const usersSnap = await getDocs(collection(db, "users"));
          const sellersMap = {};
          usersSnap.forEach(doc => {
            const data = doc.data();
            if (ownerIds.includes(data.uid)) {
              sellersMap[data.uid] = { email: data.email, upiId: data.upiId };
            }
          });
          setSellers(sellersMap);
        } else {
          setSellers({});
        }
      } catch (err) {
        setListings([]);
        setSellers({});
      }
      setLoading(false);
    }
    fetchListingsAndSellers();
  }, []);

  // Filtering logic
  const filteredListings = listings.filter(listing => {
    if (category && listing.category !== category) return false;
    if (minPrice && Number(listing.price) < Number(minPrice)) return false;
    if (maxPrice && Number(listing.price) > Number(maxPrice)) return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      const inService = listing.serviceName?.toLowerCase().includes(kw);
      const inDesc = listing.description?.toLowerCase().includes(kw);
      const inTags = Array.isArray(listing.tags) && listing.tags.some(tag => tag.toLowerCase().includes(kw));
      if (!inService && !inDesc && !inTags) return false;
    }
    return true;
  });

  async function handleBookNow(listing, transactionId) {
    setBookingSuccess("");
    try {
      await addDoc(collection(db, "orders"), {
        listingId: listing.id,
        buyerId: user.uid,
        sellerId: listing.ownerId,
        status: "pending",
        createdAt: serverTimestamp(),
        transactionId: transactionId,
      });
      setBookingSuccess("Booking request sent! Please complete payment and wait for confirmation.");
    } catch (err) {
      setBookingSuccess("Failed to book. Please try again.");
    }
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(120deg, #e3eafc 0%, #2563eb 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
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
      <div style={{ maxWidth: 950, width: '100%', textAlign: 'center', padding: '2.5rem 2rem', borderRadius: 28, boxShadow: '0 8px 32px rgba(37,99,235,0.10)', background: 'rgba(255,255,255,0.97)', position: 'relative', zIndex: 1 }}>
        <h2 style={{ color: '#2563eb', fontWeight: 900, fontSize: '2.2rem', marginBottom: 18, letterSpacing: '-1px' }}>Listings</h2>
        {user && (
          <button
            style={{ marginTop: 16, marginBottom: 24, background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)', color: '#fff', border: 'none', borderRadius: 999, padding: '0.85rem 2.2rem', fontSize: '1.13rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s' }}
            onClick={() => navigate('/list')}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 40%, #60a5fa 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)'}
          >
            List New Subscription
          </button>
        )}
        {/* Filter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', marginBottom: 28, marginTop: 10 }}>
          <input
            type="text"
            placeholder="Search by keyword"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ padding: 12, fontSize: 16, width: 200, borderRadius: 10, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111', outline: 'none', transition: 'border 0.2s' }}
          />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: 12, fontSize: 16, borderRadius: 10, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111', outline: 'none', transition: 'border 0.2s' }}>
            <option value="">All Categories</option>
            <option value="Streaming">Streaming</option>
            <option value="Tools">Tools</option>
            <option value="Gaming">Gaming</option>
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            style={{ padding: 12, fontSize: 16, width: 120, borderRadius: 10, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111', outline: 'none', transition: 'border 0.2s' }}
            min={0}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            style={{ padding: 12, fontSize: 16, width: 120, borderRadius: 10, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111', outline: 'none', transition: 'border 0.2s' }}
            min={0}
          />
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : listings.length === 0 ? (
          <div style={{ color: '#64748b', fontWeight: 500, fontSize: 18, margin: '2rem 0' }}>No listings found.</div>
        ) : filteredListings.length === 0 ? (
          <div style={{ color: '#64748b', fontWeight: 500, fontSize: 18, margin: '2rem 0' }}>No listings match your filters.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'center', marginTop: 18 }}>
            {filteredListings.map(listing => (
              <div key={listing.id} style={{ flex: '1 1 260px', maxWidth: 340, minWidth: 240, background: 'rgba(243,244,246,0.95)', borderRadius: 16, boxShadow: '0 2px 12px rgba(37,99,235,0.08)', padding: 22, textAlign: 'left', position: 'relative', transition: 'box-shadow 0.18s', border: '1.5px solid #c7d2fe' }}>
                <h3 style={{ color: '#2563eb', marginBottom: 10, fontWeight: 800, fontSize: '1.18rem', letterSpacing: '-0.5px' }}>{listing.serviceName}</h3>
                <div style={{ color: '#334155', marginBottom: 10, fontSize: 15 }}>{listing.description}</div>
                <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: 6, fontSize: 15 }}>₹{listing.price} / {listing.duration} day(s)</div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>Category: {listing.category}</div>
                {listing.tags && listing.tags.length > 0 && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Tags: {listing.tags.join(', ')}</div>
                )}
                <div style={{ fontSize: 13, color: '#334155', marginTop: 10 }}>
                  Seller: {sellers[listing.ownerId]?.email || 'Unknown'}
                </div>
                {sellers[listing.ownerId] && (
                  <a
                    href={`mailto:${sellers[listing.ownerId].email}`}
                    style={{ display: 'inline-block', marginTop: 8, color: '#fff', background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)', borderRadius: 8, padding: '7px 18px', textDecoration: 'none', fontSize: 14, fontWeight: 600, boxShadow: '0 1px 6px rgba(37,99,235,0.08)', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 40%, #60a5fa 100%)'}
                    onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)'}
                  >
                    Contact Seller
                  </a>
                )}
                {user && (
                  <button
                    style={{ marginTop: 14, background: 'linear-gradient(90deg, #10b981 60%, #34d399 100%)', color: '#fff', border: 'none', borderRadius: 999, padding: '0.7rem 1.7rem', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.08)', letterSpacing: '0.5px', transition: 'background 0.2s' }}
                    onClick={() => {
                      setSelectedListing({
                        ...listing,
                        sellerEmail: sellers[listing.ownerId]?.email,
                        sellerUpi: sellers[listing.ownerId]?.upiId
                      });
                      setPaymentOpen(true);
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #10b981 40%, #34d399 100%)'}
                    onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #10b981 60%, #34d399 100%)'}
                  >
                    Book Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {paymentOpen && selectedListing && (
          <PaymentModal
            listing={selectedListing}
            onClose={() => { setPaymentOpen(false); setBookingSuccess(""); }}
            onBook={async (transactionId) => {
              await handleBookNow(selectedListing, transactionId);
            }}
            bookingSuccess={bookingSuccess}
          />
        )}
      </div>
    </div>
  );
}

function AuthGate({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/manage-listings" element={<ManageListings />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/list" element={
            <AuthGate>
              <ListingForm />
            </AuthGate>
          } />
          <Route path="/profile" element={
            <AuthGate>
              <ProfilePage />
            </AuthGate>
          } />
          <Route path="/dashboard" element={
            <AuthGate>
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <h2>Welcome to your dashboard!</h2>
              </div>
            </AuthGate>
          } />
          <Route path="/admin" element={
            <AuthGate>
              <AdminDashboard />
            </AuthGate>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
