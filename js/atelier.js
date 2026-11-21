/* RéviCIEL — Atelier réseau : espace de travail (poser des équipements, câbler, envoyer des messages, mode Simulation). */
(function (global) {
  'use strict';
  const { E, $, $$ } = App;
  const NS = global.NetSim, A = global.Atelier;
  const isHost = NS.isHost;
  const CABLES = {
    auto: { name: 'Automatique', short: 'Auto', desc: 'choisit le bon câble et des ports libres' },
    droit: { name: 'Câble droit', short: 'Droit', desc: 'équipements différents : PC ou routeur ↔ switch' },
    croise: { name: 'Câble croisé', short: 'Croisé', desc: 'équipements semblables : switch ↔ switch, PC ↔ PC, PC ↔ routeur, routeur ↔ routeur' },
    console: { name: 'Câble console', short: 'Console', desc: 'port RS232 du PC → port Console d\'un routeur ou d\'un switch' }
  };
  const CABLE_ICON = {
    auto: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    droit: '<path d="M4 20 20 4"/>',
    croise: '<path d="M4 20 20 4" stroke-dasharray="4 3"/>',
    console: '<path d="M4 18c6 0 4-12 16-12" stroke-dasharray="2 3"/>'
  };
  const TOOL_ICON = {
    select: '<path d="m5 3 14 8-6 2-3 6z"/>',
    del: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    pdu: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="m3 7 9 6 9-6"/>'
  };
  const svgI = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';

  /* opts : { sim(): Sim, world: {w,h}, canPlace, canCable, changed(kind) } */
  A.Workspace = function (root, opts) {
    const W = opts.world.w, H = opts.world.h;
    let tool = 'select', placeType = null, cableType = null, cableA = null, pduSrc = null, pointer = null, drag = null;
    let simMode = false, speed = 1;
    const pdus = [];
    let anim = null;
    const S = () => opts.sim();
    const editable = opts.canPlace || opts.canCable;

    root.innerHTML = '<div class="ws">' +
      '<div class="ws-bar"><div class="ws-tools">' +
      '<button data-tool="select" class="on" title="Sélectionner / ouvrir un équipement (Échap)">' + svgI(TOOL_ICON.select) + '<span>Sélection</span></button>' +
      (editable ? '<button data-tool="del" title="Supprimer un équipement ou un câble">' + svgI(TOOL_ICON.del) + '<span>Supprimer</span></button>' : '') +
      '<button data-tool="pdu" title="Message simple : envoie un ping d\'un équipement à un autre">' + svgI(TOOL_ICON.pdu) + '<span>Message simple</span></button></div>' +
      '<div class="seg ws-mode"><button data-sim="0" class="active">Temps réel</button><button data-sim="1">Simulation</button></div></div>' +
      '<div class="ws-hint"></div>' +
      '<div class="ws-wrap"><svg class="ws-svg' + (W <= 700 ? ' ws-fit' : '') + '" viewBox="0 0 ' + W + ' ' + H + '"' + (W > 700 ? ' style="min-width:700px"' : '') + ' role="img" aria-label="Espace de travail du réseau">' +
      '<defs><pattern id="ws-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="grid-line"/></pattern></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="url(#ws-grid)" class="ws-bg"/><g class="ws-main"></g><g class="ws-anim"></g></svg><div class="ws-menu" hidden></div></div>' +
      '<div class="ws-bottom">' +
      (editable ? '<div class="ws-palette">' +
        (opts.canPlace ? '<div class="pal-group"><span class="pal-title">Équipements</span><div class="pal-items">' +
          ['router', 'switch', 'pc', 'laptop', 'server'].map((t) => '<button data-place="' + t + '" title="' + A.TYPES[t] + '">' + A.miniIcon(t, 30) + '<span>' + A.TYPES[t].replace('Ordinateur portable', 'Portable') + '</span></button>').join('') + '</div></div>' : '') +
        (opts.canCable ? '<div class="pal-group"><span class="pal-title">Connexions</span><div class="pal-items">' +
          Object.keys(CABLES).map((c) => '<button data-cable="' + c + '" class="cb-' + c + '" title="' + CABLES[c].name + ' : ' + CABLES[c].desc + '">' + svgI(CABLE_ICON[c]) + '<span>' + CABLES[c].short + '</span></button>').join('') + '</div></div>' : '') +
        '</div>' : '') +
      '<div class="ws-pdus"><div class="row between"><b>Messages envoyés</b><span class="row"><label class="small sim-only" hidden>Vitesse <select class="spd"><option value="0.5">lente</option><option value="1" selected>normale</option><option value="2">rapide</option></select></label><button class="btn ghost sm" data-clear>Effacer</button></span></div>' +
      '<div class="pdu-list"></div><div class="events sim-only" hidden></div></div></div></div>';

    const svg = $('.ws-svg', root), main = $('.ws-main', root), animL = $('.ws-anim', root), menu = $('.ws-menu', root), wrap = $('.ws-wrap', root), hintEl = $('.ws-hint', root);
    const defaultHint = editable ? 'Choisis un équipement ou un câble en bas, ou touche un équipement pour l\'ouvrir.' : 'Touche un équipement pour l\'ouvrir (Config, CLI, Bureau…).';
    const hint = (t) => { hintEl.textContent = t || defaultHint; };
    hint();

    function ctx() {
      return {
        sim: S,
        changed: (k) => { draw(); opts.changed(k); },
        onPing: (src, ip) => { if (simMode) runAnim(S().trace(src, ip), src, ip); }
      };
    }

    /* ---------- Outils ---------- */
    function setTool(t, extra) {
      tool = t; placeType = t === 'place' ? extra : null; cableType = t === 'cable' ? extra : null; cableA = null; pduSrc = null;
      $$('[data-tool]', root).forEach((b) => b.classList.toggle('on', b.dataset.tool === t));
      $$('[data-place]', root).forEach((b) => b.classList.toggle('on', t === 'place' && b.dataset.place === extra));
      $$('[data-cable]', root).forEach((b) => b.classList.toggle('on', t === 'cable' && b.dataset.cable === extra));
      closeMenu();
      if (t === 'place') hint('Touche l\'espace de travail pour poser : ' + A.TYPES[extra] + '.');
      else if (t === 'cable') hint(CABLES[extra].name + ' : touche le premier équipement' + (extra === 'auto' ? '.' : ', puis choisis le port.'));
      else if (t === 'del') hint('Touche un équipement ou un câble pour le supprimer.');
      else if (t === 'pdu') hint('Message simple : touche l\'équipement source.');
      else hint();
      draw();
    }
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tool],[data-place],[data-cable],[data-sim],[data-clear]');
      if (!b || !root.contains(b)) return;
      if (b.dataset.tool) setTool(b.dataset.tool === tool && b.dataset.tool !== 'select' ? 'select' : b.dataset.tool);
      else if (b.dataset.place) setTool(tool === 'place' && placeType === b.dataset.place ? 'select' : 'place', b.dataset.place);
      else if (b.dataset.cable) setTool(tool === 'cable' && cableType === b.dataset.cable ? 'select' : 'cable', b.dataset.cable);
      else if (b.dataset.sim != null) {
        simMode = b.dataset.sim === '1';
        $$('[data-sim]', root).forEach((x) => x.classList.toggle('active', x === b));
        $$('.sim-only', root).forEach((x) => { x.hidden = !simMode; });
        root.classList.toggle('simulating', simMode);
        if (!simMode) stopAnim();
        hint(simMode ? 'Mode Simulation : envoie un message simple (ou un ping depuis un PC) pour voir le paquet voyager.' : '');
      } else if (b.hasAttribute('data-clear')) { pdus.length = 0; renderPdus(); $('.events', root).innerHTML = ''; stopAnim(); }
    });
    $('.spd', root).addEventListener('change', (e) => { speed = parseFloat(e.target.value) || 1; });

    /* ---------- Menu de choix (ports, adresses) ---------- */
    function closeMenu() { menu.hidden = true; menu.innerHTML = ''; }
    function showMenu(ev, title, items, onPick) {
      menu.innerHTML = '<div class="menu-title">' + E(title) + '</div>' + items.map((it, k) => '<button data-k="' + k + '"' + (it.disabled ? ' disabled' : '') + '>' + E(it.label) + (it.sub ? '<small>' + E(it.sub) + '</small>' : '') + '</button>').join('');
      menu.hidden = false;
      const mw = menu.offsetWidth, mh = menu.offsetHeight;
      menu.style.left = Math.max(8, Math.min(ev.clientX + 6, window.innerWidth - mw - 8)) + 'px';
      menu.style.top = Math.max(8, ev.clientY + 6 + mh > window.innerHeight - 8 ? ev.clientY - mh - 6 : ev.clientY + 6) + 'px';
      menu.onclick = (e) => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; closeMenu(); onPick(items[+b.dataset.k].value); };
    }

    /* ---------- Dessin ---------- */
    function sideState(sim, l, side) {
      if (sim.physUp(side[0], side[1])) return 'up';
      if (!sim.cableOk(l) || !sim.adminUp(side[0], side[1])) return 'down';
      return 'wait';
    }
    function draw() {
      const sim = S();
      let s = '';
      sim.links.forEach((l, i) => {
        const a = sim.devices[l.a[0]], b = sim.devices[l.b[0]];
        if (!a || !b) return;
        const con = l.cable === 'console';
        const kind = con ? 'console' : l.cable === 'auto' ? sim.rightCable(l.a[0], l.b[0]) : l.cable;
        const ok = con || sim.cableOk(l);
        s += '<line class="lk-hit" data-link="' + i + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"/>';
        s += '<line class="lk c-' + kind + (ok ? '' : ' bad') + (!con && sim.physUp(l.a[0], l.a[1]) ? ' up' : '') + '" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"/>';
        [[a, b, l.a], [b, a, l.b]].forEach(([D, O, side]) => {
          const len = Math.hypot(O.x - D.x, O.y - D.y) || 1, ux = (O.x - D.x) / len, uy = (O.y - D.y) / len;
          const dl = Math.min(36, len * 0.3), dt = Math.min(50, len * 0.4), px = -uy, py = ux;
          if (!con) s += '<circle cx="' + (D.x + ux * dl).toFixed(1) + '" cy="' + (D.y + uy * dl).toFixed(1) + '" r="5" class="light ' + sideState(sim, l, side) + '"/>';
          s += '<text x="' + (D.x + ux * dt + px * 13).toFixed(1) + '" y="' + (D.y + uy * dt + py * 13 + 4).toFixed(1) + '" class="pl" text-anchor="' + (px > 0.35 ? 'start' : px < -0.35 ? 'end' : 'middle') + '">' + A.shortPort(side[1]) + '</text>';
        });
      });
      if (cableA && pointer) { const a = sim.devices[cableA[0]]; if (a) s += '<line class="lk tmp" x1="' + a.x + '" y1="' + a.y + '" x2="' + pointer.x + '" y2="' + pointer.y + '"/>'; }
      sim.order.forEach((id) => {
        const d = sim.devices[id];
        const sel = (cableA && cableA[0] === id) || pduSrc === id;
        let sub = '';
        if (isHost(d.type)) sub = d.pc.ip != null ? NS.ipStr(d.pc.ip) : 'pas d\'IP';
        else if (d.cfg.hostname !== d.label && d.cfg.hostname !== (d.type === 'switch' ? 'Switch' : 'Router')) sub = d.cfg.hostname;
        s += '<g class="dev ' + d.type + (sel ? ' sel' : '') + '" data-dev="' + E(id) + '" transform="translate(' + d.x + ' ' + d.y + ')" tabindex="0" role="button" aria-label="' + E(d.label) + '">' +
          '<circle r="38" class="halo"/>' + A.ICONS[d.type] + '<text y="' + (d.type === 'server' ? 40 : 34) + '" class="dl">' + E(d.label) + '</text>' + (sub ? '<text y="' + (d.type === 'server' ? 53 : 47) + '" class="dip">' + E(sub) + '</text>' : '') + '</g>';
      });
      main.innerHTML = s;
    }

    /* ---------- Coordonnées et interactions ---------- */
    function toWorld(e) {
      const p = svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      const m = svg.getScreenCTM();
      const r = m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 };
      return { x: Math.max(30, Math.min(W - 30, r.x)), y: Math.max(30, Math.min(H - 45, r.y)) };
    }
    svg.addEventListener('pointerdown', (e) => {
      closeMenu();
      const g = e.target.closest('[data-dev]');
      if (g) {
        const d = S().devices[g.getAttribute('data-dev')], pt = toWorld(e);
        drag = { id: d.id, sx: pt.x, sy: pt.y, ox: d.x, oy: d.y, moved: false, ev: e };
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
        return;
      }
      const lk = e.target.closest('[data-link]');
      if (lk) { linkClick(S().links[+lk.getAttribute('data-link')]); return; }
      canvasClick(toWorld(e));
    });
    /* sur écran tactile : toucher un équipement le déplace au lieu de faire défiler la page */
    svg.addEventListener('touchstart', (e) => { if (e.target.closest && e.target.closest('[data-dev]')) e.preventDefault(); }, { passive: false });
    svg.addEventListener('pointermove', (e) => {
      pointer = toWorld(e);
      if (drag) {
        const dx = pointer.x - drag.sx, dy = pointer.y - drag.sy;
        if (!drag.moved && Math.hypot(dx, dy) < 6) return;
        drag.moved = true;
        const d = S().devices[drag.id];
        d.x = Math.round(Math.max(30, Math.min(W - 30, drag.ox + dx)));
        d.y = Math.round(Math.max(30, Math.min(H - 45, drag.oy + dy)));
        draw();
      } else if (cableA) draw();
    });
    svg.addEventListener('pointerup', (e) => {
      if (!drag) return;
      const dr = drag;
      drag = null;
      if (dr.moved) opts.changed('move'); else deviceClick(dr.id, e);
    });
    svg.addEventListener('keydown', (e) => {
      const g = e.target.closest && e.target.closest('[data-dev]');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); deviceClick(g.getAttribute('data-dev'), { clientX: 200, clientY: 200 }); }
    });
    const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.dw-back') && tool !== 'select') setTool('select'); };
    document.addEventListener('keydown', onKey);
    const onScroll = (e) => { if (!menu.hidden && !menu.contains(e.target)) closeMenu(); };
    window.addEventListener('scroll', onScroll, true);

    function canvasClick(pt) {
      if (tool === 'place' && placeType) {
        const id = S().addDevice(placeType, Math.round(pt.x), Math.round(pt.y));
        hint(S().devices[id].label + ' ajouté. Touche-le pour le configurer.');
        setTool('select');
        opts.changed('device');
        return;
      }
      if (cableA) { cableA = null; hint('Câblage annulé.'); draw(); }
    }
    function linkClick(l) {
      if (tool !== 'del' || !l) return;
      S().removeLink(l);
      hint('Câble supprimé.');
      draw(); opts.changed('link');
    }
    function deviceClick(id, ev) {
      const sim = S(), d = sim.devices[id];
      if (tool === 'select' || tool === 'place') { A.openDevice(ctx(), id); return; }
      if (tool === 'del') {
        if (!opts.canPlace) { App.toast('Dans ce lab, on ne supprime pas les équipements (seulement les câbles).'); return; }
        if (confirm('Supprimer ' + d.label + ' et ses câbles ?')) { sim.removeDevice(id); hint(d.label + ' supprimé.'); draw(); opts.changed('device'); }
        return;
      }
      if (tool === 'cable') return cableClick(id, ev);
      if (tool === 'pdu') return pduClick(id, ev);
    }

    /* ---------- Câblage ---------- */
    function cableClick(id, ev) {
      const sim = S(), d = sim.devices[id];
      if (cableA && cableA[0] === id) return;
      const isCon = cableType === 'console';
      const ports = sim.ports(id).filter((p) => (isCon ? A.isConsolePort(p) : !A.isConsolePort(p)));
      const free = ports.filter((p) => !sim.portUsed(id, p));
      if (!free.length) { App.toast('Plus aucun port libre adapté sur ' + d.label + '.'); return; }
      const pick = (port) => {
        if (!cableA) { cableA = [id, port]; hint('Touche maintenant le deuxième équipement (Échap pour annuler).'); draw(); return; }
        const a = cableA, cable = cableType === 'auto' ? sim.rightCable(a[0], id) : cableType;
        const err = sim.addLink(a[0], a[1], id, port, cable);
        cableA = null;
        if (err) { App.toast(err, { duration: 5000 }); hint(); draw(); return; }
        const l = sim.links[sim.links.length - 1];
        setTool('select');
        if (cable !== 'console' && !sim.cableOk(l)) {
          const need = sim.rightCable(a[0], id) === 'croise' ? 'croisé' : 'droit';
          App.toast('Lien rouge : mauvais câble ! Entre ' + sim.devices[a[0]].label + ' et ' + d.label + ', il faut un câble ' + need + '.', { duration: 7000 });
          hint('Mauvais câble : supprime-le (outil Supprimer) et rebranche avec un câble ' + need + '.');
        } else hint('Câble branché : ' + sim.devices[a[0]].label + ' (' + A.shortPort(a[1]) + ') ↔ ' + d.label + ' (' + A.shortPort(port) + ').');
        opts.changed('link');
      };
      if (cableType === 'auto') pick(free[0]);
      else showMenu(ev, d.label + ' : choisis le port', ports.map((p) => ({ label: p, sub: sim.portUsed(id, p) ? 'occupé' : '', disabled: sim.portUsed(id, p), value: p })), pick);
    }

    /* ---------- Message simple (ping) ---------- */
    function ipsOf(id) {
      const d = S().devices[id];
      if (isHost(d.type)) return d.pc.ip != null ? [d.pc.ip] : [];
      return NS.sortIfs(Object.keys(d.cfg.ifs)).filter((n) => d.cfg.ifs[n].ip != null).map((n) => d.cfg.ifs[n].ip);
    }
    function pduClick(id, ev) {
      const sim = S(), d = sim.devices[id];
      if (!pduSrc) {
        if (!ipsOf(id).length) { App.toast(d.label + ' n\'a pas encore d\'adresse IP.'); return; }
        pduSrc = id; hint('Touche maintenant l\'équipement de destination.'); draw(); return;
      }
      if (id === pduSrc) return;
      const ips = ipsOf(id);
      if (!ips.length) { App.toast(d.label + ' n\'a pas d\'adresse IP : impossible de lui envoyer un message.'); return; }
      const src = pduSrc;
      const go = (ip) => { send(src, id, ip); setTool('select'); };
      if (ips.length === 1) go(ips[0]);
      else showMenu(ev, 'Adresse de destination', ips.map((ip) => ({ label: NS.ipStr(ip), value: ip })), go);
    }
    function send(src, dstId, ip) {
      const sim = S(), t = sim.trace(src, ip);
      const sd = sim.devices[src];
      (t.ok ? sd.pingOk : sd.pingFail)[NS.ipStr(ip)] = 1;
      pdus.unshift({ src, dst: dstId, ip, ok: t.ok, why: t.why, t });
      renderPdus();
      if (simMode) runAnim(t, src, ip);
      else App.toast((t.ok ? 'Réussi : ' : 'Échec : ') + sd.label + ' → ' + sim.devices[dstId].label + ' (' + NS.ipStr(ip) + ')');
      opts.changed('pdu');
    }
    const WHY = { noip: 'la source n\'a pas d\'adresse IP', nogw: 'pas de passerelle pour sortir du réseau', timeout: 'personne ne répond (câble, VLAN, adresse ?)', noroute: 'un routeur ne connaît pas le réseau de destination', acl: 'bloqué par une ACL', noreply: 'la réponse ne revient pas (passerelle ou route du retour ?)', ttl: 'boucle de routage' };
    function renderPdus() {
      const sim = S(), box = $('.pdu-list', root);
      if (!pdus.length) { box.innerHTML = '<p class="small muted">Aucun message. Utilise l\'outil « Message simple » (l\'enveloppe) : touche la source, puis la destination.</p>'; return; }
      box.innerHTML = '<table class="mini pdu"><thead><tr><th>Statut</th><th>Source</th><th>Destination</th><th>Type</th><th></th></tr></thead><tbody>' + pdus.slice(0, 12).map((p, k) => {
        const s = sim.devices[p.src], d = sim.devices[p.dst];
        return '<tr><td><span class="badge ' + (p.ok ? 'ok' : 'bad') + '">' + (p.ok ? 'Réussi' : 'Échec') + '</span></td><td>' + E(s ? s.label : '?') + '</td><td>' + E(d ? d.label : '?') + ' <span class="muted small">' + NS.ipStr(p.ip) + '</span></td><td>ICMP</td>' +
          '<td><button class="btn ghost sm" data-replay="' + k + '" title="Revoir dans le mode Simulation">▶</button></td></tr>' + (!p.ok && WHY[p.why] ? '<tr class="why"><td colspan="5" class="small muted">Cause probable : ' + WHY[p.why] + '</td></tr>' : '');
      }).join('') + '</tbody></table>';
    }
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-replay]');
      if (!b) return;
      const p = pdus[+b.dataset.replay];
      if (!p) return;
      if (!simMode) $('[data-sim="1"]', root).click();
      runAnim(S().trace(p.src, p.ip), p.src, p.ip);
    });

    /* ---------- Animation du mode Simulation ---------- */
    function stopAnim() { if (anim) { cancelAnimationFrame(anim.raf); anim = null; } animL.innerHTML = ''; }
    function runAnim(t, src, ip) {
      stopAnim();
      const sim = S();
      const pts = t.path.map((id) => sim.devices[id]).filter(Boolean);
      const legs = [];
      for (let i = 0; i + 1 < pts.length; i++) legs.push({ a: pts[i], b: pts[i + 1], reply: false });
      if (t.ok) for (let i = pts.length - 1; i > 0; i--) legs.push({ a: pts[i], b: pts[i - 1], reply: true });
      const ev = $('.events', root);
      ev.innerHTML = '<div class="small muted">Liste des événements — ping de ' + E(sim.devices[src].label) + ' vers ' + NS.ipStr(ip) + '</div><ol>' + legs.map((l) => '<li>' + E(l.a.label) + ' → ' + E(l.b.label) + ' <span class="badge ' + (l.reply ? 'ok' : 'info') + '">ICMP ' + (l.reply ? 'Echo Reply' : 'Echo Request') + '</span></li>').join('') +
        '<li class="end">' + (t.ok ? '✓ Réponse reçue : ping réussi' : '✗ Échec : ' + (WHY[t.why] || 'le paquet est perdu')) + '</li></ol>';
      let k = 0, t0 = null;
      const env = (x, y, reply) => '<g class="env' + (reply ? ' reply' : '') + '" transform="translate(' + x + ' ' + (y - 30) + ')"><rect x="-12" y="-8" width="24" height="16" rx="2"/><path d="m-12-8 12 9 12-9"/></g>';
      const mark = (d, ok) => '<g class="mark ' + (ok ? 'ok' : 'ko') + '" transform="translate(' + d.x + ' ' + (d.y - 34) + ')"><circle r="13"/><path d="' + (ok ? 'm-6 0 4 4 8-8' : 'm-5-5 10 10m0-10-10 10') + '"/></g>';
      const items = $$('li', ev);
      const step = (ts) => {
        if (!anim) return;
        if (k >= legs.length) {
          const last = t.ok ? pts[0] : pts[pts.length - 1];
          animL.innerHTML = last ? mark(last, t.ok) : '';
          items.forEach((li) => li.classList.remove('cur'));
          if (items.length) items[items.length - 1].classList.add('cur');
          anim = null;
          return;
        }
        if (t0 == null) t0 = ts;
        const dur = 700 / speed, p = Math.min(1, (ts - t0) / dur), L = legs[k];
        items.forEach((li, i) => li.classList.toggle('cur', i === k));
        animL.innerHTML = env(L.a.x + (L.b.x - L.a.x) * p, L.a.y + (L.b.y - L.a.y) * p, L.reply);
        if (p >= 1) { k++; t0 = null; }
        anim.raf = requestAnimationFrame(step);
      };
      if (!legs.length) { animL.innerHTML = pts[0] ? mark(pts[0], false) : ''; return; }
      anim = { raf: requestAnimationFrame(step) };
    }

    draw();
    renderPdus();
    return {
      redraw: draw,
      openDevice: (id, tab) => A.openDevice(ctx(), id, tab),
      destroy: () => { stopAnim(); document.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll, true); A.closeDevice(); }
    };
  };
})(window);
