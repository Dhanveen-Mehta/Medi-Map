// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// In-memory store (replace with MongoDB in production)
// Structure: { id, medicineName, price, pharmacyName, userId, userName, imagePath, imageOriginalName, status, submittedAt }
let pendingSubmissions = [];

// ── GET all submissions ───────────────────────────────────────
// GET /api/admin/submissions?status=pending|approved|rejected|all
router.get('/submissions', (req, res) => {
  const { status = 'all' } = req.query;
  const filtered = status === 'all'
    ? pendingSubmissions
    : pendingSubmissions.filter(s => s.status === status);
  res.json({ submissions: filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)) });
});

// ── GET single submission ─────────────────────────────────────
router.get('/submissions/:id', (req, res) => {
  const sub = pendingSubmissions.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });
  res.json(sub);
});

// ── POST new submission (called from SubmitPricePage) ─────────
router.post('/submissions', (req, res) => {
  const { medicineName, price, pharmacyName, userName, userId, imagePath, imageOriginalName, imageUrl } = req.body;
  if (!medicineName || !price || !pharmacyName) {
    return res.status(400).json({ error: 'medicineName, price, pharmacyName are required' });
  }
  const submission = {
    id: `sub_${Date.now()}`,
    medicineName,
    price: parseFloat(price),
    pharmacyName,
    userName: userName || 'Anonymous',
    userId: userId || 'anonymous',
    imagePath: imagePath || null,
    imageOriginalName: imageOriginalName || null,
    imageUrl: imageUrl || null,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
  };
  pendingSubmissions.push(submission);
  console.log(`📥 New price submission: ${medicineName} @ ₹${price} from ${pharmacyName}`);
  res.status(201).json(submission);
});

// ── PATCH approve/reject ──────────────────────────────────────
router.patch('/submissions/:id', (req, res) => {
  const { action, adminKey } = req.body; // action: 'approve' | 'reject'

  // Simple admin key check (set in .env as ADMIN_KEY)
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }

  const idx = pendingSubmissions.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Submission not found' });

  pendingSubmissions[idx] = {
    ...pendingSubmissions[idx],
    status: action === 'approve' ? 'approved' : 'rejected',
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'admin',
  };

  // If approved — update mock price data
  if (action === 'approve') {
    console.log(`✅ APPROVED: ${pendingSubmissions[idx].medicineName} @ ₹${pendingSubmissions[idx].price} from ${pendingSubmissions[idx].pharmacyName}`);
    // In production: update MongoDB Price collection here
  } else {
    console.log(`❌ REJECTED: ${pendingSubmissions[idx].medicineName}`);
  }

  res.json(pendingSubmissions[idx]);
});

// ── DELETE submission ─────────────────────────────────────────
router.delete('/submissions/:id', (req, res) => {
  const { adminKey } = req.body;
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
  if (adminKey !== ADMIN_KEY) return res.status(403).json({ error: 'Invalid admin key' });
  pendingSubmissions = pendingSubmissions.filter(s => s.id !== req.params.id);
  res.json({ success: true });
});

// ── GET stats ─────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  res.json({
    total: pendingSubmissions.length,
    pending: pendingSubmissions.filter(s => s.status === 'pending').length,
    approved: pendingSubmissions.filter(s => s.status === 'approved').length,
    rejected: pendingSubmissions.filter(s => s.status === 'rejected').length,
  });
});

// Expose pendingSubmissions for use in server.js scan route
module.exports = router;
module.exports.getPendingSubmissions = () => pendingSubmissions;
module.exports.addSubmission = (sub) => pendingSubmissions.push(sub);
