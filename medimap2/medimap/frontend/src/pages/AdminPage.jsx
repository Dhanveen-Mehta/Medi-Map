// frontend/src/pages/AdminPage.jsx
// Admin dashboard — approve/reject price submissions
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ADMIN_KEY = 'admin123'; // Change this — same as backend ADMIN_KEY in .env

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pending:  { bg: 'bg-amber-100',  text: 'text-amber-700',  label: '⏳ Pending' },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '✅ Approved' },
    rejected: { bg: 'bg-red-100',    text: 'text-red-700',    label: '❌ Rejected' },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function SubmissionCard({ sub, onApprove, onReject, onDelete, loading }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`card p-5 border-l-4 transition-all ${
      sub.status === 'pending' ? 'border-amber-400' :
      sub.status === 'approved' ? 'border-emerald-400' : 'border-red-400'
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base">{sub.medicineName}</h3>
            <StatusBadge status={sub.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            <span>₹ <strong className="text-gray-900">{sub.price}</strong></span>
            <span>🏥 {sub.pharmacyName}</span>
            <span>👤 {sub.userName}</span>
            <span>🕐 {new Date(sub.submittedAt).toLocaleString('en-IN')}</span>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          className="text-xs text-[#2E7DFF] border border-[#2E7DFF] rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors flex-shrink-0">
          {expanded ? '▲ Less' : '▼ Details'}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mb-4 space-y-3">
          {/* Receipt image */}
          {sub.imageUrl && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">📄 RECEIPT</p>
              <img
                src={sub.imageUrl}
                alt="Receipt"
                className="max-h-64 rounded-xl border border-gray-100 shadow-sm object-contain"
                onError={e => { e.target.style.display='none'; }}
              />
            </div>
          )}
          {sub.imageOriginalName && !sub.imageUrl && (
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500">
              📎 {sub.imageOriginalName} (image not available for preview)
            </div>
          )}

          {/* Submission details */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-gray-400 text-xs">Medicine</span><p className="font-semibold text-gray-900">{sub.medicineName}</p></div>
              <div><span className="text-gray-400 text-xs">Price</span><p className="font-semibold text-gray-900">₹{sub.price}</p></div>
              <div><span className="text-gray-400 text-xs">Pharmacy</span><p className="font-semibold text-gray-900">{sub.pharmacyName}</p></div>
              <div><span className="text-gray-400 text-xs">Submitted By</span><p className="font-semibold text-gray-900">{sub.userName}</p></div>
              <div><span className="text-gray-400 text-xs">User ID</span><p className="font-semibold text-gray-900 text-xs">{sub.userId}</p></div>
              <div><span className="text-gray-400 text-xs">Submission ID</span><p className="font-semibold text-gray-900 text-xs">{sub.id}</p></div>
            </div>
            {sub.reviewedAt && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-400 text-xs">Reviewed at: </span>
                <span className="text-xs text-gray-600">{new Date(sub.reviewedAt).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons — only for pending */}
      {sub.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => onApprove(sub.id)}
            disabled={loading === sub.id}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
          >
            {loading === sub.id ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : '✅'} Approve
          </button>
          <button
            onClick={() => onReject(sub.id)}
            disabled={loading === sub.id}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' }}
          >
            ❌ Reject
          </button>
        </div>
      )}

      {/* Delete button for reviewed */}
      {sub.status !== 'pending' && (
        <button onClick={() => onDelete(sub.id)}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors mt-2">
          🗑️ Remove from list
        </button>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(null); // submission id being processed
  const [fetching, setFetching] = useState(true);
  const [adminKey, setAdminKey] = useState(ADMIN_KEY);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState('');
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchData() {
    setFetching(true);
    try {
      const [subsRes, statsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/admin/submissions?status=${filter}`),
        fetch('http://localhost:5000/api/admin/stats'),
      ]);
      const subsData = await subsRes.json();
      const statsData = await statsRes.json();
      setSubmissions(subsData.submissions || []);
      setStats(statsData);
    } catch {
      showToast('Failed to fetch submissions. Is backend running?', 'error');
    }
    setFetching(false);
  }

  useEffect(() => { if (isAuthenticated) fetchData(); }, [filter, isAuthenticated]);

  async function handleAction(id, action) {
    setLoading(id);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast(action === 'approve' ? '✅ Approved & price updated!' : '❌ Submission rejected.');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
    setLoading(null);
  }

  async function handleDelete(id) {
    try {
      await fetch(`http://localhost:5000/api/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey }),
      });
      fetchData();
    } catch { showToast('Delete failed', 'error'); }
  }

  // ── Auth gate ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg shadow-blue-500/30">
              🔐
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-500 text-sm mt-1">Enter admin key to continue</p>
          </div>
          <div className="card p-6">
            <input
              type="password"
              className="input-field mb-3"
              placeholder="Admin key"
              value={keyInput}
              onChange={e => { setKeyInput(e.target.value); setKeyError(''); }}
              onKeyDown={e => e.key === 'Enter' && (keyInput === ADMIN_KEY ? (setIsAuthenticated(true), setAdminKey(keyInput)) : setKeyError('Invalid admin key'))}
            />
            {keyError && <p className="text-red-500 text-xs mb-3">{keyError}</p>}
            <button
              onClick={() => {
                if (keyInput === ADMIN_KEY) { setIsAuthenticated(true); setAdminKey(keyInput); }
                else setKeyError('Invalid admin key');
              }}
              className="btn-primary w-full !py-3"
            >
              Access Dashboard
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">
              Default key: <code className="bg-gray-100 px-1 rounded">admin123</code><br/>
              Change in backend <code className="bg-gray-100 px-1 rounded">.env</code> → <code className="bg-gray-100 px-1 rounded">ADMIN_KEY</code>
            </p>
          </div>
          <div className="text-center mt-4">
            <Link to="/" className="text-sm text-[#2E7DFF] hover:underline">← Back to MediMap</Link>
          </div>
        </div>
      </div>
    );
  }

  const filterTabs = [
    { id: 'pending', label: '⏳ Pending', count: stats.pending },
    { id: 'approved', label: '✅ Approved', count: stats.approved },
    { id: 'rejected', label: '❌ Rejected', count: stats.rejected },
    { id: 'all', label: '📋 All', count: stats.total },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: 14,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          animation: 'mm-slideUp 0.2s ease-out',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🛡️ Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Review and approve price submissions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn-secondary text-sm !py-2 !px-3">🔄 Refresh</button>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-red-500 border border-red-100 rounded-xl px-3 py-2 hover:bg-red-50 transition-colors">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon="📋" label="Total" value={stats.total} color="bg-blue-50" />
        <StatCard icon="⏳" label="Pending" value={stats.pending} color="bg-amber-50" />
        <StatCard icon="✅" label="Approved" value={stats.approved} color="bg-emerald-50" />
        <StatCard icon="❌" label="Rejected" value={stats.rejected} color="bg-red-50" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {filterTabs.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === tab.id ? 'bg-[#2E7DFF] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#2E7DFF] hover:text-[#2E7DFF]'
            }`}>
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Submissions list */}
      {fetching ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : submissions.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">
            {filter === 'pending' ? '🎉' : '📭'}
          </div>
          <p className="font-semibold text-gray-700 text-lg">
            {filter === 'pending' ? 'All caught up!' : 'No submissions here'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'pending' ? 'No pending submissions to review.' : `No ${filter} submissions found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(sub => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              onApprove={(id) => handleAction(id, 'approve')}
              onReject={(id) => handleAction(id, 'reject')}
              onDelete={handleDelete}
              loading={loading}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes mm-slideUp { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
