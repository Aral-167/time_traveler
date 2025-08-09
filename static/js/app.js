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

// Toast helper
function showToast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(()=> el.classList.remove('show'), 1800);
}

// Compact mode toggle
(function(){
  const btn = document.querySelector('.js-compact-toggle');
  if(!btn) return;
  const root = document.documentElement;
  const saved = localStorage.getItem('tt-compact') === '1';
  if(saved) root.classList.add('compact');
  updateLabel();
  btn.addEventListener('click', ()=>{
    root.classList.toggle('compact');
    localStorage.setItem('tt-compact', root.classList.contains('compact') ? '1' : '0');
    updateLabel();
  });
  function updateLabel(){ btn.textContent = root.classList.contains('compact') ? '🔎 Comfortable' : '🗜️ Compact'; }
})();

// Active subnav button on scroll
(function(){
  const map = [ ['#events','🏛️ Events'], ['#births','👶 Births'], ['#deaths','⚰️ Deaths'] ];
  const links = map.map(([id])=> document.querySelector(`a[href="${id}"]`)).filter(Boolean);
  const sections = map.map(([id])=> document.querySelector(id)).filter(Boolean);
  if(!links.length || !sections.length) return;
  const onScroll = ()=>{
    let idx = 0; const y = window.scrollY + 120;
    sections.forEach((sec,i)=>{ if(sec.offsetTop <= y) idx = i; });
    links.forEach((a,i)=> a.classList.toggle('active', i===idx));
  };
  window.addEventListener('scroll', onScroll); onScroll();
})();

// Search highlight
(function(){
  function highlight(el, q){
    // restore
    el.innerHTML = el.textContent;
    if(!q) return;
    const text = el.textContent; const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if(idx === -1) return;
    el.innerHTML = text.slice(0,idx) + '<mark>' + text.slice(idx, idx+q.length) + '</mark>' + text.slice(idx+q.length);
  }
  document.querySelectorAll('.js-filter').forEach(input => {
    const list = input.closest('.card')?.querySelector('ul');
    if(!list) return;
    input.addEventListener('input', ()=>{
      const q = input.value.trim();
      list.querySelectorAll('li').forEach(li=> highlight(li, q));
    });
  });
})();

// Copy current page link
(function(){
  const btn = document.querySelector('.js-copy-link');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard');
    } catch {
      showToast('Copy failed');
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

// Expand/Collapse all lists
(function(){
  const expandAll = document.querySelector('.js-expand-all');
  const collapseAll = document.querySelector('.js-collapse-all');
  function setAll(expanded){
    document.querySelectorAll('ul.items').forEach(list => {
      list.classList.toggle('items--expanded', expanded);
      list.classList.toggle('items--truncated', !expanded);
    });
    document.querySelectorAll('.card .js-toggle').forEach(btn => {
      btn.textContent = expanded ? 'Show less' : 'Show more';
    });
  }
  expandAll?.addEventListener('click', ()=> setAll(true));
  collapseAll?.addEventListener('click', ()=> setAll(false));
})();

// Per-section collapse
(function(){
  document.querySelectorAll('.card .js-collapse').forEach(btn => {
    const section = btn.closest('.card');
    const list = section?.querySelector('ul.items');
    if(!list) return;
    btn.addEventListener('click', ()=>{
      list.classList.remove('items--expanded');
      list.classList.add('items--truncated');
      const toggle = section.querySelector('.js-toggle');
      if(toggle) toggle.textContent = 'Show more';
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
