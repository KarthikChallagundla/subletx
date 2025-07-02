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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 600);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', padding: isMobile ? '1rem 0.2rem' : '0' }}>
      <div style={{ maxWidth: isMobile ? 360 : 900, width: '100%', textAlign: 'center', padding: isMobile ? '1.2rem 0.5rem' : '2rem', borderRadius: isMobile ? 18 : 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', background: '#fff' }}>
        <h2 style={{ color: '#000', fontSize: isMobile ? '1.3rem' : '2rem', fontWeight: 900, marginBottom: 18 }}>Listings</h2>
        {user && (
          <button
            style={{ marginTop: 16, marginBottom: 24, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: isMobile ? '0.7rem 0' : '0.75rem 2rem', fontSize: isMobile ? '1.05rem' : '1.1rem', cursor: 'pointer', width: isMobile ? '100%' : undefined }}
            onClick={() => navigate('/list')}
          >
            List New Subscription
          </button>
        )}
        {/* Filter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 10 : 16, justifyContent: 'center', marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Search by keyword"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ padding: isMobile ? 8 : 8, fontSize: isMobile ? 14 : 15, width: isMobile ? 120 : 180, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111' }}
          />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: isMobile ? 8 : 8, fontSize: isMobile ? 14 : 15, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111' }}>
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
            style={{ padding: isMobile ? 8 : 8, fontSize: isMobile ? 14 : 15, width: isMobile ? 70 : 110, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111' }}
            min={0}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            style={{ padding: isMobile ? 8 : 8, fontSize: isMobile ? 14 : 15, width: isMobile ? 70 : 110, borderRadius: 8, border: '1.5px solid #c7d2fe', background: '#f8fafc', color: '#111' }}
            min={0}
          />
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : listings.length === 0 ? (
          <div style={{ color: '#64748b', fontWeight: 500, fontSize: isMobile ? 15 : 18, margin: '2rem 0' }}>No listings found.</div>
        ) : filteredListings.length === 0 ? (
          <div style={{ color: '#64748b', fontWeight: 500, fontSize: isMobile ? 15 : 18, margin: '2rem 0' }}>No listings match your filters.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 14 : 24, justifyContent: 'center', marginTop: 16 }}>
            {filteredListings.map(listing => (
              <div key={listing.id} style={{ flex: '1 1 220px', maxWidth: isMobile ? 260 : 320, minWidth: isMobile ? 140 : 220, background: '#f3f4f6', borderRadius: isMobile ? 12 : 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', padding: isMobile ? 10 : 18, textAlign: 'left', marginBottom: isMobile ? 10 : 0 }}>
                <h3 style={{ color: '#000', marginBottom: 8, fontSize: isMobile ? '1.05rem' : '1.18rem', fontWeight: 700 }}>{listing.serviceName}</h3>
                <div style={{ color: '#444', marginBottom: 8, fontSize: isMobile ? 13 : 15 }}>{listing.description}</div>
                <div style={{ fontWeight: 500, color: '#2563eb', marginBottom: 4, fontSize: isMobile ? 13 : 15 }}>₹{listing.price} / {listing.duration} day(s)</div>
                <div style={{ fontSize: isMobile ? 11 : 13, color: '#666', marginBottom: 4 }}>Category: {listing.category}</div>
                {listing.tags && listing.tags.length > 0 && (
                  <div style={{ fontSize: isMobile ? 10 : 12, color: '#888', marginTop: 4 }}>Tags: {listing.tags.join(', ')}</div>
                )}
                <div style={{ fontSize: isMobile ? 11 : 13, color: '#333', marginTop: 10 }}>
                  Seller: {sellers[listing.ownerId]?.email || 'Unknown'}
                </div>
                {sellers[listing.ownerId] && (
                  <a
                    href={`mailto:${sellers[listing.ownerId].email}`}
                    style={{ display: 'inline-block', marginTop: 8, color: '#fff', background: '#2563eb', borderRadius: 6, padding: isMobile ? '5px 10px' : '6px 16px', textDecoration: 'none', fontSize: isMobile ? 12 : 14 }}
                  >
                    Contact Seller
                  </a>
                )}
                {user && (
                  <button
                    style={{ marginTop: 12, background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1.2rem', fontSize: isMobile ? 13 : 15, cursor: 'pointer', width: isMobile ? '100%' : undefined }}
                    onClick={() => {
                      setSelectedListing({
                        ...listing,
                        sellerEmail: sellers[listing.ownerId]?.email,
                        sellerUpi: sellers[listing.ownerId]?.upiId
                      });
                      setPaymentOpen(true);
                    }}
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
