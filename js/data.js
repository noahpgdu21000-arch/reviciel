/* RéviCIEL — matières, icônes, chargement des fiches, statistiques et recherche */
(function (global) {
  'use strict';

  /* ---------- Icônes (SVG en ligne, fonctionnent hors ligne) ---------- */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    cards: '<rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6"/><path d="M12 17.2h.01"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    settings: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-6.8 0-3.7-2.4-6.3-4.1-8.2-.5 2-1.6 3.3-2.9 3.9.3-3.4-1.2-6.4-4-8.9.2 3.6-1.6 5.8-3.2 7.8C3.7 11.3 5 13.3 5 15.2 5 19.3 8 22 12 22Z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    left: '<path d="m15 6-6 6 6 6"/>',
    back: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.9 8.4 2.5 12 2.5 12S6 19 12 19a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    volume: '<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    printer: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    upload: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',
    trash: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    shuffle: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M12 7v7"/><path d="m9 11 3 3 3-3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    book: '<path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0 0 4h14"/><path d="M8 7h8M8 11h5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/>',
    sigma: '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
    speech: '<path d="M21 12a8 8 0 0 1-11.8 7L4 20.5l1.5-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 10h7M8.5 14h4"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>',
    heart: '<path d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"/><path d="M7 12h3l1.5-2.5L14 15l1.5-3H17"/>',
    network: '<rect x="9" y="2.5" width="6" height="5" rx="1"/><rect x="2.5" y="16.5" width="6" height="5" rx="1"/><rect x="15.5" y="16.5" width="6" height="5" rx="1"/><path d="M12 7.5V12M5.5 16.5V12h13v4.5"/>',
    shield: '<path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6Z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9.5a2 2 0 0 1 4 0V11"/>',
    code: '<path d="m8 7-5 5 5 5"/><path d="m16 7 5 5-5 5"/><path d="m13.5 4-3 16"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    wrench: '<path d="M14.5 3.5a5 5 0 0 0-4.3 7.1l-6.6 6.6a2 2 0 0 0 2.8 2.8l6.6-6.6a5 5 0 0 0 7.1-4.3l-3 1.5-2.6-.9-.9-2.6Z"/>',
    binary: '<rect x="4" y="3" width="5" height="8" rx="2"/><path d="M15 3v8M13 3h2"/><path d="M6 13v8M4 13h2"/><rect x="13" y="13" width="5" height="8" rx="2"/>',
    ohm: '<path d="M4 20h5v-2.5A7 7 0 1 1 15 17.5V20h5"/>',
    resistor: '<path d="M2 12h4l1.5-3 3 6 3-6 3 6 1.5-3h4"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    wifi: '<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><path d="M12 19.5h.01"/>'
  };
  function icon(name, cls) {
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.info) + '</svg>';
  }

  /* ---------- Matières ---------- */
  const GROUPS = [
    { id: 'gen', name: 'Matières générales', short: 'Général' },
    { id: 'pro', name: 'Enseignement professionnel CIEL', short: 'Pro CIEL' }
  ];
  const SUBJECTS = [
    { id: 'francais', name: 'Français', group: 'gen', icon: 'book', color: '#db2777', desc: 'Roman et personnage, invention et imaginaire, figures de style, argumentation.' },
    { id: 'hg-emc', name: 'Histoire-Géo & EMC', group: 'gen', icon: 'globe', color: '#b45309', desc: 'Hommes et femmes au travail (XIXe siècle), essor industriel, travail des enfants, tertiaire, Hubertine Auclert.' },
    { id: 'maths', name: 'Mathématiques', group: 'gen', icon: 'sigma', color: '#2563eb', desc: 'Automatismes, statistiques, probabilités, suites, second degré, trigonométrie.' },
    { id: 'physique-chimie', name: 'Physique-Chimie', group: 'gen', icon: 'flask', color: '#7c3aed', desc: 'Signaux périodiques, puissance et énergie, ondes, chimie et sécurité.' },
    { id: 'anglais', name: 'Anglais', group: 'gen', icon: 'speech', color: '#0891b2', desc: 'Temps des verbes, verbes irréguliers, anglais technique informatique.' },
    { id: 'eco-gestion', name: 'Économie-Gestion', group: 'gen', icon: 'briefcase', color: '#059669', desc: "L'entreprise, le contrat de travail, le salaire et les droits du salarié." },
    { id: 'pse', name: 'PSE', group: 'gen', icon: 'heart', color: '#dc2626', desc: 'Prévention des risques, risque électrique, écrans et bruit, premiers secours.' },
    { id: 'reseaux', name: 'Réseaux', group: 'pro', icon: 'network', color: '#0284c7', desc: 'Bases, modèle OSI, adressage IPv4, protocoles, VLAN, Wi-Fi, dépannage.' },
    { id: 'cyber', name: 'Cybersécurité', group: 'pro', icon: 'shield', color: '#0d9488', desc: 'Fondamentaux, menaces, bonnes pratiques, cryptographie, sécuriser un réseau.' },
    { id: 'info', name: 'Informatique & code', group: 'pro', icon: 'code', color: '#4f46e5', desc: 'Numération, architecture PC, Linux et Windows, Python.' },
    { id: 'electronique', name: 'Électronique', group: 'pro', icon: 'cpu', color: '#ea580c', desc: 'Lois de base, composants, logique et CAN, microcontrôleurs et bus.' },
    { id: 'maintenance', name: 'Maintenance & client', group: 'pro', icon: 'wrench', color: '#65a30d', desc: 'Types de maintenance, diagnostic, ticket, relation client.' },
    { id: 'perso', name: 'Mes fiches perso', group: 'perso', icon: 'pen', color: '#64748b', desc: 'Les fiches que tu as créées toi-même.' }
  ];
  const SUBJ = {};
  SUBJECTS.forEach((s, i) => { s.index = i; SUBJ[s.id] = s; });

  /* ---------- Outils ---------- */
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ---------- Chargement des fiches ---------- */
  let FICHES = [], BY_ID = {}, CARDS = [], QUESTIONS = [];
  function add(f, origin) {
    if (!f.id) f.id = (origin === 'user' ? 'perso-' : '') + RCMD.slugify(f.title);
    if (BY_ID[f.id]) { console.warn('Fiche en double ignorée :', f.id); return; }
    if (!SUBJ[f.subject]) f.subject = 'perso';
    f.origin = origin;
    const seen = {};
    f.cards.forEach((c) => {
      let id = f.id + ':' + hash(c.q);
      while (seen[id]) id += '+';
      seen[id] = 1;
      c.id = id; c.fiche = f;
      CARDS.push(c);
    });
    f.quiz.forEach((q, i) => { q.id = f.id + ':q' + i; q.fiche = f; QUESTIONS.push(q); });
    f.plain = RCMD.toPlain(f.body);
    f._title = norm(f.title);
    f._tags = norm(f.tags.join(' ') + ' ' + f.chapter);
    f._all = norm([f.title, f.chapter, f.summary, f.tags.join(' '), f.plain, f.cards.map((c) => c.q + ' ' + c.a).join(' ')].join(' \n '));
    f.words = f.plain.split(/\s+/).filter(Boolean).length;
    FICHES.push(f);
    BY_ID[f.id] = f;
  }
  function load() {
    FICHES = []; BY_ID = {}; CARDS = []; QUESTIONS = [];
    const files = (global.REVICIEL_CONTENT && global.REVICIEL_CONTENT.files) || [];
    files.forEach((src) => { try { add(RCMD.parseFiche(src), 'official'); } catch (e) { console.error(e); } });
    Store.userFiches.forEach((u) => {
      try { const f = RCMD.parseFiche(u.src); f.id = u.id; f.updated = u.updated; add(f, 'user'); } catch (e) { console.error(e); }
    });
    FICHES.sort((a, b) => (SUBJ[a.subject].index - SUBJ[b.subject].index) || (a.origin === b.origin ? 0 : a.origin === 'official' ? -1 : 1) || (a.order - b.order) || a.title.localeCompare(b.title, 'fr'));
  }

  /* ---------- Statistiques ---------- */
  function ficheStats(f) {
    const t = Store.today();
    let mastered = 0, seen = 0, due = 0;
    f.cards.forEach((c) => {
      const s = Store.cardInfo(c.id);
      if (s) { seen++; if (s.box >= 4) mastered++; if (s.due <= t) due++; }
    });
    const q = Store.state.quiz['f:' + f.id];
    const read = !!Store.state.read[f.id];
    let num = read ? 1 : 0, den = 1;
    if (f.cards.length) { num += mastered / f.cards.length; den++; }
    if (f.quiz.length) { num += q ? q.best / 100 : 0; den++; }
    const x = Store.state.quiz['x:' + f.id];
    if (f.exercises && f.exercises.length) { num += x ? x.best / 100 : 0; den++; }
    return { read, cards: f.cards.length, mastered, seen, due, quizBest: q ? q.best : null, quizCount: f.quiz.length, exBest: x ? x.best : null, score: num / den };
  }
  function subjectStats(sid) {
    const list = FICHES.filter((f) => f.subject === sid);
    if (!list.length) return { count: 0, read: 0, score: 0, cards: 0, mastered: 0 };
    let read = 0, score = 0, cards = 0, mastered = 0;
    list.forEach((f) => { const s = ficheStats(f); if (s.read) read++; score += s.score; cards += s.cards; mastered += s.mastered; });
    return { count: list.length, read, score: score / list.length, cards, mastered };
  }
  function dailyQueue() {
    const t = Store.today(), due = [], fresh = [];
    CARDS.forEach((c) => { const s = Store.cardInfo(c.id); if (!s) fresh.push(c); else if (s.due <= t) due.push(c); });
    const limit = Math.max(0, (Store.state.settings.newPerDay || 20) - Store.newSeenToday());
    // Nouvelles cartes : d'abord celles des fiches déjà lues, dans l'ordre des fiches
    const freshSorted = fresh.map((c, i) => ({ c, i, r: Store.state.read[c.fiche.id] ? 0 : 1 })).sort((a, b) => a.r - b.r || a.i - b.i).map((x) => x.c);
    const news = freshSorted.slice(0, limit);
    return { due: shuffle(due), news, queue: shuffle(due).concat(news) };
  }

  /* ---------- Recherche ---------- */
  function search(q) {
    const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
    if (!terms.length) return [];
    const out = [];
    FICHES.forEach((f) => {
      let score = 0;
      for (const t of terms) {
        if (f._all.indexOf(t) === -1) return;
        if (f._title.indexOf(t) !== -1) score += 12;
        if (f._tags.indexOf(t) !== -1) score += 6;
        score += Math.min(6, f._all.split(t).length - 1);
      }
      out.push({ f, score, snippet: snippet(f, terms) });
    });
    return out.sort((a, b) => b.score - a.score);
  }
  function snippet(f, terms) {
    const plain = f.plain.replace(/\n/g, ' · ');
    const np = norm(plain);
    let i = -1, term = '';
    for (const t of terms) { i = np.indexOf(t); if (i !== -1) { term = t; break; } }
    const E = RCMD.esc;
    if (i === -1) return E(plain.slice(0, 150)) + (plain.length > 150 ? '…' : '');
    const s = Math.max(0, i - 60), e = Math.min(plain.length, i + term.length + 90);
    return (s > 0 ? '…' : '') + E(plain.slice(s, i)) + '<mark>' + E(plain.slice(i, i + term.length)) + '</mark>' + E(plain.slice(i + term.length, e)) + (e < plain.length ? '…' : '');
  }

  global.RC = {
    icon, GROUPS, SUBJECTS, SUBJ, norm, hash, shuffle, load, ficheStats, subjectStats, dailyQueue, search,
    get fiches() { return FICHES; },
    get cards() { return CARDS; },
    get questions() { return QUESTIONS; },
    fiche: (id) => BY_ID[id] || null,
    subjectFiches: (sid) => FICHES.filter((f) => f.subject === sid)
  };
})(window);
