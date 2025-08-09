// Basic UI interactivity and enhancements
(function(){
  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Animate cards on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.card').forEach(card => {
    card.classList.add('pre-animate');
    observer.observe(card);
  });

  // Auto-focus year input on home page
  const yearInput = document.getElementById('year');
  if (yearInput) yearInput.focus();
})();

// Copy current page link
(function(){
  const btn = document.querySelector('.js-copy-link');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      btn.textContent = '✅ Copied!';
      setTimeout(() => (btn.textContent = '🔗 Copy link'), 1500);
    } catch {
      btn.textContent = '❌ Failed';
      setTimeout(() => (btn.textContent = '🔗 Copy link'), 1500);
    }
  });
})();

// Filter lists per section
(function(){
  document.querySelectorAll('.card .js-filter').forEach(input => {
    const section = input.closest('.card');
    const list = section.querySelector('ul');
    const items = Array.from(list ? list.children : []);
    const countChip = section.querySelector('.js-count');

    function applyFilter() {
      const q = input.value.toLowerCase();
      let visible = 0;
      items.forEach(li => {
        const show = li.textContent.toLowerCase().includes(q);
        li.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (countChip) countChip.textContent = visible;
    }

    input.addEventListener('input', applyFilter);
  });
})();

// Toggle show more/less per section
(function(){
  document.querySelectorAll('.card .js-toggle').forEach(btn => {
    const section = btn.closest('.card');
    const list = section.querySelector('ul');
    if (!list) return;

    function setExpanded(expanded) {
      list.classList.toggle('items--expanded', expanded);
      list.classList.toggle('items--truncated', !expanded);
      btn.textContent = expanded ? 'Show less' : 'Show more';
    }

    // initial label
    setExpanded(false);

    btn.addEventListener('click', () => {
      const expanded = !list.classList.contains('items--expanded');
      setExpanded(expanded);
    });
  });
})();

// Theme toggle (light/dark)
(function(){
  const btn = document.querySelector('.js-theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const saved = localStorage.getItem('tt-theme');
  if (saved === 'light') root.classList.add('light');
  updateLabel();

  btn.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('tt-theme', root.classList.contains('light') ? 'light' : 'dark');
    updateLabel();
  });

  function updateLabel(){
    btn.textContent = root.classList.contains('light') ? '🌙 Dark' : '☀️ Light';
  }
})();

// Floating back-to-top button
(function(){
  const fab = document.querySelector('.js-fab-top');
  if (!fab) return;

  const onScroll = () => {
    if (window.scrollY > 300) fab.classList.add('show');
    else fab.classList.remove('show');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  fab.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
