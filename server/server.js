require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5174;

function buildFallbackReply(message) {
  const text = (message || '').toLowerCase();

  if (text.includes('menu') || text.includes('dish') || text.includes('food') || text.includes('pizza') || text.includes('burger') || text.includes('salad')) {
    return 'FreshBite offers pizza, sushi, burgers, salads, desserts, and more. You can browse them on the Menu page.';
  }
  if (text.includes('order') || text.includes('checkout') || text.includes('pay')) {
    return 'You can place your order from the Order page. It includes delivery details and payment choices.';
  }
  if (text.includes('track') || text.includes('delivery') || text.includes('eta')) {
    return 'You can follow your delivery on the Track page. It shows status updates and an estimated arrival time.';
  }
  if (text.includes('about') || text.includes('who')) {
    return 'FreshBite is a food delivery app that connects you with local restaurants and fast delivery.';
  }

  return 'I can help you explore the menu, place an order, or track a delivery. Try asking about dishes, checkout, or delivery updates.';
}

// Serve static frontend for convenience (optional)
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/ai', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    return res.json({ reply: buildFallbackReply(message), fallback: true });
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are FreshBite assistant. Help users with menu, ordering, and tracking.' },
          { role: 'user', content: message }
        ],
        max_tokens: 350,
        temperature: 0.7
      })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      const isQuotaIssue = txt.includes('insufficient_quota') || txt.includes('invalid_api_key') || txt.includes('401');
      if (isQuotaIssue) {
        return res.json({ reply: buildFallbackReply(message), fallback: true });
      }
      return res.status(502).json({ error: 'AI provider error', details: txt });
    }

    const data = await resp.json();
    const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: buildFallbackReply(message), fallback: true });
  }
});

app.listen(PORT, () => console.log(`AI proxy running on http://localhost:${PORT}`));
