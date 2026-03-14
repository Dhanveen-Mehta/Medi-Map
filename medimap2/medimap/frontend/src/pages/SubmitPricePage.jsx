// frontend/src/pages/SubmitPricePage.jsx
// User uploads receipt → OCR scan → submit for admin approval
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function SubmitPricePage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    medicineName: '',
    price: '',
    pharmacyName: '',
  });

  const user = JSON.parse(localStorage.getItem('medimap_user') || 'null');

  // ── Handle file selection ──────────────────────────────────
  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setScanned(false);
    setError('');
    setForm({ medicineName: '', price: '', pharmacyName: '' });
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  // ── OCR Scan ───────────────────────────────────────────────
  async function handleScan() {
    if (!file) return;
    setScanning(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('prescription', file);
      const res = await fetch('http://localhost:5000/api/prescription/scan', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // Auto-fill form from OCR
      const firstMed = data.medicines?.[0];
      setForm({
        medicineName: firstMed?.name || '',
        price: firstMed?.price || '',
        pharmacyName: data.pharmacyName || '',
      });
      setScanned(true);
    } catch (err) {
      // If OCR fails, let user fill manually
      setScanned(true);
      setError('OCR could not read receipt clearly. Please fill details manually.');
    }
    setScanning(false);
  }

  // ── Submit for approval ────────────────────────────────────
  async function handleSubmit() {
    if (!form.medicineName || !form.price || !form.pharmacyName) {
      setError('Please fill all fields before submitting.');
      return;
    }
    if (isNaN(form.price) || parseFloat(form.price) <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Upload image first if present
      let imageUrl = null;
      if (file) {
        const formData = new FormData();
        formData.append('prescription', file);
        const uploadRes = await fetch('http://localhost:5000/api/prescription/scan', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl || null;
      }

      // Submit to admin queue
      const res = await fetch('http://localhost:5000/api/admin/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: form.medicineName,
          price: form.price,
          pharmacyName: form.pharmacyName,
          userName: user?.name || 'Anonymous',
          userId: user?.email || 'anonymous',
          imageUrl,
          imageOriginalName: file?.name || null,
        }),
      });

      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch (err) {
      setError('Submission failed. Please try again.');
    }
    setSubmitting(false);
  }

  // ── Success State ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitted! 🎉</h2>
          <p className="text-gray-500 text-sm mb-2">
            Your price update for <strong>{form.medicineName}</strong> at <strong>{form.pharmacyName}</strong> has been submitted.
          </p>
          <p className="text-gray-400 text-xs mb-8 bg-blue-50 rounded-xl p-3 border border-blue-100">
            ⏳ Our admin will review and approve it shortly. Once approved, the price will be updated for all users.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setFile(null); setPreview(null); setScanned(false); setForm({ medicineName: '', price: '', pharmacyName: '' }); }}
              className="flex-1 btn-secondary text-sm !py-3">
              Submit Another
            </button>
            <Link to="/" className="flex-1 btn-primary text-center text-sm !py-3">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] mb-4 shadow-lg shadow-blue-500/30">
          <span className="text-2xl">💊</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Price Update</h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Upload your pharmacy receipt — our OCR will auto-detect medicine name, price and pharmacy. Help the community find affordable medicines!
        </p>
      </div>

      {/* Step 1 — Upload Receipt */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#2E7DFF] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
          <h2 className="font-semibold text-gray-900">Upload Receipt / Bill</h2>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
          style={{ borderColor: file ? '#2E7DFF' : '#d1d5db', background: file ? 'rgba(46,125,255,0.04)' : '#fafafa' }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const ev = { target: { files: [f] } }; handleFile(ev); }}}
        >
          {preview ? (
            <img src={preview} alt="Receipt preview" className="max-h-48 mx-auto rounded-xl shadow-md" />
          ) : (
            <>
              <div className="text-4xl mb-3">{file ? '📄' : '⬆️'}</div>
              <p className="font-medium text-gray-700">{file ? file.name : 'Drop receipt here or click to browse'}</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF — up to 10MB</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
        </div>

        {file && !scanned && (
          <button onClick={handleScan} disabled={scanning}
            className="btn-primary w-full mt-4 !py-3 text-sm"
          >
            {scanning ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Scanning Receipt...
              </span>
            ) : '🔍 Scan Receipt with OCR'}
          </button>
        )}

        {scanned && (
          <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            Receipt scanned! Review details below.
          </div>
        )}

        {/* Skip scan option */}
        {file && !scanned && !scanning && (
          <button onClick={() => setScanned(true)} className="text-xs text-gray-400 hover:text-gray-600 mt-2 block text-center w-full">
            Skip scan — fill manually
          </button>
        )}
      </div>

      {/* Step 2 — Review / Fill Details */}
      {(scanned || !file) && (
        <div className="card p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#2E7DFF] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
            <h2 className="font-semibold text-gray-900">Review & Confirm Details</h2>
          </div>

          {scanned && form.medicineName && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4 text-xs text-emerald-700">
              ✅ OCR auto-filled the details below. Please review and correct if needed.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">💊 Medicine Name *</label>
              <input className="input-field" placeholder="e.g. Paracetamol 500mg"
                value={form.medicineName} onChange={e => setForm({ ...form, medicineName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">₹ Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input className="input-field !pl-8" type="number" placeholder="e.g. 45"
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">🏥 Pharmacy Name *</label>
              <input className="input-field" placeholder="e.g. Apollo Pharmacy - Sector 16"
                value={form.pharmacyName} onChange={e => setForm({ ...form, pharmacyName: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      {/* Step 3 — Submit */}
      {(scanned || !file) && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#2E7DFF] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
            <h2 className="font-semibold text-gray-900">Submit for Review</h2>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700">
            ℹ️ Your submission will be reviewed by our admin team. Once approved, the price will be updated for all MediMap users.
          </div>

          {!user && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 text-xs text-amber-700">
              ⚠️ You are submitting as Anonymous. <Link to="/login" className="font-semibold underline">Login</Link> to track your submissions.
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting || !form.medicineName || !form.price || !form.pharmacyName}
            className="btn-primary w-full !py-3 text-base"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Submitting...
              </span>
            ) : '📤 Submit Price Update'}
          </button>
        </div>
      )}
    </div>
  );
}
