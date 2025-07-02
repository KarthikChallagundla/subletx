import React, { useState, useEffect } from "react";
import { storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PaymentModal({ listing, onClose, onBook, bookingSuccess }) {
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  if (!listing) return null;
  const upiId = listing.sellerUpi;
  const upiAmount = listing.price;
  const upiUrl = upiId ? `upi://pay?pa=${upiId}&am=${upiAmount}` : null;

  const handleOpenUpi = () => {
    if (upiUrl) {
      window.location.href = upiUrl;
    }
  };

  const handleBook = async () => {
    if (!transactionId.trim()) {
      setError('Transaction ID is required');
      return;
    }
    setError("");
    setLoading(true);
    setUploading(true);
    try {
      let screenshotUrl = null;
      if (screenshot) {
        // Upload screenshot to Firebase Storage
        const fileRef = ref(storage, `payment_screenshots/${listing.id}_${Date.now()}`);
        await uploadBytes(fileRef, screenshot);
        screenshotUrl = await getDownloadURL(fileRef);
      }
      // Pass both transactionId and screenshotUrl (may be null) to onBook
      await onBook(transactionId, screenshotUrl);
      setBooked(true);
    } catch (err) {
      setError('Failed to upload screenshot. ' + err.message);
    }
    setUploading(false);
    setLoading(false);
  };

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 600);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: isMobile ? '1rem 0.2rem' : '0',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: isMobile ? 16 : 24,
        maxWidth: isMobile ? 340 : 420,
        width: '100%',
        padding: isMobile ? '1.2rem 0.5rem' : '2.5rem 2rem',
        boxShadow: '0 8px 32px rgba(37,99,235,0.13)',
        textAlign: 'center',
        position: 'relative',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: 16, fontWeight: 900, fontSize: isMobile ? '1.3rem' : '2rem', letterSpacing: '-1px' }}>Payment Instructions</h2>
        <div style={{ marginBottom: 16, color: '#334155', fontSize: isMobile ? 14 : 16 }}>
          <strong>Service:</strong> {listing.serviceName}<br />
          <strong>Price:</strong> ₹{listing.price} / {listing.duration} day(s)<br />
          <strong>Seller Email:</strong> {listing.sellerEmail || 'N/A'}<br />
          <strong>Seller UPI:</strong> {upiId || 'N/A'}
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: '#2563eb', fontSize: isMobile ? 14 : 16 }}>Pay via UPI/QR</div>
          {upiId ? (
            <>
              <div style={{ background: '#f3f4f6', borderRadius: 10, padding: isMobile ? 8 : 14, marginBottom: 8 }}>
                <div style={{ color: '#1e293b', fontSize: isMobile ? 13 : 15 }}>UPI ID: <b>{upiId}</b></div>
                <div style={{ marginTop: 10, marginBottom: 6 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=${upiId}&am=${upiAmount}`} alt="UPI QR" style={{ width: isMobile ? 80 : 120, height: isMobile ? 80 : 120 }} />
                </div>
                <a
                  href={upiUrl}
                  style={{ display: 'block', margin: '10px 0', color: '#2563eb', fontWeight: 600, fontSize: isMobile ? 13 : 15 }}
                >
                  Pay Now with UPI App
                </a>
                <button
                  type="button"
                  onClick={handleOpenUpi}
                  style={{ background: 'none', border: 'none', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', marginTop: 4, fontWeight: 600, fontSize: isMobile ? 13 : 15 }}
                >
                  Open UPI Payment Link
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: 'red', fontWeight: 500, fontSize: isMobile ? 13 : 15 }}>Seller has not set a UPI ID.</div>
          )}
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#64748b', marginTop: 10 }}>
            <label htmlFor="transactionId" style={{ display: 'block', marginBottom: 6, color: '#1e293b', fontWeight: 600, fontSize: isMobile ? 13 : 15 }}>
              <b>Transaction ID (required):</b>
            </label>
            <input
              id="transactionId"
              type="text"
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
              placeholder="Enter UPI Transaction ID"
              required
              style={{ width: '100%', padding: isMobile ? 8 : 10, fontSize: isMobile ? 14 : 16, borderRadius: 10, border: '1.5px solid #c7d2fe', marginBottom: 8, background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
              disabled={booked || loading}
            />
            <label htmlFor="screenshot" style={{ display: 'block', marginBottom: 6, color: '#1e293b', fontWeight: 600, fontSize: isMobile ? 13 : 15 }}>
              <b>Payment Screenshot (optional):</b>
            </label>
            <input
              id="screenshot"
              type="file"
              accept="image/*"
              onChange={e => setScreenshot(e.target.files[0])}
              style={{ width: '100%', marginBottom: 8 }}
              disabled={booked || loading || uploading}
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8, fontWeight: 500, fontSize: isMobile ? 13 : 15 }}>{error}</div>}
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#64748b' }}>
            After payment, enter your Transaction ID and click below to book and notify the seller.
          </div>
        </div>
        <button
          onClick={handleBook}
          style={{
            background: booked ? '#aaa' : 'linear-gradient(90deg, #10b981 60%, #34d399 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: isMobile ? '0.9rem 0' : '1rem 0',
            fontSize: isMobile ? '1rem' : '1.08rem',
            fontWeight: 800,
            cursor: booked ? 'not-allowed' : 'pointer',
            marginBottom: 12,
            width: '100%',
            boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
            letterSpacing: '0.5px',
            transition: 'background 0.2s',
          }}
          disabled={booked || loading || uploading}
        >
          {booked ? 'Booked' : uploading ? 'Uploading...' : loading ? 'Booking...' : 'Book Now'}
        </button>
        {bookingSuccess && (
          <div style={{ color: bookingSuccess.startsWith('Booking') ? 'green' : 'red', marginBottom: 10, fontWeight: 500, fontSize: isMobile ? 13 : 15 }}>{bookingSuccess}</div>
        )}
        <button onClick={onClose} style={{
          background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 999,
          padding: isMobile ? '0.9rem 0' : '1rem 0',
          fontSize: isMobile ? '1rem' : '1.08rem',
          fontWeight: 800,
          cursor: 'pointer',
          width: '100%',
          boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
          letterSpacing: '0.5px',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 40%, #60a5fa 100%)'}
        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)'}
        >
          Close
        </button>
      </div>
    </div>
  );
} 