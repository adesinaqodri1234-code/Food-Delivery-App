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

  toggle.addEventListener('click', () => {
    const opened = !panel.hasAttribute('hidden');
    if (opened) panel.setAttribute('hidden', ''); else panel.removeAttribute('hidden');
  });

  function addMessage(text, from='assistant'){
    const el = document.createElement('div');
    el.className = `ai-message ai-${from}`;
    el.textContent = text;
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
      const resp = await fetch('/api/ai', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: text })
      });
      const data = await resp.json();
      const fallback = data.reply || 'The assistant is currently unavailable. Please check your OpenAI key and billing/quota settings.';
      // replace last assistant "Thinking..." with real reply
      const last = messages.querySelector('.ai-assistant:last-of-type');
      if (last) last.textContent = fallback;
      else addMessage(fallback, 'assistant');
    } catch (err) {
      addMessage('Error contacting assistant.', 'assistant');
    }
  });
})();

