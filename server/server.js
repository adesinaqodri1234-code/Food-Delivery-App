require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;

const MENU_ITEMS = [
  { name: "Classic Margherita", category: "Pizza", price: 12, description: "Fresh mozzarella, hand-torn basil, San Marzano tomato sauce on a golden, blistered crust." },
  { name: "Sushi Bowl", category: "Asian", price: 18, description: "Tiger shrimp, creamy avocado, sushi rice, crisp seaweed salad, toasted sesame dressing." },
  { name: "Signature Burger", category: "Burgers", price: 15, description: "200g Angus beef, house special sauce, aged cheddar, bread-and-butter pickles, crispy onions." },
  { name: "Harvest Salad", category: "Healthy", price: 13, description: "Mixed greens, honey-roasted squash, red quinoa, toasted almonds, lemon vinaigrette." },
  { name: "Berry Cheesecake", category: "Desserts", price: 10, description: "Velvety New York–style cheesecake topped with warm mixed-berry compote on a buttery graham crust." },
  { name: "Tonkotsu Ramen", category: "Asian", price: 16, description: "Rich pork-bone broth, wavy noodles, chashu pork belly, soft-boiled egg, nori, bamboo shoots." }
];

function buildMenuText() {
  return MENU_ITEMS.map(i => `- ${i.name} (${i.category}, $${i.price}): ${i.description}`).join('\n');
}

function buildFallbackReply(message) {
  const text = (message || '').toLowerCase();
  if (text.includes('spicy') || text.includes('rich') || text.includes('savory') || text.includes('ramen')) {
    return "If you're after something rich and savory, try our Tonkotsu Ramen ($16) — pork-bone broth, chashu pork, soft-boiled egg. Comfort food done right.";
  }
  if (text.includes('light') || text.includes('healthy') || text.includes('salad') || text.includes('diet')) {
    return "For something lighter, go with the Harvest Salad ($13) — mixed greens, roasted squash, quinoa, and a lemon vinaigrette.";
  }
  if (text.includes('sweet') || text.includes('dessert') || text.includes('craving sugar')) {
    return "Sounds like a Berry Cheesecake moment ($10) — velvety cheesecake with warm mixed-berry compote.";
  }
  if (text.includes('burger') || text.includes('meat') || text.includes('beef')) {
    return "The Signature Burger ($15) is a great pick — Angus beef, aged cheddar, crispy onions, house sauce.";
  }
  if (text.includes('pizza') || text.includes('cheese')) {
    return "You can't go wrong with the Classic Margherita ($12) — fresh mozzarella, basil, San Marzano tomato sauce.";
  }
  if (text.includes('sushi') || text.includes('seafood') || text.includes('shrimp')) {
    return "Try the Sushi Bowl ($18) — tiger shrimp, avocado, sushi rice, and seaweed salad.";
  }
  return "I can help you pick something! Tell me what you're in the mood for — spicy, light, sweet, or something hearty — and I'll recommend a dish from our menu.";
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
          { role: 'system', content: `You are FreshBite's food assistant. Recommend dishes ONLY from this menu based on the user's mood, cravings, or dietary needs. Be warm and conversational, suggest 1-2 dishes max per reply, and mention the price. If nothing on the menu fits what they want, say so honestly instead of inventing a dish.

Menu:
${buildMenuText()}` },
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