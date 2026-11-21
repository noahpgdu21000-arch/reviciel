/* RéviCIEL — onglet Partage : les élèves connectés publient leurs fiches perso et récupèrent celles des autres. */
(function () {
  'use strict';
  const { E, icon, $, $$, plural } = App;
  const MAX = 60000;
  const dateFr = (ts) => (ts && ts.toDate ? ts.toDate().toLocaleDateString('fr-FR') : '');
  const C = () => window.Cloud;

  function parse(src) { try { return RCMD.parseFiche(src); } catch (e) { return null; } }
  function addToMine(d) {
    const id = 'perso-' + Date.now().toString(36);
    const src = String(d.src).replace(/\r\n?/g, '\n').replace(/^---\n([\s\S]*?)\n---/, (m, head) => '---\n' + head.split('\n').filter((l) => !/^\s*id\s*:/i.test(l)).concat(['id: ' + id]).join('\n') + '\n---');
    Store.upsertUserFiche(id, src);
    RC.load(); App.renderNav();
    const F = C().F;
    F.updateDoc(F.doc(C().db, 'partages', d.id), { imports: F.increment(1) }).catch(() => { /* compteur facultatif */ });
    return id;
  }
  function needAccount(v, title) {
    v.innerHTML = '<div class="page-head"><h1>' + E(title) + '</h1><p>Les élèves partagent ici leurs fiches perso : tu peux les lire et les ajouter à tes fiches en un clic.</p></div>' +
      '<div class="card empty">' + icon('share') + '<h2>Connecte-toi pour voir les fiches partagées</h2><p>Le partage est réservé aux élèves qui ont un compte RéviCIEL (gratuit).</p><a class="btn" href="#/compte?retour=partage">' + icon('user') + ' Se connecter ou créer un compte</a></div>';
  }
  function loadingView(v, title) { v.innerHTML = '<div class="page-head"><h1>' + E(title) + '</h1></div><div class="card empty"><p>Chargement…</p></div>'; }
  function errorView(v, title, err) { v.innerHTML = '<div class="page-head"><h1>' + E(title) + '</h1></div><div class="card empty">' + icon('cloud') + '<p>' + E(C().msg(err)) + '</p><button class="btn" onclick="location.reload()">Réessayer</button></div>'; }

  /* ---------- Liste des fiches partagées ---------- */
  App.route(/^\/partage$/, (v) => {
    App.setTitle('Fiches partagées');
    let items = [], mineShared = {}, reports = [], sid = '', q = '', alive = true;
    loadingView(v, 'Fiches partagées');
    async function fetchAll() {
      const F = C().F, db = C().db, me = C().user.uid;
      const snap = await F.getDocs(F.query(F.collection(db, 'partages'), F.orderBy('cree', 'desc'), F.limit(200)));
      items = snap.docs.map((d) => Object.assign({ id: d.id }, d.data()));
      mineShared = {};
      items.filter((x) => x.uid === me && x.fiche).forEach((x) => { mineShared[x.fiche] = x; });
      reports = [];
      if (C().admin) {
        const r = await F.getDocs(F.collection(db, 'signalements'));
        reports = r.docs.map((d) => Object.assign({ id: d.id }, d.data()));
      }
    }
    function card(x) {
      const s = RC.SUBJ[x.matiere] || RC.SUBJ.perso, mine = x.uid === C().user.uid;
      return '<div class="share-card" style="--c:' + s.color + '"><div class="small" style="color:' + s.color + ';font-weight:700">' + E(s.name) + '</div><h3><a href="#/partage/' + x.id + '">' + E(x.titre) + '</a></h3>' +
        (x.resume ? '<p class="small">' + E(x.resume) + '</p>' : '') +
        '<div class="small muted">par <b>' + E(x.pseudo || '?') + '</b>' + (mine ? ' (toi)' : '') + ' · ' + dateFr(x.maj || x.cree) + ' · ' + plural(x.imports || 0, 'ajout') + '</div>' +
        '<div class="row" style="margin-top:8px"><a class="btn sm secondary" href="#/partage/' + x.id + '">Lire</a><button class="btn sm" data-add="' + x.id + '">' + icon('plus') + ' Ajouter à mes fiches</button>' +
        (mine || C().admin ? '<button class="btn sm ghost" data-del="' + x.id + '">' + icon('trash') + ' Retirer</button>' : '<button class="btn sm ghost" data-report="' + x.id + '">' + icon('flag') + ' Signaler</button>') + '</div></div>';
    }
    function render() {
      if (!alive) return;
      const n = RC.norm(q);
      const list = items.filter((x) => (!sid || x.matiere === sid) && (!n || RC.norm(x.titre + ' ' + x.resume + ' ' + x.pseudo).indexOf(n) !== -1));
      const subs = RC.SUBJECTS.filter((s) => items.some((x) => x.matiere === s.id));
      const mine = Store.userFiches.map((u) => ({ u, f: parse(u.src) })).filter((x) => x.f);
      v.innerHTML = '<div class="page-head"><h1>Fiches partagées</h1><p>Les fiches des élèves de RéviCIEL. Ajoute celles qui t\'aident à tes fiches perso (tu peux ensuite les modifier), et partage les tiennes.</p></div>' +
        '<div class="callout attention"><div class="callout-title">' + icon('info') + ' Fiches écrites par des élèves</div><p>Vérifie toujours avec ton cours. Si une fiche contient une erreur grave, des propos blessants ou des infos personnelles, signale-la.</p></div>' +
        (reports.length ? '<div class="card section"><h2>' + icon('flag') + ' Signalements (' + reports.length + ')</h2><ul class="list-plain">' + reports.map((r) => { const it = items.find((x) => x.id === r.partage); return '<li class="row between"><span>' + (it ? '<a href="#/partage/' + it.id + '">' + E(it.titre) + '</a> par ' + E(it.pseudo) : '<span class="muted">fiche déjà retirée</span>') + '<br><span class="small muted">' + E(r.motif || '') + '</span></span><span class="row">' + (it ? '<button class="btn sm danger" data-del="' + it.id + '">Retirer la fiche</button>' : '') + '<button class="btn sm ghost" data-close="' + r.id + '">Classer</button></span></li>'; }).join('') + '</ul></div>' : '') +
        '<details class="card section"' + (mine.length && !Object.keys(mineShared).length ? ' open' : '') + '><summary><b>' + icon('share') + ' Partager une de mes fiches</b></summary>' +
        (mine.length ? '<ul class="list-plain" style="margin-top:10px">' + mine.map(({ u, f }) => '<li class="row between"><span>' + E(f.title) + (mineShared[u.id] ? ' <span class="badge ok">partagée</span>' : '') + '</span><button class="btn sm' + (mineShared[u.id] ? ' secondary' : '') + '" data-share="' + E(u.id) + '">' + (mineShared[u.id] ? 'Mettre à jour' : 'Partager') + '</button></li>').join('') + '</ul>' :
          '<p class="small muted" style="margin-top:10px">Tu n\'as pas encore de fiche perso. <a href="#/editeur">Crée une fiche</a> (ou copie une fiche officielle pour la modifier), puis reviens ici.</p>') + '</details>' +
        '<div class="card section share-filters"><input class="input" type="search" id="sh-q" placeholder="Rechercher une fiche, un élève…" value="' + E(q) + '"><select class="input" id="sh-sid"><option value="">Toutes les matières</option>' + subs.map((s) => '<option value="' + s.id + '"' + (s.id === sid ? ' selected' : '') + '>' + E(s.name) + '</option>').join('') + '</select></div>' +
        (list.length ? '<div class="share-grid section">' + list.map(card).join('') + '</div>' : '<div class="card empty section">' + icon('share') + '<p>' + (items.length ? 'Aucune fiche ne correspond.' : 'Personne n\'a encore partagé de fiche. Sois le premier !') + '</p></div>');
      const qi = $('#sh-q', v);
      qi.oninput = () => { q = qi.value; const pos = qi.selectionStart; render(); const n2 = $('#sh-q', v); n2.focus(); n2.setSelectionRange(pos, pos); };
      $('#sh-sid', v).onchange = (e) => { sid = e.target.value; render(); };
    }
    async function share(localId) {
      const u = Store.userFiches.find((x) => x.id === localId), f = u && parse(u.src);
      if (!f) return;
      if (u.src.length > MAX) { App.toast('Fiche trop longue pour être partagée (60 000 caractères maximum).'); return; }
      const F = C().F, db = C().db, me = C().user;
      const data = { titre: f.title.slice(0, 120) || 'Sans titre', matiere: RC.SUBJ[f.subject] ? f.subject : 'perso', resume: String(f.summary || '').slice(0, 300), src: u.src, pseudo: me.displayName || 'Élève', fiche: localId, maj: F.serverTimestamp() };
      const ex = mineShared[localId];
      if (ex) await F.updateDoc(F.doc(db, 'partages', ex.id), data);
      else {
        if (!confirm('Partager « ' + data.titre + ' » ? Elle sera visible par tous les élèves connectés, avec ton pseudo « ' + data.pseudo + ' ».')) return;
        await F.addDoc(F.collection(db, 'partages'), Object.assign(data, { uid: me.uid, cree: F.serverTimestamp(), imports: 0 }));
      }
      App.toast(ex ? 'Fiche partagée mise à jour.' : 'Fiche partagée ! Merci pour les autres élèves.');
      await fetchAll(); render();
    }
    v.addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b || !C().user) return;
      const F = C().F, db = C().db;
      try {
        if (b.dataset.add) { const d = items.find((x) => x.id === b.dataset.add); const id = addToMine(d); d.imports = (d.imports || 0) + 1; App.toast('Ajoutée à « Mes fiches » !'); App.go('#/fiche/' + encodeURIComponent(id)); }
        else if (b.dataset.share) await share(b.dataset.share);
        else if (b.dataset.del) {
          if (!confirm('Retirer cette fiche du partage ?')) return;
          await F.deleteDoc(F.doc(db, 'partages', b.dataset.del));
          if (C().admin) await Promise.all(reports.filter((r) => r.partage === b.dataset.del).map((r) => F.deleteDoc(F.doc(db, 'signalements', r.id))));
          App.toast('Fiche retirée.'); await fetchAll(); render();
        } else if (b.dataset.report) {
          const motif = prompt('Pourquoi signales-tu cette fiche ? (erreur, propos blessants, infos personnelles…)');
          if (motif == null) return;
          await F.addDoc(F.collection(db, 'signalements'), { partage: b.dataset.report, motif: motif.slice(0, 300), uid: C().user.uid, cree: F.serverTimestamp() });
          App.toast('Merci, la fiche a été signalée.');
        } else if (b.dataset.close) { await F.deleteDoc(F.doc(db, 'signalements', b.dataset.close)); await fetchAll(); render(); }
      } catch (err) { App.toast(C().msg(err), { duration: 6000 }); }
    });
    const start = () => {
      if (!C().ready) return;
      if (!C().user) { needAccount(v, 'Fiches partagées'); return; }
      fetchAll().then(render).catch((err) => errorView(v, 'Fiches partagées', err));
    };
    const off = C().onChange(() => { if (!items.length) start(); });
    C().load().then(start).catch((err) => errorView(v, 'Fiches partagées', err));
    return () => { alive = false; off(); };
  });

  /* ---------- Lire une fiche partagée ---------- */
  App.route(/^\/partage\/([\w-]+)$/, (v, [id]) => {
    App.setTitle('Fiche partagée');
    let alive = true;
    loadingView(v, 'Fiche partagée');
    async function show() {
      if (!alive || !C().ready) return;
      if (!C().user) { needAccount(v, 'Fiche partagée'); return; }
      const F = C().F, snap = await F.getDoc(F.doc(C().db, 'partages', id));
      if (!snap.exists()) { App.notFound(v, 'Cette fiche n\'est plus partagée'); return; }
      const d = Object.assign({ id }, snap.data()), f = parse(d.src);
      const s = RC.SUBJ[d.matiere] || RC.SUBJ.perso;
      App.setTitle(d.titre);
      v.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/partage">Partage</a><span>›</span><span>' + E(d.titre) + '</span></div>' +
        '<div class="page-head"><div class="small" style="color:' + s.color + ';font-weight:700">' + E(s.name) + '</div><h1>' + E(d.titre) + '</h1><p>Partagée par <b>' + E(d.pseudo || '?') + '</b> · ' + dateFr(d.maj || d.cree) + ' · ' + plural(d.imports || 0, 'ajout') + '</p></div>' +
        '<div class="row section"><button class="btn" data-add>' + icon('plus') + ' Ajouter à mes fiches</button><a class="btn ghost" href="#/partage">← Toutes les fiches partagées</a></div>' +
        '<div class="callout attention"><div class="callout-title">' + icon('info') + ' Fiche écrite par un élève</div><p>Vérifie avec ton cours avant de l\'apprendre par cœur.</p></div>' +
        '<article class="card md fiche-body">' + (f ? RCMD.render(f.body).html : '<p>Fiche illisible.</p>') + '</article>' +
        (f && (f.cards.length || f.quiz.length) ? '<p class="small muted section">Cette fiche contient ' + plural(f.cards.length, 'carte') + ' et ' + plural(f.quiz.length, 'question') + ' de quiz : ajoute-la à tes fiches pour t\'entraîner.</p>' : '');
      $('[data-add]', v).onclick = () => { const nid = addToMine(d); App.toast('Ajoutée à « Mes fiches » !'); App.go('#/fiche/' + encodeURIComponent(nid)); };
    }
    C().load().then(() => show().catch((err) => errorView(v, 'Fiche partagée', err))).catch((err) => errorView(v, 'Fiche partagée', err));
    return () => { alive = false; };
  });
})();
