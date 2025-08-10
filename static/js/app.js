/* Apply UI state from URL params before anything else */
(function(){
  try {
    const params = new URLSearchParams(location.search);
    const root = document.documentElement;
    // theme
    const urlTheme = params.get('theme');
    if (urlTheme === 'light' || urlTheme === 'dark') {
      root.classList.toggle('light', urlTheme === 'light');
      localStorage.setItem('tt-theme', urlTheme);
    }
    // compact
    const urlCompact = params.get('compact');
    if (urlCompact === '1' || urlCompact === '0') {
      const on = urlCompact === '1';
      root.classList.toggle('compact', on);
      localStorage.setItem('tt-compact', on ? '1' : '0');
    }
  } catch {}
})();

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

// Scroll progress bar
(function(){
  const bar = document.getElementById('js-progress');
  if(!bar) return;
  const onScroll = ()=>{
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    bar.style.width = Math.max(0, Math.min(1, scrolled)) * 100 + '%';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Robust loading overlay handling
(function(){
  const overlay = document.getElementById('js-loading');
  if(!overlay) return;
  let timer;
  function setHidden(v){
    overlay.hidden = v;
    if (v) {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden','true');
    } else {
      overlay.style.display = 'grid';
      overlay.removeAttribute('aria-hidden');
    }
  }
  const show = () => {
    setHidden(false);
    clearTimeout(timer);
    // Fallback auto-hide in case navigation fails
    timer = setTimeout(() => { setHidden(true); }, 12000);
  };
  const hide = () => { clearTimeout(timer); setHidden(true); };

  // Ensure hidden on (re)load
  hide();
  window.addEventListener('DOMContentLoaded', hide);
  window.addEventListener('load', hide);
  window.addEventListener('pageshow', hide);
  document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState === 'visible') hide(); });
  document.addEventListener('readystatechange', ()=>{ if(document.readyState === 'complete') hide(); });

  // Show for internal year navigations (left-click, no modifiers)
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="/year/"]');
    if(!a) return;
    if(e.defaultPrevented) return;
    if(e.button !== 0) return;
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    show();
  }, { capture: true });

  // Show on any form submit
  document.addEventListener('submit', () => { show(); }, { capture: true });
})();

// Home page year steppers
(function(){
  const wrap = document.querySelector('.year-input');
  if(!wrap) return;
  const input = wrap.querySelector('input[type="number"]');
  const down = wrap.querySelector('.step--down');
  const up = wrap.querySelector('.step--up');
  const clamp = (n)=>{
    const min = parseInt(input.min||'1',10);
    const max = parseInt(input.max||String(new Date().getFullYear()),10);
    return Math.min(max, Math.max(min, n));
  };
  const stepBy = (delta)=>{
    const cur = parseInt(input.value || String(new Date().getFullYear()), 10);
    input.value = String(clamp(cur + delta));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  down?.addEventListener('click', ()=> stepBy(-1));
  up?.addEventListener('click', ()=> stepBy(1));
})();

// Results hero year steppers -> navigate to /year/<y>
(function(){
  const wrap = document.querySelector('.year-input--hero');
  if(!wrap) return;
  const input = wrap.querySelector('input[type="number"]');
  const down = wrap.querySelector('.step--down');
  const up = wrap.querySelector('.step--up');
  const now = new Date().getFullYear();
  const clamp = (n)=> Math.min(now, Math.max(1, Number.isFinite(n)? n : now));
  const go = (y)=>{ window.location.href = `/year/${clamp(y)}`; };
  down?.addEventListener('click', ()=> { const v = parseInt(input.value||`${now}`,10)-1; go(v); });
  up?.addEventListener('click', ()=> { const v = parseInt(input.value||`${now}`,10)+1; go(v); });
  input?.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); const v = parseInt(input.value||`${now}`,10); go(v); }});
})();

// Quickbar behavior
(function(){
  const qb = document.querySelector('.quickbar');
  if(!qb) return;
  const input = qb.querySelector('input[type="number"]');
  const down = qb.querySelector('.step--down');
  const up = qb.querySelector('.step--up');
  const btnTop = qb.querySelector('.js-quick-top');
  const now = new Date().getFullYear();
  const clamp = (n)=> Math.min(now, Math.max(1, Number.isFinite(n)? n : now));
  const go = (y)=>{ window.location.href = `/year/${clamp(y)}`; };
  down?.addEventListener('click', ()=> go(parseInt(input.value||`${now}`,10)-1));
  up?.addEventListener('click', ()=> go(parseInt(input.value||`${now}`,10)+1));
  input?.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); go(parseInt(input.value||`${now}`,10)); } });
  btnTop?.addEventListener('click', ()=> window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// Keyboard shortcuts
(function(){
  const isTyping = () => {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  };
  const parseYearFromPath = ()=>{
    const m = location.pathname.match(/\/year\/(\d{1,4})/);
    return m ? parseInt(m[1], 10) : null;
  };
  const clampYear = (y)=> Math.min(new Date().getFullYear(), Math.max(1, y));
  const goYear = (y)=>{ const yr = clampYear(y); if(!isNaN(yr)) location.href = `/year/${yr}`; };
  const clickIf = (sel)=>{ const el = document.querySelector(sel); if(el) el.click(); };
  const focusFirstFilter = ()=>{ const input = document.querySelector('#events .js-filter, .card .js-filter'); if(input){ input.focus(); input.select?.(); } };

  window.addEventListener('keydown', (e)=>{
    if (isTyping()) return;
    // Show help
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      showToast('Shortcuts: ←/→ year • E expand • C collapse • / search • T top');
      return;
    }
    // Expand/Collapse
    if (e.key.toLowerCase() === 'e') { e.preventDefault(); clickIf('.js-expand-all'); return; }
    if (e.key.toLowerCase() === 'c') { e.preventDefault(); clickIf('.js-collapse-all'); return; }
    // Focus search
    if (e.key === '/') { e.preventDefault(); focusFirstFilter(); return; }
    // Top
    if (e.key.toLowerCase() === 't') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    // Year nav
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const cur = parseYearFromPath(); if(!cur) return;
      e.preventDefault();
      goYear(cur + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
})();

// Command palette logic (press Ctrl+K)
(function(){
  const palette = document.getElementById('cmd');
  const input = palette?.querySelector('input');
  const list = palette?.querySelector('#cmd-list');
  if(!palette || !input || !list) return;
  const actions = [
    { name: 'Expand all', run: ()=> document.querySelector('.js-expand-all')?.click() },
    { name: 'Collapse all', run: ()=> document.querySelector('.js-collapse-all')?.click() },
    { name: 'Go to Events', run: ()=> document.querySelector('#events')?.scrollIntoView({behavior:'smooth'}) },
    { name: 'Go to Births', run: ()=> document.querySelector('#births')?.scrollIntoView({behavior:'smooth'}) },
    { name: 'Go to Deaths', run: ()=> document.querySelector('#deaths')?.scrollIntoView({behavior:'smooth'}) },
    { name: 'Toggle theme', run: ()=> document.querySelector('.js-theme-toggle')?.click() },
    { name: 'Top', run: ()=> window.scrollTo({ top: 0, behavior: 'smooth' }) },
  ];
  function open(){ palette.classList.add('show'); input.value=''; render(''); setTimeout(()=> input.focus(), 0); }
  function close(){ palette.classList.remove('show'); }
  function render(q){
    const term = q.trim().toLowerCase();
    list.innerHTML = '';
    actions.filter(a=> a.name.toLowerCase().includes(term)).forEach(a=>{
      const li = document.createElement('li');
      li.textContent = a.name; li.tabIndex = 0;
      li.addEventListener('click', ()=>{ a.run(); close(); });
      li.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ a.run(); close(); } });
      list.appendChild(li);
    });
  }
  window.addEventListener('keydown', (e)=>{
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.classList.contains('show') ? close() : open(); }
    if (e.key==='Escape' && palette.classList.contains('show')) { e.preventDefault(); close(); }
  });
  input.addEventListener('input', ()=> render(input.value));
})();

// Favorites (localStorage) and modal UI
(function(){
  const key = 'tt-favs';
  const openBtn = document.querySelector('.js-favs-open');
  const modal = document.getElementById('favs-modal');
  const closeBtns = modal ? modal.querySelectorAll('.js-favs-close') : [];
  const list = document.getElementById('favs-list');
  const empty = document.getElementById('favs-empty');
  const countChip = document.querySelector('.js-favs-count');

  function getFavs(){ try { return JSON.parse(localStorage.getItem(key)||'[]'); } catch { return []; } }
  function setFavs(v){ localStorage.setItem(key, JSON.stringify(v)); updateCount(); }
  function updateCount(){ if(countChip) countChip.textContent = getFavs().length; }
  function render(){
    if(!list || !empty) return;
    const favs = getFavs();
    list.innerHTML = '';
    empty.style.display = favs.length ? 'none' : 'block';
    favs.forEach(y => {
      const li = document.createElement('li');
      const link = document.createElement('a'); link.href = `/year/${y}`; link.textContent = y; link.className = 'btn btn-secondary btn-small';
      const del = document.createElement('button'); del.className = 'btn btn-secondary btn-small'; del.textContent = 'Remove';
      del.addEventListener('click', ()=>{ setFavs(favs.filter(n=> n!==y)); render(); });
      li.appendChild(link); li.appendChild(del);
      list.appendChild(li);
    });
  }
  function open(){ if(!modal) return; render(); modal.hidden = false; }
  function close(){ if(!modal) return; modal.hidden = true; }

  openBtn?.addEventListener('click', open);
  closeBtns?.forEach(btn=> btn.addEventListener('click', close));
  modal?.addEventListener('click', (e)=>{ if(e.target.classList.contains('modal__backdrop')) close(); });
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !modal?.hidden) close(); });

  // Add favorite action on year pages
  (function attachAddFavorite(){
    const hero = document.querySelector('.hero-text h2');
    const heroActions = document.querySelector('.hero-actions');
    if(!hero || !heroActions) return;
    const m = hero.textContent?.match(/(\d{1,4})/);
    const y = m ? parseInt(m[1],10) : null;
    if(!y) return;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn btn-secondary'; btn.textContent = '⭐ Add to favorites';
    btn.addEventListener('click', ()=>{
      const favs = getFavs();
      if(!favs.includes(y)) { favs.push(y); favs.sort((a,b)=>a-b); setFavs(favs); showToast('Added to favorites'); }
      else { showToast('Already in favorites'); }
    });
    heroActions.appendChild(btn);
    updateCount();
  })();
})();
