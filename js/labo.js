/* RéviCIEL — écran du labo réseau : liste des labs, schéma, terminal IOS, configuration des PC, objectifs. */
(function () {
  'use strict';
  const { E, icon, $, $$, bar } = App;
  const NS = window.NetSim, CLI = window.NetCLI;
  const KEY = (id) => 'reviciel.labo.' + id;

  const helpers = (sim) => window.labHelpers(sim);

  function createSim(lab, fresh) {
    const sim = new NS.Sim(lab);
    Object.keys(lab.setup || {}).forEach((id) => CLI.runSetup(sim, id, lab.setup[id]));
    if (!fresh) { try { const j = localStorage.getItem(KEY(lab.id)); if (j) sim.restore(j); } catch (e) { /* stockage indisponible */ } }
    sim.order.forEach((id) => { const d = sim.devices[id]; if (!d.screen) d.screen = CLI.boot(sim, id); });
    return sim;
  }
  const labState = (id) => Store.state.labs[id] || { goals: [], done: false };
  const levelOf = (n) => window.LAB_LEVELS.find((x) => x.n === n);

  /* ---------- Liste des labs ---------- */
  function labRow(l) {
    const st = labState(l.id), L = levelOf(l.level);
    const nd = (st.goals || []).filter(Boolean).length;
    const badge = st.done ? '<span class="badge ok">' + icon('check') + ' Réussi</span>' : nd ? '<span class="badge warn">' + nd + '/' + l.goals.length + ' objectifs</span>' : '<span class="badge">Nouveau</span>';
    return '<a class="fiche-row" style="--c:' + L.color + '" href="#/labo/' + l.id + '"><span class="num' + (st.done ? ' done' : '') + '">' + (st.done ? icon('check') : icon('network')) + '</span>' +
      '<div class="body"><h3>' + E(l.title) + '</h3><p>' + E(l.desc) + '</p><div class="badges">' + badge + '<span class="badge">' + icon('clock') + ' ' + l.time + '</span></div></div>' + icon('right', 'chev') + '</a>';
  }
  App.route(/^\/labo$/, (v) => {
    App.setTitle('Labo réseau');
    const total = window.LABS.length, done = window.LABS.filter((l) => labState(l.id).done).length;
    let html = '<div class="page-head"><h1>Labo réseau</h1><p>Configure de vrais switchs et routeurs avec les commandes Cisco IOS, dans un simulateur intégré à RéviCIEL (il marche aussi sans connexion). Chaque lab commence par un cours, puis les objectifs se cochent tout seuls quand ta configuration fonctionne.</p></div>' +
      '<div class="card section" style="margin-top:0">' + bar(done / total, '#0284c7') + '<div class="row between small" style="margin-top:8px"><span>' + done + ' / ' + total + ' labs réussis</span><a href="#/labo/' + (window.LABS.find((l) => !labState(l.id).done) || window.LABS[0]).id + '">Continuer →</a></div></div>' +
      '<div class="callout info section"><div class="callout-title">Et Cisco Packet Tracer ?</div><p>Ce labo reprend la ligne de commande que tu utilises dans Packet Tracer (mêmes commandes, mêmes abréviations, l\'aide « ? »). Pour les très gros réseaux et les fichiers .pkt donnés par tes profs, continue d\'utiliser Packet Tracer.</p></div>';
    window.LAB_LEVELS.forEach((L) => {
      const labs = window.LABS.filter((l) => l.level === L.n);
      const n = labs.filter((l) => labState(l.id).done).length;
      html += '<section class="section"><div class="section-head"><h2><span class="lvl" style="--c:' + L.color + '">' + L.name + '</span></h2><span class="small muted">' + n + '/' + labs.length + ' réussis</span></div><p class="muted small" style="margin-top:-6px">' + E(L.desc) + '</p><div class="fiche-list">' + labs.map(labRow).join('') + '</div></section>';
    });
    v.innerHTML = html;
  });

  /* ---------- Schéma du réseau ---------- */
  const ICONS = {
    router: '<circle r="23" class="ic"/><path d="M-14 0h28M0-14v28M10-4l4 4-4 4M-10-4l-4 4 4 4M-4 10l4 4 4-4M-4-10l4-4 4 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    switch: '<rect x="-33" y="-16" width="66" height="32" rx="8" class="ic"/><path d="M-19-5h32m-4-4 4 4-4 4M19 5h-32m4-4-4 4 4 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    pc: '<rect x="-21" y="-22" width="42" height="29" rx="4" class="ic"/><rect x="-17" y="-18" width="34" height="21" rx="2" fill="#dbeafe"/><path d="M-7 8h14l3 7h-20z" class="ic"/>'
  };
  const portLabel = (n) => n.replace('GigabitEthernet', 'G').replace('FastEthernet', 'F');
  function topoSvg(sim, sel) {
    let s = '<svg viewBox="0 0 640 300" class="topo" role="img" aria-label="Schéma du réseau">';
    sim.links.forEach((l) => {
      const A = sim.devices[l.a[0]], B = sim.devices[l.b[0]];
      const up = sim.physUp(l.a[0], l.a[1]);
      s += '<line x1="' + A.x + '" y1="' + A.y + '" x2="' + B.x + '" y2="' + B.y + '" class="lk ' + (up ? 'up' : 'down') + '"/>';
      [[A, B, l.a], [B, A, l.b]].forEach(([D, O, side]) => {
        const col = up ? 'up' : sim.adminUp(side[0], side[1]) ? 'wait' : 'down';
        const t1 = 0.2, t2 = 0.36;
        s += '<circle cx="' + (D.x + (O.x - D.x) * t1) + '" cy="' + (D.y + (O.y - D.y) * t1) + '" r="4.5" class="dot ' + col + '"/>';
        if (D.type !== 'pc') s += '<text x="' + (D.x + (O.x - D.x) * t2) + '" y="' + (D.y + (O.y - D.y) * t2 - 4) + '" class="pl">' + portLabel(side[1]) + '</text>';
      });
    });
    sim.order.forEach((id) => {
      const d = sim.devices[id], name = d.type === 'pc' ? d.label : d.cfg.hostname;
      s += '<g class="dev ' + d.type + (id === sel ? ' sel' : '') + '" data-dev="' + E(id) + '" transform="translate(' + d.x + ' ' + d.y + ')" tabindex="0" role="button" aria-label="Ouvrir ' + E(name) + '">' +
        '<circle r="36" class="halo"/>' + ICONS[d.type] + '<text y="' + (d.type === 'pc' ? 30 : 34) + '" class="dl">' + E(name) + '</text>' +
        (d.type === 'pc' ? '<text y="43" class="dip">' + (d.pc.ip != null ? NS.ipStr(d.pc.ip) : 'pas d\'IP') + '</text>' : '') + '</g>';
    });
    return s + '</svg>';
  }

  /* ---------- Page d'un lab ---------- */
  App.route(/^\/labo\/([\w-]+)$/, (v, [labId], params) => {
    const lab = window.LABS.find((l) => l.id === labId);
    if (!lab) return App.notFound(v, 'Lab introuvable');
    const L = levelOf(lab.level);
    let sim = createSim(lab);
    let st = JSON.parse(JSON.stringify(labState(lab.id)));
    if (!Array.isArray(st.goals)) st.goals = [];
    let sel = lab.start || sim.order[0];
    let tab = st.goals.some(Boolean) || params.get('pratique') ? 'pratique' : 'cours';
    const idx = window.LABS.indexOf(lab), next = window.LABS[idx + 1];
    App.setTitle(lab.title);

    v.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/labo">Labo réseau</a><span>›</span><span>' + L.name + '</span></div>' +
      '<div class="lab-head"><span class="lvl" style="--c:' + L.color + '">' + L.name + ' · ' + lab.time + '</span><h1>' + E(lab.title) + '</h1><p class="muted">' + E(lab.desc) + '</p></div>' +
      '<div class="seg lab-tabs" id="lab-tabs"><button data-tab="cours">' + icon('book') + ' Cours</button><button data-tab="pratique">' + icon('network') + ' Pratique</button></div>' +
      '<div id="pane-cours" class="card"><div class="md">' + RCMD.render(lab.cours).html + '</div><div class="row" style="margin-top:16px"><button class="btn lg" data-tab="pratique">Passer à la pratique ' + icon('right') + '</button></div></div>' +
      '<div id="pane-pratique" class="lab-grid">' +
      '<div class="lab-main"><div class="card topo-card"><div id="topo"></div><p class="small muted topo-help">Touche un équipement pour l\'ouvrir. Lien vert = actif · orange = en attente de l\'autre côté · rouge = coupé.</p></div>' +
      '<div class="dev-tabs" id="dev-tabs"></div><div id="dev-panel"></div></div>' +
      '<aside class="lab-side"><div class="card" id="goals-card"></div>' +
      '<div class="card"><div class="row"><button class="btn secondary sm" id="show-sol">' + icon('info') + ' Voir la solution</button><button class="btn ghost sm" id="reset">' + icon('refresh') + ' Recommencer</button></div><div id="solution"></div></div></aside></div>';

    const setTab = (t) => {
      tab = t;
      $('#pane-cours', v).hidden = t !== 'cours';
      $('#pane-pratique', v).hidden = t !== 'pratique';
      $$('#lab-tabs button', v).forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
      if (t === 'pratique') { const i = $('#term-in', v); if (i && window.innerWidth > 900) i.focus({ preventScroll: true }); }
    };

    /* sauvegarde de l'état du simulateur */
    let saveT = null;
    const persist = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY(lab.id), sim.dump()); } catch (e) { /* plein */ } }, 300); };

    /* objectifs */
    function renderGoals() {
      const n = lab.goals.filter((g, k) => st.goals[k]).length;
      const all = n === lab.goals.length;
      $('#goals-card', v).innerHTML = (all ? '<div class="callout exemple" style="margin-bottom:14px"><div class="callout-title">' + icon('check') + ' Lab réussi, bravo !</div><p>' + (next ? 'Prêt pour la suite ? <a href="#/labo/' + next.id + '">' + E(next.title) + ' →</a>' : 'Tu as terminé tous les labs. Tu es prêt pour Packet Tracer !') + '</p></div>' : '') +
        '<div class="row between" style="margin-bottom:8px"><h3 style="margin:0">Objectifs</h3><span class="badge ' + (all ? 'ok' : '') + '">' + n + ' / ' + lab.goals.length + '</span></div>' + bar(n / lab.goals.length, L.color) +
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
        else App.toast('Objectif atteint ✓', { duration: 1800 });
        Store.setLab(lab.id, st);
      }
      renderGoals();
    }

    /* schéma + onglets d'équipements */
    function renderTopo() {
      $('#topo', v).innerHTML = topoSvg(sim, sel);
      $('#dev-tabs', v).innerHTML = sim.order.map((id) => {
        const d = sim.devices[id];
        return '<button class="chip' + (id === sel ? ' on' : '') + '" data-sel="' + E(id) + '">' + icon(d.type === 'pc' ? 'phone' : d.type === 'router' ? 'network' : 'layers') + ' ' + E(d.type === 'pc' ? d.label : d.cfg.hostname) + '</button>';
      }).join('');
    }
    function changed() {
      renderTopo(); checkGoals(); persist();
      const d = sim.devices[sel], head = $('.term-head b', v);
      if (head && d) head.textContent = d.type === 'pc' ? d.label : d.cfg.hostname;
    }

    /* terminal (IOS ou invite de commandes du PC) */
    function mountTerm(id) {
      const d = sim.devices[id], isPc = d.type === 'pc';
      const out = $('#term-out', v), inp = $('#term-in', v), pr = $('#term-prompt', v), box = $('#term', v);
      let hIdx = d.history.length;
      const paint = () => {
        out.textContent = d.screen;
        pr.textContent = CLI.promptOf(d);
        inp.type = CLI.isSecret(d) ? 'password' : 'text';
        box.scrollTop = box.scrollHeight;
      };
      const add = (s) => { d.screen = (d.screen + s).slice(-12000); };
      const run = (line) => {
        const echo = CLI.promptOf(d) + (CLI.isSecret(d) ? '' : line);
        const res = isPc ? CLI.pcExec(sim, id, line) : CLI.exec(sim, id, line);
        if (res === '\f') d.screen = ''; else add(echo + '\n' + (res ? res + '\n' : ''));
        hIdx = d.history.length;
        paint();
        if (isPc) fillPcForm();
        changed();
      };
      const help = () => {
        const line = inp.value;
        add(CLI.promptOf(d) + line + '?\n' + CLI.help(sim, id, line) + '\n');
        paint(); changed(); inp.focus();
      };
      const ctrlZ = () => {
        const p = CLI.promptOf(d), r = CLI.ctrlZ(sim, id);
        add(p + inp.value + '^Z\n' + (r ? r + '\n' : ''));
        inp.value = ''; paint(); changed();
      };
      const hist = (dir) => {
        if (dir < 0 && hIdx > 0) hIdx--;
        else if (dir > 0 && hIdx < d.history.length) hIdx++;
        inp.value = d.history[hIdx] || '';
      };
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); const line = inp.value; inp.value = ''; run(line); }
        else if (e.key === '?' && !isPc && !CLI.isSecret(d)) { e.preventDefault(); help(); }
        else if (e.key === 'Tab') { e.preventDefault(); inp.value = CLI.complete(sim, id, inp.value); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); hist(-1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); hist(1); }
        else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z') && !isPc) { e.preventDefault(); ctrlZ(); }
      });
      inp.addEventListener('input', () => {
        if (!isPc && !CLI.isSecret(d) && inp.value.slice(-1) === '?') { inp.value = inp.value.slice(0, -1); help(); }
      });
      box.addEventListener('click', () => { if (!String(window.getSelection())) inp.focus({ preventScroll: true }); });
      $$('.term-keys button', v).forEach((b) => b.addEventListener('click', () => {
        const k = b.dataset.k;
        if (k === '?') help();
        else if (k === 'tab') inp.value = CLI.complete(sim, id, inp.value);
        else if (k === 'up') hist(-1);
        else if (k === 'down') hist(1);
        else if (k === 'z') ctrlZ();
        else if (k === 'cls') { d.screen = ''; paint(); persist(); }
        inp.focus({ preventScroll: true });
      }));
      paint();
    }

    /* panneau de configuration IP du PC */
    function fillPcForm() {
      const d = sim.devices[sel];
      if (!d || d.type !== 'pc' || !$('#pc-ip', v)) return;
      const p = d.pc, s = (n) => (n != null ? NS.ipStr(n) : '');
      $('#pc-ip', v).value = s(p.ip); $('#pc-mask', v).value = s(p.mask); $('#pc-gw', v).value = s(p.gw); $('#pc-dns', v).value = s(p.dns);
      $$('#pc-mode button', v).forEach((b) => b.classList.toggle('active', (b.dataset.m === 'dhcp') === !!p.dhcp));
      $$('.pc-grid input', v).forEach((i) => { i.disabled = !!p.dhcp; });
    }
    function mountPc(id) {
      const d = sim.devices[id], msg = $('#pc-msg', v);
      const say = (t, okk) => { msg.textContent = t; msg.className = 'small ' + (okk ? 'status-ok' : 'status-warn'); };
      $('#pc-ip', v).addEventListener('blur', () => {
        const ip = NS.ipToInt($('#pc-ip', v).value), m = $('#pc-mask', v);
        if (ip != null && !m.value.trim()) m.value = ip >>> 24 < 128 ? '255.0.0.0' : ip >>> 24 < 192 ? '255.255.0.0' : '255.255.255.0';
      });
      $('#pc-mode', v).addEventListener('click', (e) => {
        const b = e.target.closest('[data-m]');
        if (!b) return;
        if (b.dataset.m === 'dhcp') {
          d.pc.dhcp = true;
          const r = CLI.dhcpApply(sim, d);
          fillPcForm();
          say(r.ok ? 'Adresse obtenue du serveur DHCP ' + NS.ipStr(r.server) + '.' : 'Aucun serveur DHCP n\'a répondu : adresse automatique APIPA (169.254.x.x).', r.ok);
        } else {
          d.pc.dhcp = false; sim.release(id);
          fillPcForm();
          say('Mode statique : saisis l\'adresse puis Enregistrer.', true);
        }
        changed();
      });
      $('#pc-save', v).addEventListener('click', () => {
        if (d.pc.dhcp) { say('Le PC est en DHCP : passe en « Statique » pour saisir une adresse.', false); return; }
        const val = (sel) => $(sel, v).value.trim();
        const ip = NS.ipToInt(val('#pc-ip')), mask = NS.ipToInt(val('#pc-mask'));
        const gw = val('#pc-gw') ? NS.ipToInt(val('#pc-gw')) : null, dns = val('#pc-dns') ? NS.ipToInt(val('#pc-dns')) : null;
        if (ip == null) return say('Adresse IP invalide (exemple : 192.168.1.10).', false);
        if (mask == null || NS.maskLen(mask) < 0) return say('Masque invalide (exemple : 255.255.255.0).', false);
        if (val('#pc-gw') && gw == null) return say('Passerelle invalide.', false);
        if (val('#pc-dns') && dns == null) return say('Adresse DNS invalide.', false);
        if (NS.maskLen(mask) < 31 && (ip === NS.net(ip, mask) || ip === ((NS.net(ip, mask) | ~mask) >>> 0))) return say('Cette adresse est l\'adresse du réseau ou de broadcast : choisis une adresse d\'hôte.', false);
        if (gw != null && !NS.same(ip, gw, mask)) say('Attention : la passerelle n\'est pas dans le même réseau que le PC.', false);
        else say('Configuration enregistrée.', true);
        Object.assign(d.pc, { ip, mask, gw, dns });
        changed();
      });
      fillPcForm();
    }

    function renderPanel() {
      const d = sim.devices[sel], isPc = d.type === 'pc';
      const name = isPc ? d.label : d.cfg.hostname;
      const term = '<div class="card term-card"><div class="term-head"><b>' + E(name) + '</b><span class="muted small">' + (isPc ? 'Invite de commandes — tape help' : 'Console — « ? » pour l\'aide, Tab pour compléter, ↑ pour l\'historique') + '</span></div>' +
        '<div class="term' + (isPc ? ' pc' : '') + '" id="term"><pre class="term-out" id="term-out"></pre><div class="term-line"><span class="term-prompt" id="term-prompt"></span>' +
        '<input id="term-in" class="term-in" aria-label="Commande" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send"></div></div>' +
        (isPc ? '' : '<div class="term-keys"><button data-k="?">?</button><button data-k="tab">Tab</button><button data-k="up">↑</button><button data-k="down">↓</button><button data-k="z">Ctrl+Z</button><button data-k="cls">Effacer l\'écran</button></div>') + '</div>';
      const pcForm = isPc ? '<div class="card pc-card"><div class="row between"><h3 style="margin:0">Configuration IP — ' + E(name) + '</h3><div class="seg" id="pc-mode"><button data-m="static">Statique</button><button data-m="dhcp">DHCP</button></div></div>' +
        '<div class="pc-grid"><label class="field"><span>Adresse IP</span><input class="input" id="pc-ip" inputmode="decimal" placeholder="192.168.1.10"></label>' +
        '<label class="field"><span>Masque</span><input class="input" id="pc-mask" inputmode="decimal" placeholder="255.255.255.0"></label>' +
        '<label class="field"><span>Passerelle</span><input class="input" id="pc-gw" inputmode="decimal" placeholder="192.168.1.1"></label>' +
        '<label class="field"><span>DNS</span><input class="input" id="pc-dns" inputmode="decimal" placeholder="8.8.8.8"></label></div>' +
        '<div class="row"><button class="btn" id="pc-save">' + icon('check') + ' Enregistrer</button><span id="pc-msg" class="small"></span></div></div>' : '';
      $('#dev-panel', v).innerHTML = pcForm + term;
      if (isPc) mountPc(sel);
      mountTerm(sel);
    }
    function select(id) {
      if (!sim.devices[id] || id === sel) return;
      sel = id;
      renderTopo();
      renderPanel();
      if (window.innerWidth > 900) { const i = $('#term-in', v); if (i) i.focus({ preventScroll: true }); }
    }

    /* événements */
    v.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tab]');
      if (t) { setTab(t.dataset.tab); if (t.dataset.tab === 'pratique') window.scrollTo(0, 0); return; }
      const g = e.target.closest('[data-dev]');
      if (g) { select(g.getAttribute('data-dev')); return; }
      const c = e.target.closest('[data-sel]');
      if (c) { select(c.dataset.sel); return; }
      const hb = e.target.closest('[data-hint]');
      if (hb) { const h = $('#hint-' + hb.dataset.hint, v); h.hidden = !h.hidden; return; }
    });
    v.addEventListener('keydown', (e) => {
      const g = e.target.closest && e.target.closest('[data-dev]');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(g.getAttribute('data-dev')); }
    });
    $('#show-sol', v).addEventListener('click', () => {
      const box = $('#solution', v);
      if (box.innerHTML) { box.innerHTML = ''; return; }
      if (!confirm('Afficher la solution ? Essaie d\'abord avec les indices : c\'est comme ça qu\'on apprend !')) return;
      box.innerHTML = lab.solution.map(([id, steps]) => {
        const d = sim.devices[id];
        return '<h4 style="margin:14px 0 6px">' + E(d.type === 'pc' ? d.label : id) + '</h4><pre class="sol">' + E(steps.join('\n')) + '</pre>';
      }).join('');
    });
    $('#reset', v).addEventListener('click', () => {
      if (!confirm('Recommencer ce lab depuis le début ? Ta configuration actuelle sera effacée.')) return;
      try { localStorage.removeItem(KEY(lab.id)); } catch (e) { /* rien */ }
      sim = createSim(lab, true);
      st = { goals: [], done: st.done };
      Store.setLab(lab.id, st);
      sel = lab.start || sim.order[0];
      renderTopo(); renderPanel(); renderGoals();
      $('#solution', v).innerHTML = '';
    });

    renderTopo();
    renderPanel();
    checkGoals();
    setTab(tab);
    return () => { clearTimeout(saveT); try { localStorage.setItem(KEY(lab.id), sim.dump()); } catch (e) { /* rien */ } };
  });
})();
