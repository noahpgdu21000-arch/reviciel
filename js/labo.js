/* RéviCIEL — Labo réseau : liste des labs, page d'un lab (espace de travail + objectifs) et mode libre. */
(function () {
  'use strict';
  const { E, icon, $, $$, bar } = App;
  const NS = window.NetSim, CLI = window.NetCLI, A = window.Atelier;
  const KEY = (id) => 'reviciel.labo.' + id;
  const helpers = (sim) => window.labHelpers(sim);
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: (k) => { try { localStorage.removeItem(k); } catch (e) { /* rien */ } }
  };

  function createSim(lab, fresh) {
    const sim = new NS.Sim(lab);
    Object.keys(lab.setup || {}).forEach((id) => CLI.runSetup(sim, id, lab.setup[id]));
    if (!fresh) { const j = store.get(KEY(lab.id)); if (j) sim.restore(j); }
    return sim;
  }
  const labState = (id) => Store.state.labs[id] || { goals: [], done: false };
  const levelOf = (n) => window.LAB_LEVELS.find((x) => x.n === n);

  /* ---------- Liste des labs ---------- */
  function labRow(l) {
    const st = labState(l.id), L = levelOf(l.level);
    const nd = (st.goals || []).filter(Boolean).length;
    const badge = st.done ? '<span class="badge ok">' + icon('check') + ' Réussi</span>' : nd ? '<span class="badge warn">' + Math.round((nd / l.goals.length) * 100) + ' %</span>' : '<span class="badge">Nouveau</span>';
    return '<a class="fiche-row" style="--c:' + L.color + '" href="#/labo/' + l.id + '"><span class="num' + (st.done ? ' done' : '') + '">' + (st.done ? icon('check') : icon('network')) + '</span>' +
      '<div class="body"><h3>' + E(l.title) + '</h3><p>' + E(l.desc) + '</p><div class="badges">' + badge + '<span class="badge">' + icon('clock') + ' ' + l.time + '</span>' + (l.cabling ? '<span class="badge violet">Câblage</span>' : '') + '</div></div>' + icon('right', 'chev') + '</a>';
  }
  App.route(/^\/labo$/, (v) => {
    App.setTitle('Labo réseau');
    const total = window.LABS.length, done = window.LABS.filter((l) => labState(l.id).done).length;
    let html = '<div class="page-head"><h1>Labo réseau</h1><p>Un simulateur qui fonctionne comme Packet Tracer : pose des routeurs, des switchs et des PC, câble-les, configure-les en ligne de commande Cisco IOS, envoie des messages et regarde les paquets voyager en mode Simulation. Il marche aussi sans connexion.</p></div>' +
      '<a class="card tool-card lab-promo" style="--c:#7c3aed" href="#/labo/libre"><span class="s-icon">' + icon('pen') + '</span><div style="flex:1"><h3>Mode libre : construis ton réseau</h3><p>Espace de travail vide : équipements, câbles droits/croisés/console, serveur web, DNS et DHCP, mode Simulation. Tes réseaux sont enregistrés et exportables.</p></div>' + icon('right', 'chev') + '</a>' +
      '<div class="card section">' + bar(done / total, '#0284c7') + '<div class="row between small" style="margin-top:8px"><span>' + done + ' / ' + total + ' labs réussis</span><a href="#/labo/' + (window.LABS.find((l) => !labState(l.id).done) || window.LABS[0]).id + '">Continuer →</a></div></div>';
    window.LAB_LEVELS.forEach((L) => {
      const labs = window.LABS.filter((l) => l.level === L.n);
      const n = labs.filter((l) => labState(l.id).done).length;
      html += '<section class="section"><div class="section-head"><h2><span class="lvl" style="--c:' + L.color + '">' + L.name + '</span></h2><span class="small muted">' + n + '/' + labs.length + ' réussis</span></div><p class="muted small" style="margin-top:-6px">' + E(L.desc) + '</p><div class="fiche-list">' + labs.map(labRow).join('') + '</div></section>';
    });
    html += '<p class="small muted section">Ce simulateur reprend le fonctionnement de Cisco Packet Tracer avec ses propres dessins ; il ne lit pas les fichiers .pkt. Pour les réseaux de tes profs en .pkt, utilise Packet Tracer.</p>';
    v.innerHTML = html;
  });

  /* ---------- Page d'un lab ---------- */
  App.route(/^\/labo\/(?!libre)([\w-]+)$/, (v, [labId], params) => {
    const lab = window.LABS.find((l) => l.id === labId);
    if (!lab) return App.notFound(v, 'Lab introuvable');
    const L = levelOf(lab.level);
    let sim = createSim(lab);
    let st = JSON.parse(JSON.stringify(labState(lab.id)));
    if (!Array.isArray(st.goals)) st.goals = [];
    let tab = st.goals.some(Boolean) || params.get('pratique') ? 'pratique' : 'cours';
    const next = window.LABS[window.LABS.indexOf(lab) + 1];
    App.setTitle(lab.title);

    v.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/labo">Labo réseau</a><span>›</span><span>' + L.name + '</span></div>' +
      '<div class="lab-head"><span class="lvl" style="--c:' + L.color + '">' + L.name + ' · ' + lab.time + '</span><h1>' + E(lab.title) + '</h1><p class="muted">' + E(lab.desc) + '</p></div>' +
      '<div class="row lab-tabs-row"><div class="seg lab-tabs" id="lab-tabs"><button data-tab="cours">' + icon('book') + ' Cours</button><button data-tab="pratique">' + icon('network') + ' Pratique</button></div><span class="badge" id="lab-pct"></span></div>' +
      '<div id="pane-cours" class="card"><div class="md">' + RCMD.render(lab.cours).html + '</div><div class="row" style="margin-top:16px"><button class="btn lg" data-tab="pratique">Passer à la pratique ' + icon('right') + '</button></div></div>' +
      '<div id="pane-pratique" class="lab-grid"><div class="lab-main"><div id="ws"></div></div>' +
      '<aside class="lab-side"><div class="card" id="goals-card"></div>' +
      '<div class="card"><div class="row"><button class="btn secondary sm" id="show-sol">' + icon('info') + ' Voir la solution</button><button class="btn ghost sm" id="reset">' + icon('refresh') + ' Recommencer</button></div><div id="solution"></div></div></aside></div>';

    const setTab = (t) => {
      tab = t;
      $('#pane-cours', v).hidden = t !== 'cours';
      $('#pane-pratique', v).hidden = t !== 'pratique';
      $$('#lab-tabs button', v).forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
    };
    let saveT = null;
    const persist = () => { clearTimeout(saveT); saveT = setTimeout(() => store.set(KEY(lab.id), sim.dump()), 300); };

    function renderGoals() {
      const n = lab.goals.filter((g, k) => st.goals[k]).length, all = n === lab.goals.length, pct = Math.round((n / lab.goals.length) * 100);
      $('#lab-pct', v).textContent = 'Progression : ' + pct + ' %';
      $('#lab-pct', v).className = 'badge ' + (all ? 'ok' : pct ? 'warn' : '');
      $('#goals-card', v).innerHTML = (all ? '<div class="callout exemple" style="margin-bottom:14px"><div class="callout-title">' + icon('check') + ' Lab réussi, bravo !</div><p>' + (next ? 'Prêt pour la suite ? <a href="#/labo/' + next.id + '">' + E(next.title) + ' →</a>' : 'Tu as terminé tous les labs. Essaie le <a href="#/labo/libre">mode libre</a> !') + '</p></div>' : '') +
        '<div class="row between" style="margin-bottom:8px"><h3 style="margin:0">Consignes</h3><span class="badge ' + (all ? 'ok' : '') + '">' + n + ' / ' + lab.goals.length + '</span></div>' + bar(n / lab.goals.length, L.color) +
        '<ol class="goals">' + lab.goals.map((g, k) => '<li class="' + (st.goals[k] ? 'done' : '') + '"><span class="gk">' + (st.goals[k] ? icon('check') : k + 1) + '</span><div><div>' + E(g.t) + '</div>' +
          (st.goals[k] ? '' : '<button class="hint-btn" data-hint="' + k + '">Indice</button><div class="hint" id="hint-' + k + '" hidden>' + E(g.hint) + '</div>') + '</div></li>').join('') + '</ol>';
    }
    function checkGoals() {
      const h = helpers(sim);
      let newly = false;
      lab.goals.forEach((g, k) => {
        if (st.goals[k]) return;
        let ok = false;
        try { ok = !!g.c(h); } catch (e) { ok = false; }
        if (ok) { st.goals[k] = true; newly = true; }
      });
      if (newly) {
        const all = lab.goals.every((g, k) => st.goals[k]);
        if (all && !st.done) { st.done = true; App.toast('Lab réussi : « ' + lab.title + ' » !', { duration: 6000 }); }
        else App.toast('Consigne réussie ✓', { duration: 1800 });
        Store.setLab(lab.id, st);
      }
      renderGoals();
    }
    let ws = null;
    const mountWs = () => {
      if (ws) ws.destroy();
      ws = A.Workspace($('#ws', v), { sim: () => sim, world: { w: 640, h: 320 }, canPlace: false, canCable: !!lab.cabling, changed: () => { checkGoals(); persist(); } });
    };

    v.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tab]');
      if (t && t.closest('#lab-tabs, #pane-cours')) { setTab(t.dataset.tab); if (t.dataset.tab === 'pratique') window.scrollTo(0, 0); return; }
      const hb = e.target.closest('[data-hint]');
      if (hb) { const h = $('#hint-' + hb.dataset.hint, v); h.hidden = !h.hidden; }
    });
    $('#show-sol', v).addEventListener('click', () => {
      const box = $('#solution', v);
      if (box.innerHTML) { box.innerHTML = ''; return; }
      if (!confirm('Afficher la solution ? Essaie d\'abord avec les indices : c\'est comme ça qu\'on apprend !')) return;
      box.innerHTML = lab.solution.map(([id, steps]) => '<h4 style="margin:14px 0 6px">' + E(sim.devices[id] ? sim.devices[id].label : id) + '</h4><pre class="sol">' + E(steps.join('\n')) + '</pre>').join('');
    });
    $('#reset', v).addEventListener('click', () => {
      if (!confirm('Recommencer ce lab depuis le début ? Ta configuration actuelle sera effacée.')) return;
      store.del(KEY(lab.id));
      sim = createSim(lab, true);
      st = { goals: [], done: st.done };
      Store.setLab(lab.id, st);
      mountWs(); renderGoals();
      $('#solution', v).innerHTML = '';
    });

    mountWs();
    checkGoals();
    setTab(tab);
    return () => { clearTimeout(saveT); store.set(KEY(lab.id), sim.dump()); if (ws) ws.destroy(); };
  });

  /* ---------- Mode libre (bac à sable) ---------- */
  const IDX = 'reviciel.atelier.index', CUR = 'reviciel.atelier.courant', PK = (id) => 'reviciel.atelier.p.' + id;
  const loadIndex = () => { try { const x = JSON.parse(store.get(IDX) || '[]'); return Array.isArray(x) ? x : []; } catch (e) { return []; } };
  const saveIndex = (list) => store.set(IDX, JSON.stringify(list));
  function exampleSim() {
    const sim = new NS.Sim({ devices: [], links: [] });
    const r = sim.addDevice('router', 480, 90), s = sim.addDevice('switch', 480, 230);
    const p0 = sim.addDevice('pc', 300, 380), p1 = sim.addDevice('laptop', 480, 400), sv = sim.addDevice('server', 660, 380);
    sim.addLink(r, 'GigabitEthernet0/0', s, 'GigabitEthernet0/1', 'droit');
    sim.addLink(s, 'FastEthernet0/1', p0, 'FastEthernet0', 'droit');
    sim.addLink(s, 'FastEthernet0/2', p1, 'FastEthernet0', 'droit');
    sim.addLink(s, 'FastEthernet0/3', sv, 'FastEthernet0', 'droit');
    return sim;
  }
  App.route(/^\/labo\/libre$/, (v) => {
    App.setTitle('Mode libre — Labo réseau');
    let list = loadIndex();
    let cur = store.get(CUR);
    let sim = null, ws = null, saveT = null;
    const newProject = (name, s) => {
      const id = 'p' + Date.now().toString(36);
      list.unshift({ id, name, updated: Date.now() });
      saveIndex(list);
      store.set(PK(id), (s || new NS.Sim({ devices: [], links: [] })).dump({ name }));
      return id;
    };
    if (!list.length) cur = newProject('Mon premier réseau', exampleSim());
    if (!cur || !list.find((p) => p.id === cur)) cur = list[0].id;

    const defiDone = (d) => !!(Store.state.labs['defi:' + d.id] || {}).done;
    v.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/labo">Labo réseau</a><span>›</span><span>Mode libre</span></div>' +
      '<div class="page-head"><h1>Mode libre</h1><p>Construis ton réseau comme dans Packet Tracer. Tout est enregistré automatiquement sur cet appareil.</p></div>' +
      '<details class="card section defis"' + (window.DEFIS.every(defiDone) ? '' : ' open') + '><summary><b>' + icon('trophy') + ' Défis</b> <span class="small muted">' + window.DEFIS.filter(defiDone).length + ' / ' + window.DEFIS.length + ' réussis · pars d\'un espace vide, la vérification est automatique</span></summary>' +
      '<div class="defi-list">' + window.DEFIS.map((d) => { const L = levelOf(d.level); return '<div class="defi" style="--c:' + L.color + '"><span class="lvl" style="--c:' + L.color + '">' + L.name + '</span><h3>' + E(d.title) + '</h3><p class="small">' + E(d.desc) + '</p>' +
        '<div class="row between"><span class="badge' + (defiDone(d) ? ' ok">' + icon('check') + ' Réussi' : '">' + d.goals.length + ' étapes') + '</span><button class="btn sm" data-defi="' + d.id + '">Relever le défi</button></div></div>'; }).join('') + '</div></details>' +
      '<div id="defi-card" class="card section" hidden></div>' +
      '<div class="card proj-bar"><label class="field" style="flex:1;min-width:180px"><span>Projet</span><select class="input" id="proj"></select></label>' +
      '<div class="row"><button class="btn sm" data-p="new">' + icon('plus') + ' Nouveau</button><button class="btn secondary sm" data-p="rename">Renommer</button><button class="btn secondary sm" data-p="export">' + icon('download') + ' Exporter</button>' +
      '<button class="btn secondary sm" data-p="import">' + icon('upload') + ' Importer</button><button class="btn ghost sm" data-p="delete">' + icon('trash') + ' Supprimer</button></div></div>' +
      '<details class="card section astuces"><summary><b>Mode d\'emploi rapide</b></summary><ol class="small">' +
      '<li><b>Poser un équipement</b> : en bas, choisis Routeur, Switch, PC… puis touche l\'espace de travail.</li>' +
      '<li><b>Câbler</b> : choisis un câble (Auto, Droit, Croisé, Console), touche le 1er équipement, choisis le port, puis le 2e. Un voyant rouge = mauvais câble ou port éteint.</li>' +
      '<li><b>Configurer</b> : touche un équipement. Routeur et switch : onglets Config et CLI. PC : Bureau (Configuration IP, Invite de commandes, Navigateur web, Terminal). Serveur : Services (HTTP, DNS, DHCP).</li>' +
      '<li><b>Tester</b> : outil « Message simple » (l\'enveloppe) : touche la source puis la destination. Passe en mode <b>Simulation</b> pour voir le paquet voyager.</li></ol></details>' +
      '<div id="ws" class="section"></div>';
    const sel = $('#proj', v);
    const fillSel = () => { sel.innerHTML = list.map((p) => '<option value="' + p.id + '"' + (p.id === cur ? ' selected' : '') + '>' + E(p.name) + '</option>').join(''); };
    const flush = () => {
      clearTimeout(saveT);
      const p = list.find((x) => x.id === cur);
      if (!p || !sim) return;
      p.updated = Date.now();
      if (!store.set(PK(cur), sim.dump({ name: p.name }))) App.toast('Enregistrement impossible : stockage plein.');
      saveIndex(list);
      window.dispatchEvent(new Event('reviciel-change'));
    };
    const persist = () => { clearTimeout(saveT); saveT = setTimeout(flush, 400); };
    /* défi en cours : consignes vérifiées à chaque changement */
    let prevRes = null;
    function renderDefi() {
      const box = $('#defi-card', v), p = list.find((x) => x.id === cur);
      const d = p && p.defi && window.DEFIS.find((x) => x.id === p.defi);
      if (!d) { box.hidden = true; box.innerHTML = ''; prevRes = null; return; }
      const res = window.checkDefi(d, sim), n = res.filter(Boolean).length, all = n === res.length, L = levelOf(d.level);
      if (prevRes && res.some((ok, k) => ok && !prevRes[k])) {
        if (all) { App.toast('Défi réussi : « ' + d.title + ' » !', { duration: 6000 }); Store.setLab('defi:' + d.id, { goals: res, done: true }); }
        else App.toast('Étape réussie ✓', { duration: 1800 });
      }
      prevRes = res;
      box.hidden = false;
      box.innerHTML = '<div class="row between" style="margin-bottom:8px"><h3 style="margin:0">' + icon('trophy') + ' Défi : ' + E(d.title) + '</h3><span class="badge ' + (all ? 'ok' : '') + '">' + n + ' / ' + res.length + '</span></div>' + bar(n / res.length, L.color) +
        (all ? '<p class="status-ok" style="margin:10px 0 0">Bravo, défi réussi ! Essaie le suivant dans la liste des défis.</p>' : '') +
        '<ol class="goals">' + d.goals.map((g, k) => '<li class="' + (res[k] ? 'done' : '') + '"><span class="gk">' + (res[k] ? icon('check') : k + 1) + '</span><div><div>' + E(g.t) + '</div>' +
          (res[k] ? '' : '<button class="hint-btn" data-hint="' + k + '">Indice</button><div class="hint" id="dhint-' + k + '" hidden>' + E(g.hint) + '</div>') + '</div></li>').join('') + '</ol>';
    }
    function open(id) {
      if (ws) { ws.destroy(); ws = null; }
      cur = id;
      store.set(CUR, id);
      try { sim = NS.fromDump(store.get(PK(id)) || '{"devices":[],"links":[]}'); } catch (e) { sim = new NS.Sim({ devices: [], links: [] }); App.toast('Projet illisible : on repart d\'un espace vide.'); }
      fillSel();
      prevRes = null;
      ws = A.Workspace($('#ws', v), { sim: () => sim, world: { w: 960, h: 520 }, canPlace: true, canCable: true, changed: () => { persist(); renderDefi(); } });
      renderDefi();
    }
    sel.addEventListener('change', () => { flush(); open(sel.value); });
    v.addEventListener('click', async (e) => {
      const hb = e.target.closest('#defi-card [data-hint]');
      if (hb) { const h = $('#dhint-' + hb.dataset.hint, v); h.hidden = !h.hidden; return; }
      const db = e.target.closest('[data-defi]');
      if (db) {
        const d = window.DEFIS.find((x) => x.id === db.dataset.defi);
        flush();
        const id = newProject('Défi : ' + d.title);
        list.find((x) => x.id === id).defi = d.id;
        saveIndex(list);
        open(id);
        $('.defis', v).open = false;
        $('#defi-card', v).scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const b = e.target.closest('[data-p]');
      if (!b) return;
      const p = list.find((x) => x.id === cur);
      if (b.dataset.p === 'new') {
        const name = prompt('Nom du nouveau projet :', 'Réseau ' + (list.length + 1));
        if (name == null) return;
        flush(); open(newProject(name.trim() || 'Réseau ' + (list.length + 1)));
      } else if (b.dataset.p === 'rename' && p) {
        const name = prompt('Nouveau nom :', p.name);
        if (name && name.trim()) { p.name = name.trim(); saveIndex(list); fillSel(); persist(); }
      } else if (b.dataset.p === 'export' && p) {
        App.download(App.fileSlug(p.name) + '.reseau.json', sim.dump({ name: p.name }), 'application/json');
      } else if (b.dataset.p === 'import') {
        const [file] = await App.pickFiles('.json,application/json', false);
        if (!file) return;
        try {
          const data = JSON.parse(await App.readFile(file));
          const s = NS.fromDump(data);
          open(newProject(data.name || file.name.replace(/\.(reseau\.)?json$/i, ''), s));
          App.toast('Réseau importé.');
        } catch (err) { App.toast('Import impossible : ' + err.message); }
      } else if (b.dataset.p === 'delete' && p) {
        if (!confirm('Supprimer définitivement le projet « ' + p.name + ' » ?')) return;
        store.del(PK(cur));
        try { const t = JSON.parse(store.get('reviciel.atelier.supprimes') || '{}'); t[cur] = Date.now(); store.set('reviciel.atelier.supprimes', JSON.stringify(t)); } catch (err) { /* rien */ }
        list = list.filter((x) => x.id !== cur);
        saveIndex(list);
        if (!list.length) newProject('Réseau 1');
        open(list[0].id);
      }
    });
    open(cur);
    return () => { flush(); if (ws) ws.destroy(); };
  });
})();
