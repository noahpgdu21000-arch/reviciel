/* RéviCIEL — sauvegarde locale (progression, réglages, fiches perso).
   Tout reste dans le navigateur de l'appareil (localStorage). */
(function (global) {
  'use strict';
  const KEY = 'reviciel.v1';
  const UKEY = 'reviciel.mesfiches.v1';
  const DKEY = 'reviciel.brouillon.v1';
  // Boîtes de Leitner : intervalle (en jours) avant de revoir une carte de la boîte n
  const INTERVALS = [0, 1, 3, 7, 14, 30];

  const pad = (n) => (n < 10 ? '0' : '') + n;
  function today(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(dateStr, n) { const p = dateStr.split('-'); return today(new Date(+p[0], +p[1] - 1, +p[2] + n)); }

  function defaults() {
    return {
      read: {}, fav: {}, quiz: {}, cards: {}, trainers: {}, activity: {}, quizLog: [],
      last: null, streak: { last: null, count: 0 },
      settings: { theme: 'auto', fontSize: 'm', newPerDay: 20 }
    };
  }
  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  let failed = false;
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { if (!failed && api.onError) api.onError(e); failed = true; return false; }
  }
  function normalize(s) {
    const d = defaults();
    s = Object.assign(d, s && typeof s === 'object' ? s : {});
    ['read', 'fav', 'quiz', 'cards', 'trainers', 'activity'].forEach((k) => { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
    if (!Array.isArray(s.quizLog)) s.quizLog = [];
    if (!s.streak || typeof s.streak !== 'object') s.streak = { last: null, count: 0 };
    s.settings = Object.assign(defaults().settings, s.settings || {});
    return s;
  }

  let state = normalize(load(KEY, null));
  let userFiches = load(UKEY, []);
  if (!Array.isArray(userFiches)) userFiches = [];

  const listeners = new Set();
  function save() { write(KEY, state); listeners.forEach((fn) => { try { fn(); } catch (e) {} }); }

  /* ---------- Activité & série de jours ---------- */
  function bump() {
    const t = today();
    state.activity[t] = (state.activity[t] || 0) + 1;
    const s = state.streak;
    if (s.last !== t) { s.count = s.last === addDays(t, -1) ? s.count + 1 : 1; s.last = t; }
  }
  function streak() {
    const s = state.streak, t = today();
    return s.last === t || s.last === addDays(t, -1) ? s.count : 0;
  }

  /* ---------- Cartes (Leitner) ---------- */
  function grade(id, g) { // g : 0 = à revoir, 1 = hésitant, 2 = je savais
    const t = today();
    const c = state.cards[id] || { box: 0, due: t, reps: 0, lapses: 0, first: t };
    if (g === 2) { c.box = Math.min(5, c.box + 1); c.due = addDays(t, INTERVALS[c.box]); }
    else if (g === 1) { c.box = Math.max(1, c.box); c.due = addDays(t, 1); }
    else { c.box = 1; c.lapses = (c.lapses || 0) + 1; c.due = t; }
    c.reps = (c.reps || 0) + 1;
    c.seen = t;
    state.cards[id] = c;
    bump(); save();
    return c;
  }
  const cardInfo = (id) => state.cards[id] || null;
  const isNew = (id) => !state.cards[id];
  const isDue = (id) => !!state.cards[id] && state.cards[id].due <= today();
  const isMastered = (id) => !!state.cards[id] && state.cards[id].box >= 4;
  function newSeenToday() {
    const t = today();
    let n = 0;
    for (const k in state.cards) if (state.cards[k].first === t) n++;
    return n;
  }

  /* ---------- Fiches lues, favoris, quiz ---------- */
  function setRead(id, v) { if (v) { state.read[id] = today(); bump(); } else delete state.read[id]; save(); }
  function toggleFav(id) { if (state.fav[id]) delete state.fav[id]; else state.fav[id] = today(); save(); return !!state.fav[id]; }
  function setLast(id) { if (state.last !== id) { state.last = id; save(); } }
  function saveQuiz(key, correct, total) {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const q = state.quiz[key] || { best: 0, last: 0, attempts: 0 };
    q.last = pct; q.best = Math.max(q.best, pct); q.attempts++; q.date = today();
    state.quiz[key] = q;
    state.quizLog.push({ k: key, p: pct, n: total, d: today() });
    if (state.quizLog.length > 300) state.quizLog = state.quizLog.slice(-300);
    bump(); save();
    return q;
  }
  function trainerResult(id, ok) {
    const t = state.trainers[id] || { ok: 0, total: 0, best: 0, streak: 0 };
    t.total++;
    if (ok) { t.ok++; t.streak++; t.best = Math.max(t.best, t.streak); } else t.streak = 0;
    state.trainers[id] = t;
    bump(); save();
    return t;
  }
  function setSetting(k, v) { state.settings[k] = v; save(); }

  /* ---------- Fiches perso ---------- */
  function saveUserFiches() { return write(UKEY, userFiches); }
  function upsertUserFiche(id, src) {
    const now = Date.now();
    const f = userFiches.find((x) => x.id === id);
    if (f) { f.src = src; f.updated = now; } else userFiches.push({ id, src, created: now, updated: now });
    return saveUserFiches();
  }
  function deleteUserFiche(id) { userFiches = userFiches.filter((x) => x.id !== id); saveUserFiches(); }

  /* ---------- Brouillon de l'éditeur ---------- */
  const getDraft = () => load(DKEY, null);
  const setDraft = (d) => { try { localStorage.setItem(DKEY, JSON.stringify(d)); } catch (e) {} };
  const clearDraft = () => { try { localStorage.removeItem(DKEY); } catch (e) {} };

  /* ---------- Sauvegarde / restauration ---------- */
  function exportAll() {
    return { app: 'RéviCIEL', format: 1, exported: new Date().toISOString(), progress: state, userFiches };
  }
  function importAll(obj) {
    if (!obj || obj.app !== 'RéviCIEL') throw new Error('Ce fichier ne vient pas de RéviCIEL.');
    if (obj.progress) state = normalize(obj.progress);
    if (Array.isArray(obj.userFiches)) {
      obj.userFiches.forEach((f) => {
        if (!f || typeof f.id !== 'string' || typeof f.src !== 'string') return;
        const cur = userFiches.find((x) => x.id === f.id);
        if (cur) Object.assign(cur, f); else userFiches.push(f);
      });
      saveUserFiches();
    }
    save();
  }
  function resetProgress() {
    const settings = state.settings;
    state = defaults();
    state.settings = settings;
    save();
  }

  const api = {
    INTERVALS, today, addDays, save, streak, grade, cardInfo, isNew, isDue, isMastered, newSeenToday,
    setRead, toggleFav, setLast, saveQuiz, trainerResult, setSetting,
    upsertUserFiche, deleteUserFiche, getDraft, setDraft, clearDraft,
    exportAll, importAll, resetProgress,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    onError: null
  };
  Object.defineProperty(api, 'state', { get: () => state });
  Object.defineProperty(api, 'userFiches', { get: () => userFiches });
  global.Store = api;
})(window);
