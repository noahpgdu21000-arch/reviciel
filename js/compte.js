/* RéviCIEL — compte en ligne (Firebase) : connexion par e-mail, synchronisation de la progression,
   des fiches perso et des réseaux du mode libre entre tous les appareils. */
(function () {
  'use strict';
  const { E, icon, $ } = App;
  const CFG = {
    apiKey: 'AIzaSyAGKF9_kHy-QWg_NL0YQw9BBlOLGuNjjfA',
    authDomain: 'reviciel.firebaseapp.com',
    projectId: 'reviciel',
    storageBucket: 'reviciel.firebasestorage.app',
    messagingSenderId: '261030889818',
    appId: '1:261030889818:web:2cc1e2519ad51b5cf9cb63'
  };
  const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  const FLAG = 'reviciel.compte';
  const ls = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: (k) => { try { localStorage.removeItem(k); } catch (e) { /* rien */ } }
  };
  const ERR = {
    'auth/email-already-in-use': 'Cette adresse e-mail a déjà un compte : connecte-toi plutôt.',
    'auth/invalid-email': 'Adresse e-mail invalide.',
    'auth/missing-email': 'Saisis ton adresse e-mail.',
    'auth/weak-password': 'Mot de passe trop court : 6 caractères minimum.',
    'auth/missing-password': 'Saisis ton mot de passe.',
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/invalid-login-credentials': 'E-mail ou mot de passe incorrect.',
    'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
    'auth/user-not-found': 'Aucun compte avec cette adresse.',
    'auth/too-many-requests': 'Trop d\'essais : attends quelques minutes avant de recommencer.',
    'auth/network-request-failed': 'Pas de connexion Internet.',
    'auth/requires-recent-login': 'Par sécurité, reconnecte-toi puis recommence.',
    'permission-denied': 'Accès refusé.',
    unavailable: 'Serveur injoignable : vérifie ta connexion Internet.'
  };
  const msg = (e) => ERR[e && e.code] || (e && e.message) || 'Erreur inconnue.';

  let fb = null, loading = null, user = null, admin = false, ready = false;
  let syncing = false, again = false, pushT = null, lastSync = null, status = 'idle', lastError = '', atelierTooBig = false;
  const lastPushed = {};
  const subs = new Set();
  const emit = () => { subs.forEach((fn) => { try { fn(); } catch (e) { /* rien */ } }); badge(); };

  /* ---------- Chargement de Firebase (seulement si on en a besoin) ---------- */
  function load() {
    if (fb) return Promise.resolve(fb);
    if (loading) return loading;
    loading = Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js')])
      .then(([appM, A, F]) => {
        const app = appM.initializeApp(CFG);
        const auth = A.getAuth(app);
        auth.languageCode = 'fr';
        const db = F.getFirestore(app);
        fb = { app, auth, db, A, F };
        return new Promise((resolve) => {
          let first = true;
          A.onAuthStateChanged(auth, (u) => { onUser(u); if (first) { first = false; ready = true; resolve(fb); } });
        });
      })
      .catch((e) => { loading = null; console.warn(e); throw new Error('Impossible de joindre le service de comptes : vérifie ta connexion Internet.'); });
    return loading;
  }

  async function onUser(u) {
    const was = user && user.uid;
    user = u; admin = false;
    if (u) {
      ls.set(FLAG, '1');
      emit();
      try { admin = (await fb.F.getDoc(fb.F.doc(fb.db, 'admins', u.uid))).exists(); } catch (e) { admin = false; }
      if (was !== u.uid) await sync();
    } else {
      ls.del(FLAG);
      Object.keys(lastPushed).forEach((k) => delete lastPushed[k]);
      status = 'idle';
    }
    emit();
  }

  /* ---------- Fusion des données de deux appareils ---------- */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function mergeProgress(L, R) {
    if (!R) return clone(L);
    const out = clone(L);
    out.read = Object.assign({}, R.read || {}, L.read || {});
    out.fav = Object.assign({}, R.fav || {}, L.fav || {});
    out.quiz = Object.assign({}, R.quiz || {});
    Object.keys(L.quiz || {}).forEach((k) => {
      const a = L.quiz[k], b = out.quiz[k];
      if (!b) { out.quiz[k] = a; return; }
      const newer = (a.date || '') >= (b.date || '') ? a : b;
      out.quiz[k] = Object.assign({}, newer, { best: Math.max(a.best || 0, b.best || 0), attempts: Math.max(a.attempts || 0, b.attempts || 0) });
    });
    out.cards = Object.assign({}, R.cards || {});
    Object.keys(L.cards || {}).forEach((k) => {
      const a = L.cards[k], b = out.cards[k];
      if (!b || (a.reps || 0) > (b.reps || 0) || ((a.reps || 0) === (b.reps || 0) && (a.seen || '') >= (b.seen || ''))) out.cards[k] = a;
    });
    out.trainers = Object.assign({}, R.trainers || {});
    Object.keys(L.trainers || {}).forEach((k) => {
      const a = L.trainers[k], b = out.trainers[k] || {};
      out.trainers[k] = Object.assign({}, (a.total || 0) >= (b.total || 0) ? a : b, { best: Math.max(a.best || 0, b.best || 0) });
    });
    out.labs = Object.assign({}, R.labs || {});
    Object.keys(L.labs || {}).forEach((k) => {
      const a = L.labs[k], b = out.labs[k];
      if (!b) { out.labs[k] = a; return; }
      const ga = a.goals || [], gb = b.goals || [], g = [];
      for (let i = 0; i < Math.max(ga.length, gb.length); i++) g.push(!!(ga[i] || gb[i]));
      out.labs[k] = { goals: g, done: !!(a.done || b.done) };
    });
    out.activity = Object.assign({}, R.activity || {});
    Object.keys(L.activity || {}).forEach((k) => { out.activity[k] = Math.max(L.activity[k] || 0, out.activity[k] || 0); });
    const seen = new Set();
    out.quizLog = (R.quizLog || []).concat(L.quizLog || []).filter((x) => { const id = x.k + '|' + x.d + '|' + x.p + '|' + x.n; if (seen.has(id)) return false; seen.add(id); return true; })
      .sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0)).slice(-300);
    out.plansDel = Object.assign({}, R.plansDel || {}, L.plansDel || {});
    const plans = {};
    (R.plans || []).concat(L.plans || []).forEach((p) => { const c = plans[p.id]; plans[p.id] = c ? Object.assign({}, p, { done: Object.assign({}, c.done || {}, p.done || {}) }) : p; });
    out.plans = Object.values(plans).filter((p) => !out.plansDel[p.id]);
    const sa = L.streak || {}, sb = R.streak || {};
    out.streak = (sa.last || '') > (sb.last || '') ? sa : (sb.last || '') > (sa.last || '') ? sb : { last: sa.last || null, count: Math.max(sa.count || 0, sb.count || 0) };
    out.last = L.last || R.last || null;
    out.settings = L.settings;
    return out;
  }
  function mergeFiches(L, R, dl, dr) {
    const del = Object.assign({}, dr || {});
    Object.keys(dl || {}).forEach((k) => { del[k] = Math.max(del[k] || 0, dl[k]); });
    const by = {}, order = [];
    (L || []).concat(R || []).forEach((f) => {
      if (!f || typeof f.id !== 'string' || typeof f.src !== 'string') return;
      const c = by[f.id];
      if (!c) order.push(f.id);
      if (!c || (f.updated || 0) > (c.updated || 0)) by[f.id] = f;
    });
    return { list: order.map((id) => by[id]).filter((f) => !(del[f.id] && del[f.id] >= (f.updated || 0))), del };
  }
  const ATL_IDX = 'reviciel.atelier.index', ATL_P = 'reviciel.atelier.p.', ATL_DEL = 'reviciel.atelier.supprimes';
  function localAtelier() {
    let index = [], del = {};
    try { index = JSON.parse(ls.get(ATL_IDX) || '[]'); } catch (e) { index = []; }
    try { del = JSON.parse(ls.get(ATL_DEL) || '{}'); } catch (e) { del = {}; }
    const projets = {};
    (Array.isArray(index) ? index : []).forEach((p) => {
      try { const d = JSON.parse(ls.get(ATL_P + p.id) || 'null'); if (d) { (d.devices || []).forEach((x) => { delete x.screen; delete x.history; }); projets[p.id] = d; } } catch (e) { /* projet illisible */ }
    });
    return { index: Array.isArray(index) ? index : [], projets, del };
  }
  function mergeAtelier(L, R) {
    const del = Object.assign({}, R.del || {});
    Object.keys(L.del || {}).forEach((k) => { del[k] = Math.max(del[k] || 0, L.del[k]); });
    const by = {};
    [['R', R], ['L', L]].forEach(([from, src]) => (src.index || []).forEach((p) => {
      const c = by[p.id];
      if ((src.projets || {})[p.id] && (!c || (p.updated || 0) > (c.p.updated || 0))) by[p.id] = { p, data: src.projets[p.id], from };
    }));
    const keep = Object.values(by).filter((x) => !(del[x.p.id] && del[x.p.id] >= (x.p.updated || 0))).sort((a, b) => (b.p.updated || 0) - (a.p.updated || 0));
    return { keep, out: { index: keep.map((x) => x.p), projets: Object.fromEntries(keep.map((x) => [x.p.id, x.data])), del } };
  }
  function applyAtelier(m) {
    const ids = new Set(m.keep.map((x) => x.p.id));
    let idx = [];
    try { idx = JSON.parse(ls.get(ATL_IDX) || '[]'); } catch (e) { idx = []; }
    (Array.isArray(idx) ? idx : []).forEach((p) => { if (!ids.has(p.id)) ls.del(ATL_P + p.id); });
    m.keep.forEach((x) => { if (x.from === 'R') ls.set(ATL_P + x.p.id, JSON.stringify(x.data)); });
    ls.set(ATL_IDX, JSON.stringify(m.out.index));
    ls.set(ATL_DEL, JSON.stringify(m.out.del));
  }

  /* ---------- Synchronisation : on récupère, on fusionne, on renvoie ---------- */
  async function sync() {
    if (!fb || !user) return;
    if (syncing) { again = true; return; }
    syncing = true; status = 'sync'; emit();
    try {
      const F = fb.F, ref = (n) => F.doc(fb.db, 'users', user.uid, 'donnees', n);
      const snaps = await Promise.all(['progression', 'fiches', 'atelier'].map((n) => F.getDoc(ref(n))));
      const remote = snaps.map((s) => { if (!s.exists()) return null; try { return JSON.parse(s.data().json || 'null'); } catch (e) { return null; } });
      const raw = snaps.map((s) => (s.exists() ? s.data().json : null));
      const before = JSON.stringify([Store.state, Store.userFiches]);
      const mP = mergeProgress(Store.state, remote[0]);
      const mF = mergeFiches(Store.userFiches, remote[1] && remote[1].list, Store.deletedFiches, remote[1] && remote[1].del);
      const mA = mergeAtelier(localAtelier(), remote[2] || {});
      Store.setAll(mP, mF.list, mF.del);
      applyAtelier(mA);
      const changedHere = before !== JSON.stringify([Store.state, Store.userFiches]);
      const out = { progression: JSON.stringify(Store.state), fiches: JSON.stringify({ list: mF.list, del: mF.del }), atelier: JSON.stringify(mA.out) };
      atelierTooBig = out.atelier.length > 900000;
      if (out.fiches.length > 900000) throw new Error('Tes fiches perso sont trop volumineuses pour être synchronisées (plus de 900 Ko).');
      await Promise.all(['progression', 'fiches', 'atelier'].map((n, k) => {
        if (n === 'atelier' && atelierTooBig) return null;
        if (raw[k] === out[n] || lastPushed[n] === out[n]) { lastPushed[n] = out[n]; return null; }
        return F.setDoc(ref(n), { json: out[n], maj: F.serverTimestamp() }).then(() => { lastPushed[n] = out[n]; });
      }));
      lastSync = new Date(); status = 'ok'; lastError = '';
      if (changedHere) {
        RC.load(); App.renderNav();
        const path = (location.hash.slice(1) || '/').split('?')[0];
        if (/^\/($|progression|mes-fiches|compte|planning|matiere\/|favoris|labo$)/.test(path)) App.navigate();
      }
    } catch (e) {
      status = 'err'; lastError = msg(e); console.warn(e);
    }
    syncing = false; emit();
    if (again) { again = false; schedule(1000); }
  }
  function schedule(ms) {
    if (!user) return;
    clearTimeout(pushT);
    pushT = setTimeout(sync, ms == null ? 5000 : ms);
  }
  Store.subscribe(() => schedule());
  window.addEventListener('reviciel-change', () => schedule());
  document.addEventListener('visibilitychange', () => { if (user) { if (document.hidden) { if (pushT) { clearTimeout(pushT); sync(); } } else schedule(800); } });
  window.addEventListener('online', () => { if (!fb && ls.get(FLAG)) load().catch(() => { /* toujours hors ligne */ }); else schedule(500); });

  /* ---------- Actions du compte ---------- */
  const PSEUDO_RE = /^[\p{L}\p{N} ._-]{2,24}$/u;
  async function signUp(pseudo, email, pass) {
    pseudo = pseudo.trim();
    if (!PSEUDO_RE.test(pseudo)) throw new Error('Pseudo : 2 à 24 lettres, chiffres, espaces, points ou tirets.');
    const f = await load();
    const cred = await f.A.createUserWithEmailAndPassword(f.auth, email.trim(), pass);
    await f.A.updateProfile(cred.user, { displayName: pseudo });
    user = f.auth.currentUser;
    emit();
  }
  async function signIn(email, pass) { const f = await load(); await f.A.signInWithEmailAndPassword(f.auth, email.trim(), pass); }
  async function resetPassword(email) { const f = await load(); await f.A.sendPasswordResetEmail(f.auth, email.trim()); }
  async function signOut(wipe) {
    const f = await load();
    clearTimeout(pushT);
    if (user) { try { await sync(); } catch (e) { /* on se déconnecte quand même */ } }
    await f.A.signOut(f.auth);
    if (wipe) {
      Store.resetProgress();
      Store.setAll(null, [], {});
      let idx = [];
      try { idx = JSON.parse(ls.get(ATL_IDX) || '[]'); } catch (e) { idx = []; }
      (Array.isArray(idx) ? idx : []).forEach((p) => ls.del(ATL_P + p.id));
      [ATL_IDX, ATL_DEL, 'reviciel.atelier.courant'].forEach(ls.del);
      RC.load(); App.renderNav();
    }
  }
  async function setPseudo(p) {
    p = p.trim();
    if (!PSEUDO_RE.test(p)) throw new Error('Pseudo : 2 à 24 lettres, chiffres, espaces, points ou tirets.');
    await fb.A.updateProfile(fb.auth.currentUser, { displayName: p });
    user = fb.auth.currentUser; emit();
  }
  async function deleteAccount(pass) {
    const f = await load(), A = f.A, F = f.F, u = f.auth.currentUser;
    await A.reauthenticateWithCredential(u, A.EmailAuthProvider.credential(u.email, pass));
    const mine = await F.getDocs(F.query(F.collection(f.db, 'partages'), F.where('uid', '==', u.uid)));
    await Promise.all(mine.docs.map((d) => F.deleteDoc(d.ref)));
    await Promise.all(['progression', 'fiches', 'atelier'].map((n) => F.deleteDoc(F.doc(f.db, 'users', u.uid, 'donnees', n))));
    await A.deleteUser(u);
  }

  /* ---------- Bouton du compte dans la barre du haut ---------- */
  function badge() {
    const b = document.getElementById('account-btn');
    if (!b) return;
    b.classList.toggle('signed', !!user);
    b.setAttribute('aria-label', user ? 'Mon compte : ' + (user.displayName || 'connecté') : 'Se connecter');
    b.title = user ? 'Connecté : ' + (user.displayName || '') : 'Se connecter';
  }

  /* ---------- Page « Mon compte » ---------- */
  const ago = (d) => { if (!d) return 'jamais'; const s = Math.round((Date.now() - d) / 1000); return s < 60 ? 'à l\'instant' : s < 3600 ? 'il y a ' + Math.round(s / 60) + ' min' : 'à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); };
  App.route(/^\/compte$/, (v, _, params) => {
    App.setTitle('Mon compte');
    const back = params.get('retour');
    let mode = 'login', busy = false;
    function render() {
      if (!ready) {
        v.innerHTML = '<div class="page-head"><h1>Mon compte</h1></div><div class="card empty"><p>Connexion au service de comptes…</p></div>';
        return;
      }
      if (!user) {
        v.innerHTML = '<div class="page-head"><h1>Mon compte</h1><p>Un compte gratuit te permet de retrouver ta progression, tes fiches perso et tes réseaux du labo sur <b>n\'importe quel PC, ton téléphone et le site web</b>, et de partager des fiches avec les autres élèves.</p></div>' +
          '<div class="card auth-card"><div class="seg" id="auth-mode"><button data-m="login" class="' + (mode === 'login' ? 'active' : '') + '">Se connecter</button><button data-m="signup" class="' + (mode === 'signup' ? 'active' : '') + '">Créer un compte</button></div>' +
          '<form id="auth-form" class="stack" novalidate>' +
          (mode === 'signup' ? '<label class="field"><span>Pseudo (visible si tu partages une fiche)</span><input class="input" name="pseudo" maxlength="24" autocomplete="nickname" placeholder="Ex. : Noah_CIEL" required></label>' : '') +
          '<label class="field"><span>Adresse e-mail</span><input class="input" name="email" type="email" autocomplete="email" inputmode="email" required></label>' +
          '<label class="field"><span>Mot de passe' + (mode === 'signup' ? ' (6 caractères minimum)' : '') + '</span><input class="input" name="pass" type="password" autocomplete="' + (mode === 'signup' ? 'new-password' : 'current-password') + '" required minlength="6"></label>' +
          (mode === 'signup' ? '<label class="field"><span>Confirme le mot de passe</span><input class="input" name="pass2" type="password" autocomplete="new-password" required></label>' : '') +
          '<div class="row"><button class="btn lg" type="submit">' + icon('user') + ' ' + (mode === 'signup' ? 'Créer mon compte' : 'Me connecter') + '</button>' +
          (mode === 'login' ? '<button class="btn ghost sm" type="button" id="forgot">Mot de passe oublié ?</button>' : '') + '</div><p class="small" id="auth-msg" role="alert"></p></form>' +
          '<p class="small muted">Ton adresse e-mail n\'est jamais montrée aux autres élèves. Choisis un pseudo, pas ton nom complet. Tes données servent uniquement à faire marcher RéviCIEL.</p></div>';
        const form = $('#auth-form', v), say = (t, ok) => { const m = $('#auth-msg', v); m.textContent = t; m.className = 'small ' + (ok ? 'status-ok' : 'status-warn'); };
        $('#auth-mode', v).onclick = (e) => { const b = e.target.closest('[data-m]'); if (b) { mode = b.dataset.m; render(); } };
        const fg = $('#forgot', v);
        if (fg) fg.onclick = async () => {
          const email = form.email.value.trim();
          if (!email) { say('Saisis d\'abord ton adresse e-mail, puis clique à nouveau.'); return; }
          try { await resetPassword(email); say('Un e-mail pour choisir un nouveau mot de passe vient d\'être envoyé (regarde aussi dans les spams).', true); } catch (err) { say(msg(err)); }
        };
        form.onsubmit = async (e) => {
          e.preventDefault();
          if (busy) return;
          const email = form.email.value, pass = form.pass.value;
          if (mode === 'signup' && pass !== form.pass2.value) { say('Les deux mots de passe ne sont pas identiques.'); return; }
          busy = true; say('Un instant…', true);
          try {
            if (mode === 'signup') await signUp(form.pseudo.value, email, pass); else await signIn(email, pass);
            App.toast(mode === 'signup' ? 'Compte créé ! Ta progression est maintenant sauvegardée en ligne.' : 'Connecté ! Synchronisation de tes données…');
            if (back) { location.hash = '#/' + back; return; }
          } catch (err) { say(msg(err)); }
          busy = false;
          render();
        };
        return;
      }
      const nf = Store.userFiches.length;
      let nr = 0;
      try { nr = JSON.parse(ls.get(ATL_IDX) || '[]').length; } catch (e) { nr = 0; }
      const st = status === 'sync' ? '<span class="status-ok">Synchronisation…</span>' : status === 'err' ? '<span class="status-warn">Problème : ' + E(lastError) + '</span>' : '<span class="status-ok">✓ Synchronisé ' + ago(lastSync) + '</span>';
      v.innerHTML = '<div class="page-head"><h1>Mon compte</h1></div>' +
        '<div class="card account-card"><span class="avatar">' + E((user.displayName || '?').charAt(0).toUpperCase()) + '</span><div style="flex:1;min-width:0"><b>' + E(user.displayName || 'Sans pseudo') + '</b>' + (admin ? ' <span class="badge violet">Administrateur</span>' : '') +
        '<div class="small muted">' + E(user.email || '') + '</div><div class="small">' + st + '</div></div></div>' +
        '<div class="card section"><h2>Ce qui est synchronisé</h2><ul class="list-plain">' +
        '<li class="row between"><span>' + icon('chart') + ' Progression (cartes, quiz, contrôles, labs, planning)</span><span class="badge ok">' + icon('check') + '</span></li>' +
        '<li class="row between"><span>' + icon('pen') + ' Mes fiches perso</span><span class="badge ok">' + nf + '</span></li>' +
        '<li class="row between"><span>' + icon('network') + ' Réseaux du mode libre</span><span class="badge ' + (atelierTooBig ? 'warn">trop gros' : 'ok">' + nr) + '</span></li></ul>' +
        '<p class="small muted">La synchronisation est automatique quelques secondes après chaque changement, et à chaque ouverture de l\'appli. Hors connexion, tout reste enregistré sur l\'appareil et part au retour d\'Internet.</p>' +
        '<div class="row"><button class="btn" data-a="sync">' + icon('refresh') + ' Synchroniser maintenant</button><a class="btn secondary" href="#/partage">' + icon('share') + ' Fiches partagées</a></div></div>' +
        '<div class="card section"><h2>Mon pseudo</h2><div class="row"><input class="input" id="pseudo" maxlength="24" value="' + E(user.displayName || '') + '" style="flex:1;min-width:160px"><button class="btn secondary" data-a="pseudo">Enregistrer</button></div></div>' +
        '<div class="card section"><h2>Se déconnecter</h2><p class="small muted">Sur un ordinateur du lycée, coche la case pour effacer tes données de cet appareil (elles restent dans ton compte).</p>' +
        '<label class="check"><input type="checkbox" id="wipe"> Effacer aussi mes données de cet appareil</label><div class="row" style="margin-top:10px"><button class="btn secondary" data-a="logout">Se déconnecter</button></div></div>' +
        '<div class="card section"><h2>Supprimer mon compte</h2><p class="small muted">Efface ton compte, tes données en ligne et les fiches que tu as partagées. Ce qui est sur cet appareil reste.</p><button class="btn danger" data-a="delete">' + icon('trash') + ' Supprimer mon compte</button></div>';
    }
    v.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b || busy) return;
      const a = b.dataset.a;
      try {
        if (a === 'sync') { await sync(); App.toast(status === 'err' ? lastError : 'Synchronisé !'); }
        else if (a === 'pseudo') { await setPseudo($('#pseudo', v).value); App.toast('Pseudo enregistré.'); }
        else if (a === 'logout') { busy = true; await signOut($('#wipe', v).checked); busy = false; App.toast('Déconnecté.'); }
        else if (a === 'delete') {
          const pass = prompt('Pour supprimer ton compte, retape ton mot de passe :');
          if (!pass) return;
          if (!confirm('Supprimer définitivement ton compte et tes données en ligne ? Impossible de revenir en arrière.')) return;
          busy = true; await deleteAccount(pass); busy = false; App.toast('Compte supprimé.');
        }
      } catch (err) { busy = false; App.toast(msg(err), { duration: 6000 }); }
      render();
    });
    subs.add(render);
    render();
    load().then(render).catch((err) => { v.innerHTML = '<div class="page-head"><h1>Mon compte</h1></div><div class="card empty">' + icon('cloud') + '<p>' + E(err.message) + '</p><button class="btn" onclick="location.reload()">Réessayer</button></div>'; });
    return () => subs.delete(render);
  });

  /* ---------- Démarrage : reprise de la session et synchronisation ---------- */
  window.Cloud = {
    load, sync, msg, _test: { mergeProgress, mergeFiches, mergeAtelier },
    get user() { return user; }, get admin() { return admin; }, get ready() { return ready; }, get db() { return fb && fb.db; }, get F() { return fb && fb.F; },
    onChange: (fn) => { subs.add(fn); return () => subs.delete(fn); }
  };
  badge();
  if (ls.get(FLAG) && location.protocol !== 'file:') setTimeout(() => { load().catch(() => { /* hors connexion : on réessaiera */ }); }, 1200);
})();
