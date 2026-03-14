// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

// ── Helpers ───────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
      ))}
    </span>
  );
}

// ── Mock Data ─────────────────────────────────────────────────
const DEFAULT_SAVED_PHARMACIES = [
  { id: 'p1', name: 'Apollo Pharmacy - Sector 16', address: 'Sector 16, Faridabad', rating: 4.5, isOpen: true, savedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'p2', name: 'MedPlus - NIT Faridabad', address: 'NIT Market, Faridabad', rating: 4.3, isOpen: true, savedAt: new Date(Date.now() - 172800000).toISOString() },
];

const DEFAULT_REVIEWS = [
  { id: 'r1', pharmacyName: 'Apollo Pharmacy - Sector 16', rating: 5, review: 'Great service and medicines always in stock!', date: new Date(Date.now() - 604800000).toISOString() },
  { id: 'r2', pharmacyName: 'Jan Aushadhi Store - Sector 21', rating: 4, review: 'Very affordable generic medicines.', date: new Date(Date.now() - 1209600000).toISOString() },
];

const DEFAULT_ALERTS = [
  { id: 'a1', medicine: 'Paracetamol 500mg', targetPrice: 15, currentPrice: 18, pharmacy: 'Apollo Pharmacy', active: true },
  { id: 'a2', medicine: 'Metformin 500mg', targetPrice: 38, currentPrice: 45, pharmacy: 'MedPlus', active: true },
  { id: 'a3', medicine: 'Azithromycin 500mg', targetPrice: 150, currentPrice: 172, pharmacy: 'NetMeds Store', active: false },
];

const DEFAULT_SAVINGS = {
  total: 1240,
  thisMonth: 340,
  transactions: [
    { medicine: 'Paracetamol 500mg', saved: 8, date: new Date(Date.now() - 86400000).toISOString(), cheapest: 15, avg: 23 },
    { medicine: 'Metformin 500mg', saved: 12, date: new Date(Date.now() - 172800000).toISOString(), cheapest: 40, avg: 52 },
    { medicine: 'Cetirizine 10mg', saved: 10, date: new Date(Date.now() - 259200000).toISOString(), cheapest: 22, avg: 32 },
    { medicine: 'Azithromycin 500mg', saved: 35, date: new Date(Date.now() - 345600000).toISOString(), cheapest: 145, avg: 180 },
  ]
};

// ── Sub Components ────────────────────────────────────────────
function TabBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
        active ? 'bg-[#2E7DFF] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ── Search History Tab ────────────────────────────────────────
function SearchHistoryTab({ navigate }) {
  const history = JSON.parse(localStorage.getItem('medimap_search_history') || '[]');

  if (history.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-gray-500 font-medium">No search history yet</p>
        <p className="text-sm text-gray-400 mt-1">Search for medicines to see them here</p>
        <Link to="/" className="btn-primary mt-4 inline-block text-sm">Search Now</Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((item, i) => (
        <div key={i} className="card p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg">🔍</div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{item.query}</p>
              <p className="text-xs text-gray-400">{timeAgo(item.date)}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/results?q=${encodeURIComponent(item.query)}`)}
            className="btn-secondary text-xs !py-1.5 !px-3"
          >
            Search Again →
          </button>
        </div>
      ))}
      <button
        onClick={() => { localStorage.removeItem('medimap_search_history'); window.location.reload(); }}
        className="text-xs text-red-400 hover:text-red-600 mt-2 block text-center w-full"
      >
        Clear History
      </button>
    </div>
  );
}

// ── Saved Pharmacies Tab ──────────────────────────────────────
function SavedPharmaciesTab() {
  const [pharmacies, setPharmacies] = useState(
    JSON.parse(localStorage.getItem('medimap_saved_pharmacies') || JSON.stringify(DEFAULT_SAVED_PHARMACIES))
  );

  const remove = (id) => {
    const updated = pharmacies.filter(p => p.id !== id);
    setPharmacies(updated);
    localStorage.setItem('medimap_saved_pharmacies', JSON.stringify(updated));
  };

  if (pharmacies.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-4xl mb-3">🏥</div>
        <p className="text-gray-500 font-medium">No saved pharmacies</p>
        <p className="text-sm text-gray-400 mt-1">Save pharmacies while browsing results</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pharmacies.map(p => (
        <div key={p.id} className="card p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl flex-shrink-0">🏥</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.address}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs font-medium text-yellow-500">⭐ {p.rating}</span>
                <span className={`text-xs font-medium ${p.isOpen ? 'text-emerald-600' : 'text-red-400'}`}>
                  {p.isOpen ? '● Open' : '● Closed'}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(p.savedAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(p.address)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs !py-1.5 !px-3"
            >
              🗺️ Directions
            </a>
            <button
              onClick={() => remove(p.id)}
              className="text-xs text-red-400 hover:text-red-600 text-center"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── My Reviews Tab ────────────────────────────────────────────
function MyReviewsTab() {
  const [reviews, setReviews] = useState(
    JSON.parse(localStorage.getItem('medimap_my_reviews') || JSON.stringify(DEFAULT_REVIEWS))
  );

  const remove = (id) => {
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    localStorage.setItem('medimap_my_reviews', JSON.stringify(updated));
  };

  if (reviews.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-4xl mb-3">⭐</div>
        <p className="text-gray-500 font-medium">No reviews yet</p>
        <p className="text-sm text-gray-400 mt-1">Rate pharmacies to see your reviews here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div key={r.id} className="card p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{r.pharmacyName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Stars rating={r.rating} />
                <span className="text-xs text-gray-400">{timeAgo(r.date)}</span>
              </div>
            </div>
            <button onClick={() => remove(r.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
          </div>
          {r.review && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 italic">"{r.review}"</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Price Alerts Tab ──────────────────────────────────────────
function PriceAlertsTab() {
  const [alerts, setAlerts] = useState(
    JSON.parse(localStorage.getItem('medimap_price_alerts') || JSON.stringify(DEFAULT_ALERTS))
  );
  const [showAdd, setShowAdd] = useState(false);
  const [newAlert, setNewAlert] = useState({ medicine: '', targetPrice: '', pharmacy: '' });

  const toggle = (id) => {
    const updated = alerts.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setAlerts(updated);
    localStorage.setItem('medimap_price_alerts', JSON.stringify(updated));
  };

  const remove = (id) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    localStorage.setItem('medimap_price_alerts', JSON.stringify(updated));
  };

  const add = () => {
    if (!newAlert.medicine || !newAlert.targetPrice) return;
    const alert = {
      id: `a${Date.now()}`,
      medicine: newAlert.medicine,
      targetPrice: Number(newAlert.targetPrice),
      currentPrice: Number(newAlert.targetPrice) + Math.floor(Math.random() * 30) + 5,
      pharmacy: newAlert.pharmacy || 'Any Pharmacy',
      active: true
    };
    const updated = [alert, ...alerts];
    setAlerts(updated);
    localStorage.setItem('medimap_price_alerts', JSON.stringify(updated));
    setNewAlert({ medicine: '', targetPrice: '', pharmacy: '' });
    setShowAdd(false);
  };

  return (
    <div>
      {/* Add Alert Button */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="btn-primary text-sm mb-4 w-full !py-3"
      >
        {showAdd ? '✕ Cancel' : '+ Add Price Alert'}
      </button>

      {/* Add Form */}
      {showAdd && (
        <div className="card p-4 mb-4 border-2 border-[#2E7DFF]">
          <p className="font-semibold text-gray-900 text-sm mb-3">🔔 New Price Alert</p>
          <div className="space-y-3">
            <input
              className="input-field"
              placeholder="Medicine name (e.g. Paracetamol 500mg)"
              value={newAlert.medicine}
              onChange={e => setNewAlert({ ...newAlert, medicine: e.target.value })}
            />
            <input
              className="input-field"
              type="number"
              placeholder="Target price (₹)"
              value={newAlert.targetPrice}
              onChange={e => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="Pharmacy (optional)"
              value={newAlert.pharmacy}
              onChange={e => setNewAlert({ ...newAlert, pharmacy: e.target.value })}
            />
            <button onClick={add} className="btn-primary w-full text-sm !py-2.5">
              Set Alert 🔔
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map(a => {
          const diff = a.currentPrice - a.targetPrice;
          const reached = diff <= 0;
          return (
            <div key={a.id} className={`card p-4 border-l-4 ${reached ? 'border-emerald-500' : a.active ? 'border-[#2E7DFF]' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{a.medicine}</p>
                    {reached && <span className="badge-green text-xs">🎉 Target Reached!</span>}
                  </div>
                  <p className="text-xs text-gray-400">{a.pharmacy}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-400">Target</p>
                      <p className="text-sm font-bold text-[#2E7DFF]">₹{a.targetPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Current</p>
                      <p className={`text-sm font-bold ${reached ? 'text-emerald-600' : 'text-gray-900'}`}>₹{a.currentPrice}</p>
                    </div>
                    {!reached && (
                      <div>
                        <p className="text-xs text-gray-400">Gap</p>
                        <p className="text-sm font-bold text-orange-500">₹{diff} more</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => toggle(a.id)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                      a.active ? 'bg-blue-100 text-[#2E7DFF]' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {a.active ? '🔔 Active' : '🔕 Paused'}
                  </button>
                  <button onClick={() => remove(a.id)} className="text-xs text-red-400 hover:text-red-600">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-gray-500 font-medium">No price alerts set</p>
          <p className="text-sm text-gray-400 mt-1">Get notified when medicine prices drop</p>
        </div>
      )}
    </div>
  );
}

// ── Saved Money Tab ───────────────────────────────────────────
function SavedMoneyTab() {
  const savings = JSON.parse(localStorage.getItem('medimap_saved_money') || JSON.stringify(DEFAULT_SAVINGS));

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-4 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <p className="text-xs text-emerald-600 font-medium mb-1">Total Saved</p>
          <p className="text-3xl font-bold text-emerald-600">₹{savings.total}</p>
          <p className="text-xs text-emerald-500 mt-1">Since joining MediMap</p>
        </div>
        <div className="card p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <p className="text-xs text-[#2E7DFF] font-medium mb-1">This Month</p>
          <p className="text-3xl font-bold text-[#2E7DFF]">₹{savings.thisMonth}</p>
          <p className="text-xs text-blue-400 mt-1">Keep comparing prices!</p>
        </div>
      </div>

      {/* Savings Tip */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">Pro Tip</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Always check Jan Aushadhi stores for generic medicines — they can be up to 60% cheaper than branded alternatives!
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <h3 className="font-semibold text-gray-900 text-sm mb-3">Recent Savings</h3>
      <div className="space-y-2">
        {savings.transactions.map((t, i) => (
          <div key={i} className="card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-lg flex-shrink-0">
                💊
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t.medicine}</p>
                <p className="text-xs text-gray-400">
                  Paid ₹{t.cheapest} · Avg was ₹{t.avg} · {timeAgo(t.date)}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-emerald-600">-₹{t.saved}</p>
              <p className="text-xs text-gray-400">saved</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ProfilePage ──────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('history');
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('medimap_user');
    if (!stored) { navigate('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setEditName(u.name || '');
  }, []);

  const logout = () => {
    localStorage.removeItem('medimap_user');
    navigate('/');
  };

  const saveEdit = () => {
    const updated = { ...user, name: editName };
    localStorage.setItem('medimap_user', JSON.stringify(updated));
    setUser(updated);
    setEditMode(false);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const searchHistory = JSON.parse(localStorage.getItem('medimap_search_history') || '[]');
  const savedPharmacies = JSON.parse(localStorage.getItem('medimap_saved_pharmacies') || JSON.stringify(DEFAULT_SAVED_PHARMACIES));
  const myReviews = JSON.parse(localStorage.getItem('medimap_my_reviews') || JSON.stringify(DEFAULT_REVIEWS));
  const savings = JSON.parse(localStorage.getItem('medimap_saved_money') || JSON.stringify(DEFAULT_SAVINGS));

  if (!user) return null;

  const TABS = [
    { id: 'history', icon: '🔍', label: 'Search History' },
    { id: 'pharmacies', icon: '🏥', label: 'Saved Pharmacies' },
    { id: 'reviews', icon: '⭐', label: 'My Reviews' },
    { id: 'alerts', icon: '🔔', label: 'Price Alerts' },
    { id: 'savings', icon: '💰', label: 'Saved Money' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Profile Header ── */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4 flex-wrap">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2E7DFF] to-[#00C2A8] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editMode ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  className="input-field !py-1.5 text-base font-bold max-w-xs"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                />
                <button onClick={saveEdit} className="btn-primary text-xs !py-1.5 !px-3">Save</button>
                <button onClick={() => setEditMode(false)} className="btn-secondary text-xs !py-1.5 !px-3">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                <button onClick={() => setEditMode(true)} className="text-gray-400 hover:text-[#2E7DFF] transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-sm text-gray-400">{user.email}</p>
            {user.googleId && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-[#2E7DFF] px-2 py-0.5 rounded-full mt-1.5 font-medium">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                </svg>
                Google Account
              </span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 border border-red-100 hover:bg-red-50 transition-all"
          >
            🚪 {lang === 'hi' ? 'लॉगआउट' : 'Logout'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
          {[
            { icon: '🔍', label: 'Searches', value: searchHistory.length || 12 },
            { icon: '🏥', label: 'Saved', value: savedPharmacies.length },
            { icon: '⭐', label: 'Reviews', value: myReviews.length },
            { icon: '💰', label: 'Total Saved', value: `₹${savings.total}` },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50">
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {TABS.map(tab => (
          <TabBtn
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'history' && <SearchHistoryTab navigate={navigate} />}
      {activeTab === 'pharmacies' && <SavedPharmaciesTab />}
      {activeTab === 'reviews' && <MyReviewsTab />}
      {activeTab === 'alerts' && <PriceAlertsTab />}
      {activeTab === 'savings' && <SavedMoneyTab />}
    </div>
  );
}
