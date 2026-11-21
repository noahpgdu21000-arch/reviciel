/* RéviCIEL — Atelier réseau : fenêtres des équipements (Config, CLI, Bureau, Services), terminal et configuration IP.
   Fonctionnement inspiré des simulateurs réseau pédagogiques ; dessins et code originaux. */
(function (global) {
  'use strict';
  const { E, $, $$ } = App;
  const NS = global.NetSim, CLI = global.NetCLI;
  const isHost = NS.isHost;
  const A = global.Atelier = global.Atelier || {};

  /* ---------- Icônes des équipements (centrées en 0,0) ---------- */
  A.ICONS = {
    router: '<circle r="23" class="ic"/><path d="M-14 0h28M0-14v28M10-4l4 4-4 4M-10-4l-4 4 4 4M-4 10l4 4 4-4M-4-10l4-4 4 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    switch: '<rect x="-33" y="-16" width="66" height="32" rx="8" class="ic"/><path d="M-19-5h32m-4-4 4 4-4 4M19 5h-32m4-4-4 4 4 4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    pc: '<rect x="-21" y="-22" width="42" height="29" rx="4" class="ic"/><rect x="-17" y="-18" width="34" height="21" rx="2" fill="#dbeafe"/><path d="M-7 8h14l3 7h-20z" class="ic"/>',
    laptop: '<rect x="-19" y="-20" width="38" height="25" rx="3" class="ic"/><rect x="-15" y="-16" width="30" height="17" rx="2" fill="#dbeafe"/><path d="M-25 7h50l-4 7h-42z" class="ic"/>',
    server: '<rect x="-17" y="-25" width="34" height="48" rx="4" class="ic"/><path d="M-10-15h20M-10-7h20M-10 1h20" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="8" cy="13" r="2.6" fill="#4ade80"/>'
  };
  A.TYPES = { router: 'Routeur', switch: 'Switch', pc: 'PC', laptop: 'Ordinateur portable', server: 'Serveur' };
  A.miniIcon = (type, size) => '<svg viewBox="-36 -30 72 60" width="' + (size || 34) + '" height="' + Math.round((size || 34) * 0.83) + '" class="dev ' + type + '" aria-hidden="true">' + A.ICONS[type] + '</svg>';
  A.isConsolePort = (n) => n === 'Console' || n === 'RS232';
  A.shortPort = (n) => n.replace('GigabitEthernet', 'Gig').replace('FastEthernet', 'Fa');

  /* ---------- Terminal (CLI d'un routeur/switch ou invite de commandes d'un PC) ---------- */
  A.mountTerminal = function (box, ctx, id, kind) {
    const sim = ctx.sim(), d = sim.devices[id], isPc = kind === 'host';
    box.innerHTML = '<div class="term' + (isPc ? ' pc' : '') + '"><pre class="term-out"></pre><div class="term-line"><span class="term-prompt"></span>' +
      '<input class="term-in" aria-label="Commande" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send"></div></div>' +
      (isPc ? '' : '<div class="term-keys"><button data-k="?">?</button><button data-k="tab">Tab</button><button data-k="up">↑</button><button data-k="down">↓</button><button data-k="z">Ctrl+Z</button><button data-k="cls">Effacer l\'écran</button></div>');
    const term = $('.term', box), out = $('.term-out', box), inp = $('.term-in', box), pr = $('.term-prompt', box);
    if (!d.screen) d.screen = CLI.boot(sim, id);
    let hIdx = d.history.length;
    const paint = () => { out.textContent = d.screen; pr.textContent = CLI.promptOf(d); inp.type = CLI.isSecret(d) ? 'password' : 'text'; term.scrollTop = term.scrollHeight; };
    const add = (s) => { d.screen = (d.screen + s).slice(-12000); };
    const run = (line) => {
      const echo = CLI.promptOf(d) + (CLI.isSecret(d) ? '' : line);
      const secretInput = CLI.isSecret(d);
      const res = isPc ? CLI.pcExec(sim, id, line) : CLI.exec(sim, id, line);
      if (res === '\f') d.screen = ''; else add(echo + '\n' + (res ? res + '\n' : ''));
      hIdx = d.history.length;
      paint();
      const m = !secretInput && line.trim().match(/^(ping|tracert|traceroute)\s+(\S+)/i);
      if (m && ctx.onPing) {
        const ip = NS.ipToInt(m[2]) != null ? NS.ipToInt(m[2]) : isPc ? (sim.resolve(id, m[2]).ip || null) : null;
        if (ip != null) ctx.onPing(id, ip);
      }
      ctx.changed('cli');
    };
    const help = () => { const line = inp.value; add(CLI.promptOf(d) + line + '?\n' + CLI.help(sim, id, line) + '\n'); paint(); ctx.changed('cli'); inp.focus(); };
    const ctrlZ = () => { const p = CLI.promptOf(d), r = CLI.ctrlZ(sim, id); add(p + inp.value + '^Z\n' + (r ? r + '\n' : '')); inp.value = ''; paint(); ctx.changed('cli'); };
    const hist = (dir) => { if (dir < 0 && hIdx > 0) hIdx--; else if (dir > 0 && hIdx < d.history.length) hIdx++; inp.value = d.history[hIdx] || ''; };
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); const line = inp.value; inp.value = ''; run(line); }
      else if (e.key === '?' && !isPc && !CLI.isSecret(d)) { e.preventDefault(); help(); }
      else if (e.key === 'Tab') { e.preventDefault(); inp.value = CLI.complete(sim, id, inp.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); hist(-1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); hist(1); }
      else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z') && !isPc) { e.preventDefault(); ctrlZ(); }
      e.stopPropagation();
    });
    inp.addEventListener('input', () => { if (!isPc && !CLI.isSecret(d) && inp.value.slice(-1) === '?') { inp.value = inp.value.slice(0, -1); help(); } });
    term.addEventListener('click', () => { if (!String(window.getSelection())) inp.focus({ preventScroll: true }); });
    $$('.term-keys button', box).forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k;
      if (k === '?') help(); else if (k === 'tab') inp.value = CLI.complete(sim, id, inp.value);
      else if (k === 'up') hist(-1); else if (k === 'down') hist(1); else if (k === 'z') ctrlZ();
      else if (k === 'cls') { d.screen = ''; paint(); ctx.changed('cli'); }
      inp.focus({ preventScroll: true });
    }));
    paint();
    if (window.innerWidth > 900) setTimeout(() => inp.focus({ preventScroll: true }), 30);
  };

  /* ---------- Configuration IP d'un hôte (PC, portable, serveur) ---------- */
  A.ipForm = function (box, ctx, id) {
    const sim = ctx.sim(), d = sim.devices[id];
    box.innerHTML = '<div class="row between"><b>Interface FastEthernet0</b><div class="seg ipmode"><button data-m="dhcp">DHCP</button><button data-m="static">Statique</button></div></div>' +
      '<div class="pc-grid"><label class="field"><span>Adresse IPv4</span><input class="input" data-f="ip" inputmode="decimal" placeholder="192.168.1.10"></label>' +
      '<label class="field"><span>Masque de sous-réseau</span><input class="input" data-f="mask" inputmode="decimal" placeholder="255.255.255.0"></label>' +
      '<label class="field"><span>Passerelle par défaut</span><input class="input" data-f="gw" inputmode="decimal" placeholder="192.168.1.1"></label>' +
      '<label class="field"><span>Serveur DNS</span><input class="input" data-f="dns" inputmode="decimal" placeholder="8.8.8.8"></label></div>' +
      '<div class="row"><button class="btn" data-save>Enregistrer</button><span class="small ipmsg"></span></div><p class="small muted">Adresse MAC : ' + E(d.mac) + '</p>';
    const f = (k) => $('[data-f="' + k + '"]', box), msg = $('.ipmsg', box);
    const say = (t, ok) => { msg.textContent = t; msg.className = 'small ipmsg ' + (ok ? 'status-ok' : 'status-warn'); };
    const fill = () => {
      const p = d.pc, s = (n) => (n != null ? NS.ipStr(n) : '');
      f('ip').value = s(p.ip); f('mask').value = s(p.mask); f('gw').value = s(p.gw); f('dns').value = s(p.dns);
      $$('.ipmode button', box).forEach((b) => b.classList.toggle('active', (b.dataset.m === 'dhcp') === !!p.dhcp));
      $$('[data-f]', box).forEach((i) => { i.disabled = !!p.dhcp; });
    };
    f('ip').addEventListener('blur', () => {
      const ip = NS.ipToInt(f('ip').value);
      if (ip != null && !f('mask').value.trim()) f('mask').value = ip >>> 24 < 128 ? '255.0.0.0' : ip >>> 24 < 192 ? '255.255.0.0' : '255.255.255.0';
    });
    $('.ipmode', box).addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      if (b.dataset.m === 'dhcp') {
        d.pc.dhcp = true;
        const r = CLI.dhcpApply(sim, d);
        say(r.ok ? 'Adresse obtenue du serveur DHCP ' + NS.ipStr(r.server) + '.' : 'Échec de la requête DHCP : adresse automatique APIPA (169.254.x.x).', r.ok);
      } else { d.pc.dhcp = false; sim.release(id); say('Mode statique : saisis l\'adresse puis Enregistrer.', true); }
      fill(); ctx.changed('ip');
    });
    $('[data-save]', box).addEventListener('click', () => {
      if (d.pc.dhcp) return say('L\'interface est en DHCP : passe en « Statique » pour saisir une adresse.', false);
      const v = (k) => f(k).value.trim();
      const ip = NS.ipToInt(v('ip')), mask = NS.ipToInt(v('mask'));
      const gw = v('gw') ? NS.ipToInt(v('gw')) : null, dns = v('dns') ? NS.ipToInt(v('dns')) : null;
      if (ip == null) return say('Adresse IP invalide (exemple : 192.168.1.10).', false);
      if (mask == null || NS.maskLen(mask) < 0) return say('Masque invalide (exemple : 255.255.255.0).', false);
      if (v('gw') && gw == null) return say('Passerelle invalide.', false);
      if (v('dns') && dns == null) return say('Adresse DNS invalide.', false);
      if (NS.maskLen(mask) < 31 && (ip === NS.net(ip, mask) || ip === ((NS.net(ip, mask) | ~mask) >>> 0))) return say('C\'est l\'adresse du réseau ou de broadcast : choisis une adresse d\'hôte.', false);
      Object.assign(d.pc, { ip, mask, gw, dns });
      if (gw != null && !NS.same(ip, gw, mask)) say('Enregistré, mais attention : la passerelle n\'est pas dans le même réseau.', false);
      else say('Configuration enregistrée.', true);
      ctx.changed('ip');
    });
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); $('[data-save]', box).click(); } });
    fill();
  };

  /* ---------- Configuration graphique d'un routeur/switch (avec commandes IOS équivalentes) ---------- */
  function iosRun(ctx, id, cmds, log) {
    const sim = ctx.sim(), d = sim.devices[id];
    const keep = { mode: d.mode, ctx: d.ctx, pending: d.pending, hist: d.history.length };
    d.mode = 'config'; d.ctx = null; d.pending = null;
    const lines = cmds.map((c) => { const p = CLI.promptOf(d); const o = CLI.exec(sim, id, c); return p + c + (o ? '\n' + o : ''); });
    d.mode = keep.mode; d.ctx = keep.ctx; d.pending = keep.pending; d.history.length = keep.hist;
    log.textContent += lines.join('\n') + '\n';
    log.scrollTop = log.scrollHeight;
    ctx.changed('config');
  }
  function netConfig(box, ctx, id) {
    const sim = ctx.sim(), d = sim.devices[id];
    const ifs = NS.sortIfs(Object.keys(d.cfg.ifs).filter((n) => n.indexOf('.') === -1));
    box.innerHTML = '<div class="dw-cols"><nav class="dw-side"><div class="dw-sec">Global</div><button data-p="global" class="on">Paramètres</button><div class="dw-sec">Interfaces</div>' +
      ifs.map((n) => '<button data-p="' + E(n) + '">' + E(n) + '</button>').join('') + '</nav><section class="dw-pane"></section></div>' +
      '<div class="ios-log"><div class="small muted">Commandes IOS équivalentes</div><pre></pre></div>';
    const pane = $('.dw-pane', box), log = $('.ios-log pre', box);
    function show(p) {
      $$('.dw-side button', box).forEach((b) => b.classList.toggle('on', b.dataset.p === p));
      if (p === 'global') {
        pane.innerHTML = '<h4>Paramètres globaux</h4><label class="field"><span>Nom affiché (sur le schéma)</span><input class="input" data-k="label" value="' + E(d.label) + '"></label>' +
          '<label class="field"><span>Hostname (nom IOS)</span><div class="row"><input class="input" data-k="host" value="' + E(d.cfg.hostname) + '" style="flex:1"><button class="btn sm" data-a="host">Appliquer</button></div></label>' +
          '<div class="row" style="margin-top:12px"><button class="btn secondary sm" data-a="save">Enregistrer la configuration (NVRAM)</button><span class="small ' + (sim.saved(id) ? 'status-ok' : 'status-warn') + '">' + (sim.saved(id) ? 'Configuration enregistrée' : 'Modifications non enregistrées') + '</span></div>';
        $('[data-k="label"]', pane).addEventListener('change', (e) => { d.label = e.target.value.trim() || d.id; ctx.changed('label'); });
        $('[data-a="host"]', pane).addEventListener('click', () => { const h = $('[data-k="host"]', pane).value.trim(); if (h) iosRun(ctx, id, ['hostname ' + h], log); show('global'); });
        $('[data-a="save"]', pane).addEventListener('click', () => { sim.save(id); log.textContent += d.cfg.hostname + '#copy running-config startup-config\nBuilding configuration...\n[OK]\n'; ctx.changed('config'); show('global'); });
        return;
      }
      const i = d.cfg.ifs[p], isSw = d.type === 'switch' && p.indexOf('Vlan') !== 0;
      const link = sim.linkOf(id, p), up = sim.ifUp(id, p);
      const peer = link ? sim.devices[link.peer[0]] : null;
      pane.innerHTML = '<h4>' + E(p) + '</h4><p class="small">' + (peer ? 'Relié à <b>' + E(peer.label) + '</b> (' + E(link.peer[1]) + ')' : p.indexOf('Vlan') === 0 ? 'Interface virtuelle du switch' : 'Aucun câble branché') + ' · Lien : <b class="' + (up ? 'status-ok' : 'status-warn') + '">' + (up ? 'actif' : 'inactif') + '</b></p>' +
        '<label class="check"><input type="checkbox" data-k="on"' + (i.shutdown ? '' : ' checked') + '> Port activé (On)</label>' +
        (isSw ? '<div class="pc-grid"><label class="field"><span>Mode</span><select class="input" data-k="mode"><option value="access">Access</option><option value="trunk">Trunk</option></select></label>' +
          '<label class="field"><span>VLAN (access)</span><input class="input" data-k="vlan" inputmode="numeric" value="' + i.vlan + '"></label></div><button class="btn sm" data-a="sw">Appliquer</button>' :
          '<div class="pc-grid"><label class="field"><span>Adresse IP</span><input class="input" data-k="ip" inputmode="decimal" value="' + (i.ip != null ? NS.ipStr(i.ip) : '') + '"></label>' +
          '<label class="field"><span>Masque</span><input class="input" data-k="mask" inputmode="decimal" value="' + (i.mask != null ? NS.ipStr(i.mask) : '') + '"></label></div><button class="btn sm" data-a="ip">Appliquer</button>');
      $('[data-k="on"]', pane).addEventListener('change', (e) => { iosRun(ctx, id, ['interface ' + p, e.target.checked ? 'no shutdown' : 'shutdown', 'exit'], log); show(p); });
      if (isSw) {
        $('[data-k="mode"]', pane).value = i.mode;
        $('[data-a="sw"]', pane).addEventListener('click', () => {
          const mode = $('[data-k="mode"]', pane).value, v = parseInt($('[data-k="vlan"]', pane).value, 10);
          const cmds = ['interface ' + p, 'switchport mode ' + mode];
          if (mode === 'access' && v >= 1) cmds.push('switchport access vlan ' + v);
          iosRun(ctx, id, cmds.concat(['exit']), log); show(p);
        });
      } else {
        $('[data-a="ip"]', pane).addEventListener('click', () => {
          const ip = $('[data-k="ip"]', pane).value.trim(), mask = $('[data-k="mask"]', pane).value.trim();
          iosRun(ctx, id, ['interface ' + p, ip ? 'ip address ' + ip + ' ' + (mask || '255.255.255.0') : 'no ip address', 'exit'], log); show(p);
        });
      }
    }
    $('.dw-side', box).addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (b) show(b.dataset.p); });
    show('global');
  }

  /* ---------- Bureau d'un hôte : applications ---------- */
  const APPS = [
    { id: 'ip', name: 'Configuration IP', icon: '<path d="M4 6h16v10H4z"/><path d="M9 20h6M12 16v4"/>' },
    { id: 'cmd', name: 'Invite de commandes', icon: '<path d="M3 5h18v14H3z"/><path d="m7 10 3 2-3 2M12 15h5"/>' },
    { id: 'web', name: 'Navigateur web', icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/>' },
    { id: 'term', name: 'Terminal (console)', icon: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/>' }
  ];
  function desktop(box, ctx, id, app) {
    const sim = ctx.sim(), d = sim.devices[id];
    if (!app) {
      box.innerHTML = '<div class="dk-apps">' + APPS.map((a) => '<button class="dk-app" data-app="' + a.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + a.icon + '</svg><span>' + a.name + '</span></button>').join('') + '</div>';
      $('.dk-apps', box).addEventListener('click', (e) => { const b = e.target.closest('[data-app]'); if (b) desktop(box, ctx, id, b.dataset.app); });
      return;
    }
    const meta = APPS.find((a) => a.id === app);
    box.innerHTML = '<div class="dk-head"><button class="btn ghost sm" data-back>← Bureau</button><b>' + meta.name + '</b></div><div class="dk-body"></div>';
    $('[data-back]', box).addEventListener('click', () => desktop(box, ctx, id));
    const body = $('.dk-body', box);
    if (app === 'ip') A.ipForm(body, ctx, id);
    else if (app === 'cmd') A.mountTerminal(body, ctx, id, 'host');
    else if (app === 'web') {
      body.innerHTML = '<div class="row"><input class="input url" placeholder="http://192.168.1.100 ou www.ciel.lan" style="flex:1"><button class="btn sm" data-go>Aller</button></div><div class="webpage">Saisis une adresse puis « Aller ».</div>';
      const go = () => {
        const r = sim.browse(id, $('.url', body).value);
        const page = $('.webpage', body);
        if (r.ok) { d.used['web-ok'] = 1; page.className = 'webpage ok'; page.innerHTML = '<div class="small muted">' + E(NS.ipStr(r.ip)) + ' — ' + E(r.server) + '</div><div class="md">' + RCMD.render(r.page).html + '</div>'; }
        else { page.className = 'webpage ko'; page.textContent = r.err; }
        ctx.changed('web');
      };
      $('[data-go]', body).addEventListener('click', go);
      $('.url', body).addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    } else if (app === 'term') {
      const x = sim.linkOf(id, 'RS232');
      if (!x || x.l.cable !== 'console') { body.innerHTML = '<p class="muted">Aucun câble console n\'est branché sur le port RS232 de ce poste. Utilise l\'outil « Câble console » pour le relier au port Console d\'un routeur ou d\'un switch.</p>'; return; }
      const target = sim.devices[x.peer[0]];
      d.used.terminal = 1;
      body.innerHTML = '<p class="small muted">Connecté à <b>' + E(target.label) + '</b> par le câble console (9600 bauds).</p><div class="tbox"></div>';
      A.mountTerminal($('.tbox', body), ctx, target.id, 'ios');
      ctx.changed('terminal');
    }
  }

  /* ---------- Services d'un serveur ---------- */
  function services(box, ctx, id, which) {
    const sim = ctx.sim(), d = sim.devices[id], S = d.services;
    which = which || 'http';
    const onOff = (on) => '<div class="seg svc-on"><button data-on="1" class="' + (on ? 'active' : '') + '">On</button><button data-on="0" class="' + (on ? '' : 'active') + '">Off</button></div>';
    box.innerHTML = '<div class="dw-cols"><nav class="dw-side"><button data-s="http">HTTP</button><button data-s="dns">DNS</button><button data-s="dhcp">DHCP</button></nav><section class="dw-pane"></section></div>';
    $$('.dw-side button', box).forEach((b) => b.classList.toggle('on', b.dataset.s === which));
    $('.dw-side', box).addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (b) services(box, ctx, id, b.dataset.s); });
    const pane = $('.dw-pane', box);
    const toggle = (obj) => $('.svc-on', pane).addEventListener('click', (e) => { const b = e.target.closest('[data-on]'); if (!b) return; obj.on = b.dataset.on === '1'; ctx.changed('service'); services(box, ctx, id, which); });
    if (which === 'http') {
      pane.innerHTML = '<div class="row between"><h4>Serveur web (HTTP)</h4>' + onOff(S.http.on) + '</div><label class="field"><span>Contenu de la page d\'accueil (Markdown accepté)</span><textarea class="input" rows="6">' + E(S.http.page) + '</textarea></label><button class="btn sm" data-save>Enregistrer</button>';
      toggle(S.http);
      $('[data-save]', pane).addEventListener('click', () => { S.http.page = $('textarea', pane).value; ctx.changed('service'); App.toast('Page enregistrée.'); });
    } else if (which === 'dns') {
      pane.innerHTML = '<div class="row between"><h4>Serveur DNS</h4>' + onOff(S.dns.on) + '</div><div class="row"><input class="input" data-k="name" placeholder="www.ciel.lan" style="flex:2"><input class="input" data-k="ip" placeholder="192.168.1.100" style="flex:1"><button class="btn sm" data-add>Ajouter</button></div>' +
        '<table class="mini"><thead><tr><th>Nom</th><th>Adresse</th><th></th></tr></thead><tbody>' + (S.dns.records.map((r, k) => '<tr><td>' + E(r.name) + '</td><td>' + NS.ipStr(r.ip) + '</td><td><button class="btn ghost sm" data-del="' + k + '">Supprimer</button></td></tr>').join('') || '<tr><td colspan="3" class="muted">Aucun enregistrement</td></tr>') + '</tbody></table>';
      toggle(S.dns);
      $('[data-add]', pane).addEventListener('click', () => {
        const name = $('[data-k="name"]', pane).value.trim(), ip = NS.ipToInt($('[data-k="ip"]', pane).value);
        if (!name || ip == null) { App.toast('Saisis un nom et une adresse IP valide.'); return; }
        S.dns.records.push({ name, ip }); ctx.changed('service'); services(box, ctx, id, 'dns');
      });
      pane.addEventListener('click', (e) => { const b = e.target.closest('[data-del]'); if (b) { S.dns.records.splice(+b.dataset.del, 1); ctx.changed('service'); services(box, ctx, id, 'dns'); } });
    } else {
      const s = S.dhcp, v = (n) => (n != null ? NS.ipStr(n) : '');
      pane.innerHTML = '<div class="row between"><h4>Serveur DHCP</h4>' + onOff(s.on) + '</div><div class="pc-grid">' +
        '<label class="field"><span>Passerelle par défaut</span><input class="input" data-k="gw" value="' + v(s.gw) + '"></label><label class="field"><span>Serveur DNS</span><input class="input" data-k="dns" value="' + v(s.dns) + '"></label>' +
        '<label class="field"><span>Adresse IP de départ</span><input class="input" data-k="start" value="' + v(s.start) + '"></label><label class="field"><span>Masque</span><input class="input" data-k="mask" value="' + v(s.mask) + '"></label>' +
        '<label class="field"><span>Nombre maximum d\'utilisateurs</span><input class="input" data-k="max" inputmode="numeric" value="' + (s.max || 50) + '"></label></div><button class="btn sm" data-save>Enregistrer</button>' +
        '<p class="small muted">Baux attribués : ' + (Object.keys(d.leases).join(', ') || 'aucun') + '</p>';
      toggle(s);
      $('[data-save]', pane).addEventListener('click', () => {
        const g = (k) => $('[data-k="' + k + '"]', pane).value.trim();
        const start = NS.ipToInt(g('start')), mask = NS.ipToInt(g('mask'));
        if (start == null || mask == null || NS.maskLen(mask) < 0) { App.toast('Adresse de départ ou masque invalide.'); return; }
        Object.assign(s, { gw: g('gw') ? NS.ipToInt(g('gw')) : null, dns: g('dns') ? NS.ipToInt(g('dns')) : null, start, mask, max: Math.max(1, parseInt(g('max'), 10) || 50) });
        ctx.changed('service'); App.toast('Service DHCP enregistré.');
      });
    }
  }

  /* ---------- Fenêtre d'un équipement ---------- */
  let current = null;
  A.closeDevice = function () { if (current) { current.remove(); current = null; document.removeEventListener('keydown', escClose); } };
  function escClose(e) { if (e.key === 'Escape') A.closeDevice(); }
  A.openDevice = function (ctx, id, tab) {
    A.closeDevice();
    const sim = ctx.sim(), d = sim.devices[id];
    const host = isHost(d.type);
    const tabs = host ? [['config', 'Config'], ['bureau', 'Bureau']].concat(d.type === 'server' ? [['services', 'Services']] : []) : [['config', 'Config'], ['cli', 'CLI']];
    tab = tab || (host ? 'bureau' : 'cli');
    const wrap = document.createElement('div');
    wrap.className = 'dw-back';
    wrap.innerHTML = '<div class="dw" role="dialog" aria-modal="true" aria-label="' + E(d.label) + '"><div class="dw-head">' + A.miniIcon(d.type, 30) + '<div class="dw-title"><b>' + E(d.label) + '</b><span class="small muted">' + A.TYPES[d.type] + '</span></div>' +
      '<div class="seg dw-tabs">' + tabs.map((t) => '<button data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div><button class="icon-btn dw-close" aria-label="Fermer">✕</button></div><div class="dw-body"></div></div>';
    document.body.appendChild(wrap);
    current = wrap;
    document.addEventListener('keydown', escClose);
    const body = $('.dw-body', wrap);
    const show = (t) => {
      $$('.dw-tabs button', wrap).forEach((b) => b.classList.toggle('active', b.dataset.tab === t));
      body.innerHTML = '';
      if (t === 'cli') A.mountTerminal(body, ctx, id, 'ios');
      else if (t === 'config' && host) {
        body.innerHTML = '<label class="field" style="margin-bottom:14px"><span>Nom affiché</span><input class="input" data-k="label" value="' + E(d.label) + '"></label><div class="ipbox"></div>';
        $('[data-k="label"]', body).addEventListener('change', (e) => { d.label = e.target.value.trim() || d.id; ctx.changed('label'); $('.dw-title b', wrap).textContent = d.label; });
        A.ipForm($('.ipbox', body), ctx, id);
      } else if (t === 'config') netConfig(body, ctx, id);
      else if (t === 'bureau') desktop(body, ctx, id);
      else if (t === 'services') services(body, ctx, id);
    };
    $('.dw-tabs', wrap).addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) show(b.dataset.tab); });
    $('.dw-close', wrap).addEventListener('click', A.closeDevice);
    wrap.addEventListener('pointerdown', (e) => { if (e.target === wrap) A.closeDevice(); });
    show(tab);
  };
})(window);
