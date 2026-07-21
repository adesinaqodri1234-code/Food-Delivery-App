(function(){
  const navToggle = document.getElementById("navToggle");
  const navRight = document.querySelector(".nav-right");
  if (!navToggle || !navRight) return;

  function closeMenu() {
    navRight.classList.remove('active');
    document.body.classList.remove('nav-open');
  }

  navToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const active = navRight.classList.toggle("active");
    document.body.classList.toggle("nav-open", active);
  });

  navRight.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function(ev) {
    if (navRight.classList.contains('active') && !navRight.contains(ev.target) && ev.target !== navToggle) {
      closeMenu();
    }
  });

  const filterButtons = document.querySelectorAll('.filter-btn');
  const dishCards = document.querySelectorAll('.dish-card');

  if (filterButtons.length && dishCards.length) {
    function updateFilter(category) {
      filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
      });

      dishCards.forEach(card => {
        const cardCategory = card.dataset.category || 'all';
        card.style.display = category === 'all' || cardCategory === category ? 'grid' : 'none';
      });
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        updateFilter(btn.dataset.filter);
      });
    });
  }
})();

// ── AI Chat widget ──
(function(){
  const toggle = document.getElementById('aiToggle');
  const panel = document.getElementById('aiPanel');
  const form = document.getElementById('aiForm');
  const input = document.getElementById('aiInput');
  const messages = document.getElementById('aiMessages');

  if (!toggle || !panel || !form) return;

  // Same-origin locally, Render backend once deployed elsewhere (e.g. Netlify)
  const aiApiUrl = window.location.hostname === "localhost"
    ? "http://localhost:5174/api/ai"
    : "https://food-delivery-app-9b2c.onrender.com/api/ai";

  // Keeps the running conversation so the assistant remembers context.
  // Only role/content are sent to the server — kept small and simple.
  const conversation = [];

  toggle.addEventListener('click', () => {
    const opened = !panel.hasAttribute('hidden');
    if (opened) panel.setAttribute('hidden', ''); else panel.removeAttribute('hidden');
  });

  // innerHTML is used (not textContent) so the assistant can include clickable
  // order links. Replies only ever come from our own backend, which only ever
  // inserts <a href="order.html?item=..."> tags around known dish names — so
  // this is safe from arbitrary user-controlled markup.
  function addMessage(html, from='assistant'){
    const el = document.createElement('div');
    el.className = `ai-message ai-${from}`;
    el.innerHTML = html;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    addMessage('Thinking...', 'assistant');

    try {
      const resp = await fetch(aiApiUrl, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: text, history: conversation })
      });
      const data = await resp.json();
      const reply = data.reply || 'The assistant is currently unavailable. Please check your OpenAI key and billing/quota settings.';

      // replace last assistant "Thinking..." with real reply
      const last = messages.querySelector('.ai-assistant:last-of-type');
      if (last) last.innerHTML = reply;
      else addMessage(reply, 'assistant');

      // remember this turn for the next request
      conversation.push({ role: 'user', content: text });
      conversation.push({ role: 'assistant', content: reply });
    } catch (err) {
      const last = messages.querySelector('.ai-assistant:last-of-type');
      const errMsg = 'The assistant could not connect. Please try again shortly.';
      if (last) last.textContent = errMsg;
      else addMessage(errMsg, 'assistant');
    }
  });
})();