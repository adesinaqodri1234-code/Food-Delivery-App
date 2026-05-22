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
