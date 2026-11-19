/* RéviCIEL — outils d'interface, navigation et routeur */
(function (global) {
  'use strict';
  const E = RCMD.esc;
  const icon = RC.icon;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------- Petits composants ---------- */
  const sIcon = (s) => '<span class="s-icon">' + icon(s.icon) + '</span>';
  const pct = (x) => Math.round((x || 0) * 100) + ' %';
  const bar = (x, color) => '<div class="progress"' + (color ? ' style="--c:' + color + '"' : '') + '><i style="width:' + Math.round(Math.max(0, Math.min(1, x || 0)) * 100) + '%"></i></div>';
  const plural = (n, one, many) => n + ' ' + (n > 1 ? many || one + 's' : one);
  function debounce(fn, ms) { let t; return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; }
  const isTyping = (e) => { const t = e.target; return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)); };

  function toast(msg, opts) {
    opts = opts || {};
    const zone = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span>' + E(msg) + '</span>' + (opts.action ? '<button class="btn sm" type="button">' + E(opts.action) + '</button>' : '');
    if (opts.action) el.querySelector('button').onclick = () => { el.remove(); opts.onAction && opts.onAction(); };
    zone.appendChild(el);
    setTimeout(() => el.remove(), opts.duration || 3800);
  }
  function download(filename, text, type) {
    const blob = new Blob([text], { type: (type || 'text/plain') + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function pickFiles(accept, multiple) {
    return new Promise((resolve) => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = accept; inp.multiple = !!multiple;
      inp.onchange = () => resolve(Array.from(inp.files || []));
      inp.click();
    });
  }
  function readFile(file) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsText(file, 'utf-8'); });
  }
  function fileSlug(s) { return RCMD.slugify(s).slice(0, 40) || 'fiche'; }

  /* ---------- Réglages d'affichage ---------- */
  function applySettings() {
    const s = Store.state.settings, root = document.documentElement;
    if (s.theme === 'light' || s.theme === 'dark') root.setAttribute('data-theme', s.theme); else root.removeAttribute('data-theme');
    root.classList.toggle('font-l', s.fontSize === 'l');
    const dark = s.theme === 'dark' || (s.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#121a2b' : '#1d4ed8');
  }

  /* ---------- Navigation (barre latérale + barre du bas) ---------- */
  const NAV = [
    { href: '#/', label: 'Accueil', icon: 'home', re: /^\/$/, tab: true },
    { href: '#/reviser', label: 'Réviser', icon: 'cards', re: /^\/reviser/, tab: true, badge: true },
    { href: '#/quiz', label: 'Quiz', icon: 'quiz', re: /^\/quiz/, tab: true },
    { href: '#/entrainement', label: 'Exercices', icon: 'target', re: /^\/entrainement/, tab: true },
    { href: '#/labo', label: 'Labo réseau', short: 'Labo', icon: 'network', re: /^\/labo/, tab: true },
    { href: '#/mes-fiches', label: 'Mes fiches', icon: 'pen', re: /^\/(mes-fiches|editeur)/ },
    { href: '#/favoris', label: 'Favoris', icon: 'star', re: /^\/favoris/ },
    { href: '#/progression', label: 'Progression', icon: 'chart', re: /^\/progression/ },
    { href: '#/parametres', label: 'Paramètres', icon: 'settings', re: /^\/parametres/ }
  ];
  function renderNav() {
    const dq = RC.dailyQueue();
    const n = dq.due.length + dq.news.length;
    const side = NAV.map((it) => '<a class="nav-link" href="' + it.href + '" data-re="' + it.re.source + '">' + icon(it.icon) + '<span>' + it.label + '</span>' +
      (it.badge && n ? '<span class="count">' + n + '</span>' : '') + '</a>').join('');
    const groups = RC.GROUPS.map((g) => {
      const subs = RC.SUBJECTS.filter((s) => s.group === g.id);
      return '<div class="nav-section">' + E(g.name) + '</div>' + subs.map((s) => {
        const c = RC.subjectFiches(s.id).length;
        return '<a class="nav-link" href="#/matiere/' + s.id + '" data-re="^\\/matiere\\/' + s.id + '(\\/|$)" style="--c:' + s.color + '"><span class="dot"></span><span>' + E(s.name) + '</span><span class="count">' + c + '</span></a>';
      }).join('');
    }).join('');
    const perso = RC.subjectFiches('perso').length;
    document.getElementById('sidebar').innerHTML = side + groups +
      (perso ? '<div class="nav-section">Perso</div><a class="nav-link" href="#/matiere/perso" data-re="^\\/matiere\\/perso" style="--c:#64748b"><span class="dot"></span><span>Mes fiches perso</span><span class="count">' + perso + '</span></a>' : '');
    document.getElementById('tabbar').innerHTML = NAV.filter((it) => it.tab).map((it) =>
      '<a href="' + it.href + '" data-re="' + it.re.source + '">' + icon(it.icon) + '<span>' + (it.short || it.label) + '</span></a>').join('');
    $$('[data-icon]').forEach((el) => { el.innerHTML = icon(el.getAttribute('data-icon')); });
    updateNav();
  }
  function currentPath() { return (decodeURIComponent(location.hash.slice(1)) || '/').split('?')[0] || '/'; }
  function updateNav() {
    const path = currentPath();
    $$('#sidebar a, #tabbar a').forEach((a) => {
      let on = new RegExp(a.getAttribute('data-re')).test(path);
      if (!on && a.closest('#tabbar') && a.getAttribute('href') === '#/' && /^\/(matiere|fiche)\//.test(path)) on = true;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- Routeur ---------- */
  const routes = [];
  let cleanup = null, keyHandler = null;
  function route(re, handler) { routes.push({ re, handler }); }
  function setTitle(t) { document.title = (t ? t + ' · ' : '') + 'RéviCIEL'; }
  function navigate() {
    const raw = decodeURIComponent(location.hash.slice(1)) || '/';
    const qi = raw.indexOf('?');
    const path = (qi === -1 ? raw : raw.slice(0, qi)) || '/';
    const params = new URLSearchParams(qi === -1 ? '' : raw.slice(qi + 1));
    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } }
    cleanup = null; keyHandler = null;
    if (global.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
    const v = document.getElementById('view');
    v.classList.remove('fade-in'); void v.offsetWidth; v.classList.add('fade-in');
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        v.innerHTML = '';
        try {
          const res = r.handler(v, m.slice(1), params);
          if (typeof res === 'function') cleanup = res;
        } catch (e) {
          console.error(e);
          v.innerHTML = '<div class="empty card"><h2>Oups, une erreur</h2><p>' + E(e.message) + '</p><a class="btn" href="#/">Retour à l\'accueil</a></div>';
        }
        updateNav();
        if (!params.get('keepScroll')) window.scrollTo(0, 0);
        if (!document.activeElement || document.activeElement === document.body || !document.activeElement.closest('.topbar')) v.focus({ preventScroll: true });
        return;
      }
    }
    notFound(v);
  }
  function notFound(v, what) {
    setTitle('Introuvable');
    v.innerHTML = '<div class="empty card">' + icon('search') + '<h2>' + E(what || 'Page introuvable') + '</h2><p>Cette page n\'existe pas (ou plus).</p><a class="btn" href="#/">Retour à l\'accueil</a></div>';
  }
  document.addEventListener('keydown', (e) => {
    if (!keyHandler || isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    keyHandler(e);
  });

  /* ---------- Recherche dans la barre du haut ---------- */
  function bindTopSearch() {
    const form = document.getElementById('search-form'), inp = document.getElementById('search-input');
    const go = () => {
      const q = inp.value.trim();
      if (currentPath() === '/recherche') { const big = document.getElementById('sq'); if (big) { big.value = q; big.dispatchEvent(new Event('input')); } }
      else if (q.length > 1) location.hash = '#/recherche?q=' + encodeURIComponent(q);
    };
    inp.addEventListener('input', debounce(go, 250));
    form.addEventListener('submit', (e) => { e.preventDefault(); go(); });
  }

  global.App = {
    E, icon, $, $$, sIcon, pct, bar, plural, debounce, toast, download, pickFiles, readFile, fileSlug,
    applySettings, renderNav, updateNav, route, navigate, notFound, setTitle, bindTopSearch,
    setKeys: (fn) => { keyHandler = fn; },
    go: (hash) => { if (location.hash === hash) navigate(); else location.hash = hash; }
  };
})(window);
