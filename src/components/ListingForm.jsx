import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

const categories = ["Streaming", "Tools", "Gaming"];

export default function ListingForm() {
  const { user } = useAuth();
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(1);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!serviceName || !description || !duration || !price || !category) {
      setError("All fields are required.");
      return;
    }
    if (isNaN(duration) || isNaN(price)) {
      setError("Duration and price must be numbers.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "listings"), {
        serviceName,
        description,
        duration: Number(duration),
        price: Number(price),
        category,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        status: "active"
      });
      setSuccess("Listing created successfully!");
      setServiceName("");
      setDescription("");
      setDuration(1);
      setPrice("");
      setCategory(categories[0]);
      setTags("");
    } catch (err) {
      setError("Failed to create listing. " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
        opacity: 0.22,
        zIndex: 0,
      }} />
      <form onSubmit={handleSubmit} style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 440,
        width: '100%',
        background: 'rgba(255,255,255,0.93)',
        padding: '2.7rem 2.2rem',
        borderRadius: 28,
        boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: 18, fontWeight: 900, fontSize: '2.1rem', letterSpacing: '-1px' }}>List a Subscription</h2>
        <input
          type="text"
          value={serviceName}
          onChange={e => setServiceName(e.target.value)}
          placeholder="Service Name (e.g., Netflix)"
          required
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: 16, padding: 12, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description and terms of use"
          required
          rows={3}
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: 16, padding: 12, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', resize: 'vertical', transition: 'border 0.2s', color: '#111' }}
        />
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="Duration (days)"
          min={1}
          required
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: 16, padding: 12, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Price per period (e.g., 20)"
          min={1}
          required
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: 16, padding: 12, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: 16, padding: 12, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          style={{ display: "block", width: "100%", marginBottom: 14, fontSize: 16, padding: 12, borderRadius: 10, border: '1.5px solid #c7d2fe', outline: 'none', boxSizing: 'border-box', background: '#f8fafc', transition: 'border 0.2s', color: '#111' }}
        />
        <button type="submit" style={{
          width: "100%",
          fontSize: 18,
          fontWeight: 800,
          padding: '1.1rem 0',
          borderRadius: 999,
          background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
          color: '#fff',
          border: 'none',
          marginTop: 8,
          boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
          cursor: 'pointer',
          letterSpacing: '0.5px',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 40%, #60a5fa 100%)'}
        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)'}
        disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
        {error && <div style={{ color: "#ef4444", marginTop: 12, fontWeight: 500 }}>{error}</div>}
        {success && <div style={{ color: "#10b981", marginTop: 12, fontWeight: 500 }}>{success}</div>}
      </form>
    </div>
  );
} 