// ============================================================
// backend/routes/chat.js
// Groq AI Chatbot Route — mic + typing support
// ============================================================
const express = require('express');
const router = express.Router();
const axios = require('axios');

const { mockMedicines, mockPharmacies } = require('../data/seed');

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// POST /api/chat
router.post('/', async (req, res) => {
  const { message, userLat, userLng, conversationHistory = [] } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  // Build context
  const medicineNames = mockMedicines
    .slice(0, 20)
    .map(m => `${m.name} (${m.genericName})`)
    .join(', ');

  const nearbyPharmacies = userLat && userLng
    ? mockPharmacies
        .map(p => ({
          ...p,
          distance: haversineDistance(
            parseFloat(userLat), parseFloat(userLng),
            p.location.coordinates[1], p.location.coordinates[0]
          )
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5)
        .map(p => `${p.name} (${p.address}, ${p.distance.toFixed(1)}km, ${p.isOpen ? 'Open' : 'Closed'}, Rating: ${p.rating})`)
        .join('; ')
    : 'Location not provided — ask user for their city';

  const systemPrompt = `You are MediMap Assistant 🏥, a helpful AI for a medicine search and pharmacy comparison platform in India (Faridabad, Haryana).

You help users:
1. Find information about medicines and their generic alternatives (always suggest cheaper generics)
2. Locate nearby pharmacies and compare prices
3. Provide basic medicine information (ALWAYS advise consulting a doctor)
4. Help users save money on medicines

Available medicines: ${medicineNames}
Nearby pharmacies: ${nearbyPharmacies}

Rules:
- Always recommend consulting a doctor for medical advice
- Suggest generic alternatives — they are same quality but much cheaper
- Be concise, friendly, max 120 words
- Reply in same language as user (Hindi or English)
- For pharmacy queries, use the nearby pharmacies listed above
- If asked about price comparison, tell them to search on MediMap
- Never recommend specific dosages without doctor consultation`;

  try {
    const { data } = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-6),
          { role: 'user', content: message },
        ],
      },
      {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` }
      }
    );

    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that. Please try again.';
    res.json({ reply });
  } catch (err) {
    console.error('Groq error:', err.response?.data || err.message);
    res.json({ reply: 'I am having trouble connecting. Please try again in a moment.' });
  }
});

module.exports = router;
