// frontend/src/components/ChatBot.jsx
// AI Chatbot — proper logo + mic + typing
import { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  'Paracetamol ka generic kya hai?',
  'Nearest open pharmacy?',
  'Azithromycin side effects?',
];

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%', background: '#2E7DFF',
          animation: `mm-bounce 1.2s ease-in-out ${i*0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: 10 }}>
      {isBot && (
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg,#2E7DFF,#00C2A8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 8, flexShrink: 0,
        }}>
          {/* Bot logo — medical cross */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/>
            <rect x="10" y="6" width="4" height="8" rx="1" fill="rgba(46,125,255,0.8)"/>
            <rect x="8" y="8" width="8" height="4" rx="1" fill="rgba(46,125,255,0.8)"/>
          </svg>
        </div>
      )}
      <div style={{
        maxWidth: '78%', padding: '10px 14px',
        borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isBot ? 'white' : 'linear-gradient(135deg,#2E7DFF,#1a6aef)',
        color: isBot ? '#111827' : 'white',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatBot({ userLocation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Namaste! 👋 Main MediMap Assistant hoon.\n\nPooch sakte hain:\n• Medicine info & generic alternatives\n• Nearby pharmacies & prices\n• Side effects & uses\n\nType karein ya 🎙️ mic use karein!',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [micError, setMicError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setMicSupported(true);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [isOpen]);

  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput(''); setMicError('');
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userLat: userLocation?.lat, userLng: userLocation?.lng, conversationHistory: history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, try again.' }]);
      if (!isOpen) setUnread(n => n + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check backend.' }]);
    }
    setLoading(false);
  }

  function startListening() {
    if (!micSupported) return;
    setMicError('');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => sendMessage(transcript), 300);
    };
    recognition.onerror = (e) => {
      setIsListening(false);
      setMicError(e.error === 'not-allowed' ? 'Mic permission denied.' : 'Mic error: ' + e.error);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function stopListening() { recognitionRef.current?.stop(); setIsListening(false); }

  return (
    <>
      {/* ── Floating Chat Button with MediMap logo ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        title="MediMap AI Assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#2E7DFF,#00C2A8)',
          boxShadow: '0 4px 20px rgba(46,125,255,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(46,125,255,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(46,125,255,0.45)'; }}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" opacity="0.95"/>
            <rect x="8" y="9" width="2" height="4" rx="1" fill="#2E7DFF"/>
            <rect x="7" y="10" width="4" height="2" rx="1" fill="#2E7DFF"/>
            <circle cx="15" cy="11" r="1.5" fill="#2E7DFF"/>
            <circle cx="15" cy="11" r="0.6" fill="white"/>
          </svg>
        )}
        {unread > 0 && !isOpen && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            background: '#ef4444', color: 'white', borderRadius: '50%',
            width: 20, height: 20, fontSize: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
          }}>{unread}</span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 9998,
          width: 360, height: 545, borderRadius: 18,
          background: '#f8faff', border: '1px solid #e5e7eb',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'mm-slideUp 0.2s ease-out',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#2E7DFF,#00C2A8)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/>
                <rect x="10.5" y="6.5" width="3" height="7" rx="1" fill="rgba(46,125,255,0.7)"/>
                <rect x="8.5" y="8.5" width="7" height="3" rx="1" fill="rgba(46,125,255,0.7)"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>MediMap Assistant</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                {isListening ? '🎙️ Listening...' : '● Online · AI-powered'}
              </div>
            </div>
            <button onClick={() => setMessages([messages[0]])} title="Clear chat"
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '5px 8px', color: 'white', cursor: 'pointer', fontSize: 13 }}>
              🗑️
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2E7DFF,#00C2A8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/></svg>
                </div>
                <div style={{ background: 'white', borderRadius: '4px 16px 16px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid #e5e7eb', background: 'white' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 5, fontWeight: 600 }}>QUICK QUESTIONS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{
                    background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 999,
                    padding: '3px 10px', fontSize: 11, cursor: 'pointer', color: '#2E7DFF', fontWeight: 500,
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Mic error */}
          {micError && (
            <div style={{ padding: '5px 12px', background: '#fef2f2', fontSize: 11, color: '#dc2626', textAlign: 'center' }}>{micError}</div>
          )}

          {/* Listening bar */}
          {isListening && (
            <div style={{ padding: '8px 12px', background: 'rgba(46,125,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 20 }}>
                {[3,6,9,12,9,6,3].map((h, i) => (
                  <div key={i} style={{ width: 3, borderRadius: 999, background: '#2E7DFF', height: h, animation: `mm-wave ${0.4+i*0.08}s ease-in-out infinite alternate` }} />
                ))}
              </div>
              <span style={{ fontSize: 12, color: '#2E7DFF', fontWeight: 600 }}>Listening... speak now</span>
            </div>
          )}

          {/* Input Bar */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #e5e7eb', background: 'white', display: 'flex', gap: 7, alignItems: 'center' }}>
            {micSupported && (
              <button onClick={isListening ? stopListening : startListening}
                title={isListening ? 'Stop' : 'Speak'}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
                  background: isListening ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#2E7DFF,#00C2A8)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isListening ? '0 0 0 4px rgba(239,68,68,0.2)' : '0 2px 8px rgba(46,125,255,0.3)',
                  transition: 'all 0.2s',
                }}>
                {isListening ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </button>
            )}
            <input ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={isListening ? 'Listening...' : 'Type or use mic...'}
              disabled={isListening}
              style={{
                flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 12,
                padding: '8px 12px', fontSize: 13, outline: 'none',
                background: isListening ? '#f0f7ff' : '#f8faff', color: '#111827',
              }}
              onFocus={e => e.target.style.borderColor = '#2E7DFF'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
                background: input.trim() && !loading ? 'linear-gradient(135deg,#2E7DFF,#1a6aef)' : '#e5e7eb',
                color: input.trim() && !loading ? 'white' : '#9ca3af',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes mm-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes mm-slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mm-wave { from{transform:scaleY(0.5)} to{transform:scaleY(1.5)} }
      `}</style>
    </>
  );
}
