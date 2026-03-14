// frontend/src/components/VoiceSearch.jsx
// Floating voice search button — medicine bolो, seedha search!
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MEDICINES = ['paracetamol','ibuprofen','amoxicillin','metformin','atorvastatin','cetirizine','aspirin','azithromycin','pantoprazole'];

export default function VoiceSearch() {
  const navigate = useNavigate();
  const [state, setState] = useState('idle'); // idle | listening | processing | success | error
  const [transcript, setTranscript] = useState('');
  const [detectedMedicine, setDetectedMedicine] = useState('');
  const [supported, setSupported] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupported(true);
    }
  }, []);

  function extractMedicine(text) {
    const lower = text.toLowerCase();
    // Direct match
    for (const med of MEDICINES) {
      if (lower.includes(med)) return med;
    }
    // Clean up common phrases
    const cleaned = lower
      .replace(/search for|find|look for|where can i get|where can i find|do you have|i need|खोजो|ढूंढो|चाहिए/g, '')
      .trim();
    return cleaned || text.trim();
  }

  function startListening() {
    if (!supported) return;
    setShowPanel(true);
    setState('listening');
    setTranscript('');
    setDetectedMedicine('');

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      setTranscript(final || interim);
    };

    recognition.onend = () => {
      setState('processing');
      setTimeout(() => {
        const text = transcript || '';
        if (!text.trim()) { setState('error'); return; }
        const medicine = extractMedicine(text);
        setDetectedMedicine(medicine);
        setState('success');
        // Auto navigate after 1.2s
        timerRef.current = setTimeout(() => {
          navigate(`/results?q=${encodeURIComponent(medicine)}`);
          setShowPanel(false);
          setState('idle');
        }, 1200);
      }, 400);
    };

    recognition.onerror = () => setState('error');
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
  }

  function cancel() {
    clearTimeout(timerRef.current);
    recognitionRef.current?.stop();
    setState('idle');
    setShowPanel(false);
    setTranscript('');
    setDetectedMedicine('');
  }

  if (!supported) return null;

  const stateConfig = {
    idle:       { bg: 'linear-gradient(135deg,#00C2A8,#059669)', label: 'Voice Search' },
    listening:  { bg: 'linear-gradient(135deg,#ef4444,#dc2626)', label: 'Listening...' },
    processing: { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', label: 'Processing...' },
    success:    { bg: 'linear-gradient(135deg,#10b981,#059669)', label: 'Found!' },
    error:      { bg: 'linear-gradient(135deg,#6b7280,#4b5563)', label: 'Try again' },
  };

  const cfg = stateConfig[state];

  return (
    <>
      {/* ── Floating Voice Search Button ── */}
      <button
        onClick={state === 'listening' ? stopListening : state === 'idle' || state === 'error' ? startListening : undefined}
        title="Voice Medicine Search"
        style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 9997,
          width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: cfg.bg,
          boxShadow: state === 'listening'
            ? '0 0 0 6px rgba(239,68,68,0.2), 0 4px 16px rgba(239,68,68,0.4)'
            : '0 4px 16px rgba(0,194,168,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.25s',
          animation: state === 'listening' ? 'vs-pulse 1.5s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {state === 'processing' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'vs-spin 1s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10"/>
          </svg>
        ) : state === 'success' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : state === 'listening' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        )}
      </button>

      {/* Tooltip label */}
      {state === 'idle' && (
        <div style={{
          position: 'fixed', bottom: 100, right: 82, zIndex: 9997,
          background: 'rgba(0,0,0,0.75)', color: 'white', borderRadius: 8,
          padding: '4px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          🎙️ Voice Search
        </div>
      )}

      {/* ── Panel ── */}
      {showPanel && (
        <div style={{
          position: 'fixed', bottom: 152, right: 24, zIndex: 9996,
          width: 300, borderRadius: 16, overflow: 'hidden',
          background: 'white', border: '1px solid #e5e7eb',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          animation: 'mm-slideUp 0.2s ease-out',
        }}>
          {/* Header */}
          <div style={{ background: cfg.bg, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0 }}>🎙️ Voice Medicine Search</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: 0 }}>{cfg.label}</p>
            </div>
            <button onClick={cancel} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 8px', color: 'white', cursor: 'pointer', fontSize: 12 }}>✕</button>
          </div>

          <div style={{ padding: 16 }}>
            {/* Waveform when listening */}
            {state === 'listening' && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 4, height: 40, marginBottom: 12 }}>
                {[4,8,14,20,28,20,14,8,4].map((h, i) => (
                  <div key={i} style={{
                    width: 5, borderRadius: 999, background: '#ef4444',
                    height: h, animation: `mm-wave ${0.4+i*0.08}s ease-in-out infinite alternate`,
                  }} />
                ))}
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div style={{ background: '#f8faff', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px', fontWeight: 600 }}>HEARD:</p>
                <p style={{ fontSize: 14, color: '#111827', margin: 0, fontWeight: 500 }}>"{transcript}"</p>
              </div>
            )}

            {/* Detected medicine */}
            {state === 'success' && detectedMedicine && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: '#16a34a', margin: '0 0 4px', fontWeight: 600 }}>SEARCHING FOR:</p>
                <p style={{ fontSize: 15, color: '#15803d', margin: 0, fontWeight: 700, textTransform: 'capitalize' }}>💊 {detectedMedicine}</p>
                <p style={{ fontSize: 11, color: '#16a34a', margin: '4px 0 0' }}>Redirecting to results...</p>
              </div>
            )}

            {/* Error */}
            {state === 'error' && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 12px', marginBottom: 10, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>Could not detect medicine name.<br/>Please try again.</p>
              </div>
            )}

            {/* Instructions */}
            {state === 'listening' && (
              <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', margin: 0 }}>
                Say a medicine name like<br/><strong>"Paracetamol"</strong> or <strong>"Azithromycin"</strong>
              </p>
            )}

            {/* Retry button */}
            {(state === 'error') && (
              <button onClick={startListening} style={{
                width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#00C2A8,#059669)',
                color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>
                🎙️ Try Again
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes vs-pulse { 0%,100%{box-shadow:0 0 0 4px rgba(239,68,68,0.2)} 50%{box-shadow:0 0 0 10px rgba(239,68,68,0.1)} }
        @keyframes vs-spin { to{transform:rotate(360deg)} }
        @keyframes mm-slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mm-wave { from{transform:scaleY(0.5)} to{transform:scaleY(1.5)} }
      `}</style>
    </>
  );
}
