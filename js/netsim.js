/* RéviCIEL — simulateur réseau : équipements (PC, switch, routeur), liaisons, VLAN, routage, ping, DHCP, ACL
   et affichages « show » façon Cisco IOS. Moteur original, sans lien avec un logiciel existant. */
(function (global) {
  'use strict';

  /* ---------- Adresses IP ---------- */
  function ipToInt(s) {
    const m = String(s).trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!m) return null;
    const p = m.slice(1).map(Number);
    if (p.some((x) => x > 255)) return null;
    return (((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]) >>> 0;
  }
  const ipStr = (n) => (n == null ? '' : [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'));
  function maskLen(m) {
    let len = 0, zero = false;
    for (let i = 31; i >= 0; i--) { if ((m >>> i) & 1) { if (zero) return -1; len++; } else zero = true; }
    return len;
  }
  const net = (ip, mask) => (ip & mask) >>> 0;
  const same = (a, b, mask) => net(a, mask) === net(b, mask);
  const hex4 = (n) => (n & 0xffff).toString(16).toUpperCase().padStart(4, '0');

  /* ---------- Noms d'interfaces ---------- */
  const IF_TYPES = [
    { re: /^(g|gi|gig|giga|gigab|gigabi|gigabit|gigabite|gigabitet|gigabiteth|gigabitethe|gigabitether|gigabitethern|gigabitetherne|gigabitethernet)$/i, name: 'GigabitEthernet' },
    { re: /^(f|fa|fas|fast|faste|fastet|fasteth|fastethe|fastether|fastethern|fastetherne|fastethernet)$/i, name: 'FastEthernet' },
    { re: /^(v|vl|vla|vlan)$/i, name: 'Vlan' }
  ];
  function normIf(text) {
    const m = String(text).replace(/\s+/g, '').match(/^([a-z]+)([\d/.]+)$/i);
    if (!m) return null;
    const t = IF_TYPES.find((x) => x.re.test(m[1]));
    if (!t) return null;
    if (t.name === 'Vlan') return /^\d+$/.test(m[2]) ? 'Vlan' + Number(m[2]) : null;
    if (!/^\d+\/\d+(\.\d+)?$/.test(m[2])) return null;
    return t.name + m[2];
  }
  const shortIf = (n) => n.replace('GigabitEthernet', 'Gig').replace('FastEthernet', 'Fa');
  function ifKey(n) { const t = n.indexOf('Fast') === 0 ? 0 : n.indexOf('Gig') === 0 ? 1 : 2; return [t].concat((n.match(/\d+/g) || []).map(Number)); }
  function sortIfs(list) {
    return list.slice().sort((a, b) => {
      const A = ifKey(a), B = ifKey(b);
      for (let i = 0; i < Math.max(A.length, B.length); i++) {
        const x = A[i] == null ? -1 : A[i], y = B[i] == null ? -1 : B[i];
        if (x !== y) return x - y;
      }
      return 0;
    });
  }

  /* ---------- Mots de passe (affichage façon IOS) ---------- */
  const XLAT = 'dsfd;kfoA,.iyewrkldJKDHSUBsgvca69834ncxv9873254k;fg87';
  function type7(pw) {
    let out = '08';
    for (let i = 0; i < pw.length; i++) out += (pw.charCodeAt(i) ^ XLAT.charCodeAt((8 + i) % XLAT.length)).toString(16).toUpperCase().padStart(2, '0');
    return out;
  }
  function secret5(pw) {
    let h = 5381;
    for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) >>> 0;
    const abc = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let s = '';
    for (let i = 0; i < 22; i++) { h = (Math.imul(h, 1103515245) + 12345) >>> 0; s += abc[h % 64]; }
    return '$1$mERr$' + s;
  }

  /* ---------- Équipements ---------- */
  function newIf(shut) {
    return { ip: null, mask: null, shutdown: shut, desc: null, mode: 'access', modeSet: false, vlan: 1, allowed: null, native: 1, encap: null, encapNative: false, aclIn: null, aclOut: null, helper: null };
  }
  function defaultCfg(type) {
    const c = {
      hostname: type === 'switch' ? 'Switch' : 'Router', enableSecret: null, enablePassword: null, servicePE: false, banner: null,
      domainLookup: true, domainName: null, users: {}, rsa: 0, sshVersion: null,
      lines: { con: { password: null, login: false, local: false }, vty: { password: null, login: false, local: false, transport: null } },
      ifs: {}, vlans: { 1: 'default' }, routes: [], gateway: null, pools: {}, excluded: [], acls: {}
    };
    if (type === 'switch') {
      for (let i = 1; i <= 24; i++) c.ifs['FastEthernet0/' + i] = newIf(false);
      for (let i = 1; i <= 2; i++) c.ifs['GigabitEthernet0/' + i] = newIf(false);
      c.ifs.Vlan1 = newIf(true);
    } else {
      for (let i = 0; i <= 2; i++) c.ifs['GigabitEthernet0/' + i] = newIf(true);
    }
    return c;
  }

  /* PC, portable et serveur sont des « hôtes » (une carte réseau, une invite de commandes) */
  function isHost(t) { return t === 'pc' || t === 'laptop' || t === 'server'; }
  function defaultServices() {
    return {
      http: { on: true, page: 'Bienvenue sur le serveur web !' },
      dns: { on: false, records: [] },
      dhcp: { on: false, gw: null, dns: null, start: null, mask: null, max: 50 }
    };
  }
  function makeDevice(s, k) {
    const d = { id: s.id, type: s.type, label: s.label || s.id, x: s.x, y: s.y, mode: 'user', ctx: null, pending: null, used: {}, history: [], screen: '', pingOk: {}, pingFail: {}, arp: {} };
    d.mac = '00D0.' + hex4(0x58A1 + k * 977) + '.' + hex4(0x1C07 + k * 4099);
    if (isHost(s.type)) {
      d.pc = Object.assign({ ip: null, mask: null, gw: null, dns: null, dhcp: false }, s.pc ? {
        ip: s.pc.ip ? ipToInt(s.pc.ip) : null, mask: s.pc.mask ? ipToInt(s.pc.mask) : null, gw: s.pc.gw ? ipToInt(s.pc.gw) : null, dns: s.pc.dns ? ipToInt(s.pc.dns) : null, dhcp: !!s.pc.dhcp
      } : {});
      if (s.type === 'server') { d.services = defaultServices(); d.leases = {}; }
    } else { d.cfg = defaultCfg(s.type); d.startup = null; d.leases = {}; }
    return d;
  }

  function Sim(lab) {
    this.devices = {};
    this.order = [];
    this.macSeq = 0;
    lab.devices.forEach((s) => {
      const d = makeDevice(s, this.macSeq++);
      this.devices[d.id] = d;
      this.order.push(d.id);
    });
    this.links = lab.links.map((l) => ({ a: [l[0], l[1]], b: [l[2], l[3]], cable: l[4] || 'auto' }));
  }

  /* ---------- Ports, câbles, ajout et suppression ---------- */
  const PREFIX = { router: 'Router', switch: 'Switch', pc: 'PC', laptop: 'Laptop', server: 'Server' };
  const isConsolePort = (n) => n === 'Console' || n === 'RS232';
  Sim.prototype.ports = function (id) {
    const d = this.devices[id];
    if (isHost(d.type)) return ['FastEthernet0', 'RS232'];
    return sortIfs(Object.keys(d.cfg.ifs).filter((n) => n.indexOf('Vlan') !== 0 && n.indexOf('.') === -1)).concat(['Console']);
  };
  Sim.prototype.linkOf = function (id, ifn) {
    for (const l of this.links) {
      if (l.a[0] === id && l.a[1] === ifn) return { l, peer: l.b };
      if (l.b[0] === id && l.b[1] === ifn) return { l, peer: l.a };
    }
    return null;
  };
  Sim.prototype.portUsed = function (id, ifn) { return !!this.linkOf(id, ifn); };
  /* câble droit entre équipements différents (PC/routeur ↔ switch), croisé entre équipements semblables */
  Sim.prototype.rightCable = function (a, b) {
    const cls = (t) => (t === 'switch' ? 'x' : 'n');
    return cls(this.devices[a].type) === cls(this.devices[b].type) ? 'croise' : 'droit';
  };
  Sim.prototype.cableOk = function (l) {
    if (l.cable === 'console') return isConsolePort(l.a[1]) && isConsolePort(l.b[1]) && l.a[1] !== l.b[1];
    if (isConsolePort(l.a[1]) || isConsolePort(l.b[1])) return false;
    if (!l.cable || l.cable === 'auto') return true;
    return l.cable === this.rightCable(l.a[0], l.b[0]);
  };
  Sim.prototype.addDevice = function (type, x, y) {
    let k = 0;
    while (this.devices[PREFIX[type] + k]) k++;
    const d = makeDevice({ id: PREFIX[type] + k, type, x, y }, this.macSeq++ + 37);
    this.devices[d.id] = d;
    this.order.push(d.id);
    return d.id;
  };
  Sim.prototype.removeDevice = function (id) {
    this.links = this.links.filter((l) => l.a[0] !== id && l.b[0] !== id);
    this.order = this.order.filter((x) => x !== id);
    delete this.devices[id];
  };
  Sim.prototype.addLink = function (a, ia, b, ib, cable) {
    if (a === b) return 'Impossible de relier un équipement à lui-même.';
    if (this.portUsed(a, ia) || this.portUsed(b, ib)) return 'Ce port est déjà utilisé.';
    if (cable === 'console' && !(isConsolePort(ia) && isConsolePort(ib) && ia !== ib)) return 'Un câble console relie le port RS232 d\'un PC au port Console d\'un routeur ou d\'un switch.';
    if (cable !== 'console' && (isConsolePort(ia) || isConsolePort(ib))) return 'Les ports Console et RS232 se branchent avec un câble console.';
    this.links.push({ a: [a, ia], b: [b, ib], cable: cable || 'auto' });
    return null;
  };
  Sim.prototype.removeLink = function (l) { this.links = this.links.filter((x) => x !== l); };

  Sim.prototype.peerOf = function (id, ifn) {
    for (const l of this.links) {
      if (l.a[0] === id && l.a[1] === ifn) return l.b;
      if (l.b[0] === id && l.b[1] === ifn) return l.a;
    }
    return null;
  };
  Sim.prototype.adminUp = function (id, ifn) {
    const d = this.devices[id];
    if (isHost(d.type)) return true;
    const i = d.cfg.ifs[ifn];
    return !!i && !i.shutdown;
  };
  /* lien physique : câble branché et les deux côtés activés */
  Sim.prototype.physUp = function (id, ifn) {
    const x = this.linkOf(id, ifn);
    return !!x && x.l.cable !== 'console' && this.cableOk(x.l) && this.adminUp(id, ifn) && this.adminUp(x.peer[0], x.peer[1]);
  };
  function allowed(i, v) { return !i.allowed || i.allowed.indexOf(v) !== -1; }
  Sim.prototype.carries = function (d, n, v) { const i = d.cfg.ifs[n]; return i.mode === 'trunk' ? allowed(i, v) : i.vlan === v; };
  Sim.prototype.ifUp = function (id, ifn) {
    const d = this.devices[id];
    if (isHost(d.type)) return this.physUp(id, 'FastEthernet0');
    const i = d.cfg.ifs[ifn];
    if (!i) return false;
    if (ifn.indexOf('.') !== -1) return !i.shutdown && this.ifUp(id, ifn.split('.')[0]);
    if (ifn.indexOf('Vlan') === 0) {
      const v = Number(ifn.slice(4));
      if (i.shutdown || !(v in d.cfg.vlans)) return false;
      return Object.keys(d.cfg.ifs).some((n) => n.indexOf('Vlan') !== 0 && this.physUp(id, n) && this.carries(d, n, v));
    }
    return this.physUp(id, ifn);
  };

  /* ---------- Domaines de diffusion (VLAN, trunks, sous-interfaces) ---------- */
  Sim.prototype.side = function (id, ifn) {
    const d = this.devices[id];
    if (isHost(d.type)) return ifn === 'FastEthernet0' ? { u: 'ep:' + id + ':nic' } : null;
    const i = d.cfg.ifs[ifn];
    if (!i || i.shutdown) return null;
    const map = {};
    if (d.type === 'switch') {
      if (i.mode === 'trunk') {
        map.u = 'sw:' + id + ':' + i.native;
        Object.keys(d.cfg.vlans).map(Number).forEach((v) => { if (v !== i.native && allowed(i, v)) map['t' + v] = 'sw:' + id + ':' + v; });
      } else if (i.vlan in d.cfg.vlans) map.u = 'sw:' + id + ':' + i.vlan;
      return map;
    }
    map.u = 'ep:' + id + ':' + ifn;
    Object.keys(d.cfg.ifs).forEach((n) => {
      if (n.indexOf(ifn + '.') !== 0) return;
      const s = d.cfg.ifs[n];
      if (s.shutdown || s.encap == null) return;
      map[s.encapNative ? 'u' : 't' + s.encap] = 'ep:' + id + ':' + n;
    });
    return map;
  };
  Sim.prototype.segments = function () {
    const P = {};
    const find = (x) => { if (P[x] === undefined) P[x] = x; while (P[x] !== x) { P[x] = P[P[x]]; x = P[x]; } return x; };
    const union = (a, b) => { a = find(a); b = find(b); if (a !== b) P[a] = b; };
    this.links.forEach((l) => {
      if (l.cable === 'console' || !this.cableOk(l)) return;
      const A = this.side(l.a[0], l.a[1]), B = this.side(l.b[0], l.b[1]);
      if (!A || !B) return;
      Object.keys(A).forEach((c) => { if (B[c]) union(A[c], B[c]); });
    });
    this.order.forEach((id) => {
      const d = this.devices[id];
      if (d.type !== 'switch') return;
      Object.keys(d.cfg.ifs).forEach((n) => { if (n.indexOf('Vlan') === 0 && this.ifUp(id, n)) union('ep:' + id + ':' + n, 'sw:' + id + ':' + Number(n.slice(4))); });
    });
    return find;
  };
  Sim.prototype.net = function () {
    const find = this.segments();
    const eps = [];
    this.order.forEach((id) => {
      const d = this.devices[id];
      if (isHost(d.type)) {
        if (d.pc.ip != null && d.pc.mask != null && this.ifUp(id)) eps.push({ dev: id, ifn: 'nic', key: 'ep:' + id + ':nic', ip: d.pc.ip, mask: d.pc.mask });
        return;
      }
      Object.keys(d.cfg.ifs).forEach((n) => {
        const i = d.cfg.ifs[n];
        if (i.ip != null && this.ifUp(id, n)) eps.push({ dev: id, ifn: n, key: 'ep:' + id + ':' + n, ip: i.ip, mask: i.mask });
      });
    });
    eps.forEach((e) => { e.seg = find(e.key); });
    return { eps, find };
  };

  /* ---------- Routage ---------- */
  Sim.prototype.staticUsable = function (N, id, r) {
    const mine = N.eps.filter((e) => e.dev === id);
    if (r.nh != null) return mine.find((e) => same(e.ip, r.nh, e.mask)) || null;
    return mine.find((e) => e.ifn === r.ifn) || null;
  };
  Sim.prototype.lookup = function (N, id, dst) {
    const d = this.devices[id];
    let best = null, bestLen = -1;
    N.eps.forEach((e) => {
      if (e.dev !== id) return;
      const l = maskLen(e.mask);
      if (same(e.ip, dst, e.mask) && l > bestLen) { best = { ep: e, nh: null }; bestLen = l; }
    });
    d.cfg.routes.forEach((r) => {
      const l = maskLen(r.mask);
      if (l <= bestLen || net(dst, r.mask) !== r.net) return;
      const ep = this.staticUsable(N, id, r);
      if (!ep) return;
      best = { ep, nh: r.nh, ifOnly: r.nh == null };
      bestLen = l;
    });
    return best;
  };
  Sim.prototype.aclOk = function (d, ifn, dir, src) {
    const i = d.cfg.ifs[ifn];
    const n = i && (dir === 'in' ? i.aclIn : i.aclOut);
    if (n == null) return true;
    const acl = d.cfg.acls[n];
    if (!acl || !acl.length) return true;
    for (const r of acl) if (((src & ~r.wild) >>> 0) === ((r.src & ~r.wild) >>> 0)) return r.action === 'permit';
    return false;
  };
  Sim.prototype.send = function (N, id, src, dst) {
    let cur = id, inIfn = null;
    const hops = [];
    for (let ttl = 0; ttl < 16; ttl++) {
      const d = this.devices[cur];
      if (N.eps.some((e) => e.dev === cur && e.ip === dst)) return { ok: true, hops };
      let egress, nextIp;
      if (d.type === 'router') {
        const here = inIfn ? N.eps.find((e) => e.dev === cur && e.ifn === inIfn) : null;
        const hereIp = here ? here.ip : null;
        if (inIfn && !this.aclOk(d, inIfn, 'in', src)) return { ok: false, why: 'acl', from: hereIp, hops };
        const r = this.lookup(N, cur, dst);
        if (!r) return { ok: false, why: 'noroute', from: hereIp, hops };
        if (!this.aclOk(d, r.ep.ifn, 'out', src)) return { ok: false, why: 'acl', from: hereIp || r.ep.ip, hops };
        egress = r.ep;
        if (r.nh != null) nextIp = r.nh;
        else if (r.ifOnly && !same(egress.ip, dst, egress.mask)) {
          const peer = N.eps.find((e) => e.seg === egress.seg && e.key !== egress.key && this.devices[e.dev].type === 'router');
          nextIp = peer ? peer.ip : dst;
        } else nextIp = dst;
      } else {
        const ep = N.eps.find((e) => e.dev === cur);
        if (!ep) return { ok: false, why: 'noip', hops };
        if (same(ep.ip, dst, ep.mask)) nextIp = dst;
        else {
          const gw = isHost(d.type) ? d.pc.gw : d.cfg.gateway;
          if (gw == null || !same(ep.ip, gw, ep.mask)) return { ok: false, why: 'nogw', hops };
          nextIp = gw;
        }
        egress = ep;
      }
      const target = N.eps.find((e) => e.seg === egress.seg && e.ip === nextIp && e.key !== egress.key);
      if (!target) return { ok: false, why: 'timeout', hops };
      if (target.ip === dst) return { ok: true, hops };
      hops.push(target.ip);
      if (this.devices[target.dev].type !== 'router') return { ok: false, why: 'timeout', hops };
      cur = target.dev;
      inIfn = target.ifn;
    }
    return { ok: false, why: 'ttl', hops };
  };
  /* ping aller-retour : renvoie { ok, why, from, hops, src, owner } */
  Sim.prototype.ping = function (id, dst) {
    const N = this.net();
    const d = this.devices[id];
    let src = null;
    if (d.type === 'router') {
      const own = N.eps.find((e) => e.dev === id && e.ip === dst);
      const r = this.lookup(N, id, dst);
      src = own ? own.ip : r ? r.ep.ip : null;
      if (src == null) return { ok: false, why: 'noroute', hops: [] };
    } else {
      const ep = N.eps.find((e) => e.dev === id);
      if (!ep) return { ok: false, why: 'noip', hops: [] };
      src = ep.ip;
    }
    const go = this.send(N, id, src, dst);
    if (!go.ok) return go;
    const owner = N.eps.find((e) => e.ip === dst);
    if (!owner) return { ok: false, why: 'timeout', hops: go.hops };
    const back = this.send(N, owner.dev, dst, src);
    if (!back.ok) return { ok: false, why: 'noreply', hops: go.hops };
    return { ok: true, hops: go.hops, src, owner: owner.dev };
  };

  /* ---------- DHCP ---------- */
  Sim.prototype.ipInUse = function (ip, exceptDev) {
    return this.order.some((id) => {
      if (id === exceptDev) return false;
      const d = this.devices[id];
      if (isHost(d.type)) return d.pc.ip === ip;
      return Object.keys(d.cfg.ifs).some((n) => d.cfg.ifs[n].ip === ip);
    });
  };
  Sim.prototype.dhcp = function (pcId) {
    const pc = this.devices[pcId];
    if (!this.ifUp(pcId)) return null;
    const find = this.segments();
    const mySeg = find('ep:' + pcId + ':nic');
    for (const id of this.order) {
      const d = this.devices[id];
      /* serveur DHCP (service du serveur) */
      if (d.type === 'server' && d.services.dhcp.on && id !== pcId) {
        const s = d.services.dhcp, me = d.pc;
        if (me.ip == null || s.start == null || s.mask == null || !this.ifUp(id) || find('ep:' + id + ':nic') !== mySeg) continue;
        const already = Object.keys(d.leases).find((ip) => d.leases[ip] === pc.mac);
        if (already) return { ip: ipToInt(already), mask: s.mask, gw: s.gw, dns: s.dns, server: me.ip };
        for (let k = 0; k < (s.max || 50); k++) {
          const ip = (s.start + k) >>> 0;
          if (!same(ip, s.start, s.mask)) break;
          if (d.leases[ipStr(ip)] || this.ipInUse(ip, pcId)) continue;
          d.leases[ipStr(ip)] = pc.mac;
          return { ip, mask: s.mask, gw: s.gw, dns: s.dns, server: me.ip };
        }
        return { full: true };
      }
      if (d.type !== 'router') continue;
      for (const n of Object.keys(d.cfg.ifs)) {
        const i = d.cfg.ifs[n];
        if (i.ip == null || !this.ifUp(id, n) || find('ep:' + id + ':' + n) !== mySeg) continue;
        for (const pname of Object.keys(d.cfg.pools)) {
          const p = d.cfg.pools[pname];
          if (p.network == null || p.mask == null || net(i.ip, p.mask) !== p.network) continue;
          const already = Object.keys(d.leases).find((ip) => d.leases[ip] === pc.mac);
          if (already) return { ip: ipToInt(already), mask: p.mask, gw: p.router, dns: p.dns, server: i.ip };
          const size = (~p.mask) >>> 0;
          for (let k = 1; k < size; k++) {
            const ip = (p.network + k) >>> 0;
            if (d.cfg.excluded.some((x) => ip >= x[0] && ip <= x[1])) continue;
            if (d.leases[ipStr(ip)] || this.ipInUse(ip, pcId)) continue;
            d.leases[ipStr(ip)] = pc.mac;
            return { ip, mask: p.mask, gw: p.router, dns: p.dns, server: i.ip };
          }
          return { full: true };
        }
      }
    }
    return null;
  };
  Sim.prototype.release = function (pcId) {
    const pc = this.devices[pcId];
    this.order.forEach((id) => {
      const d = this.devices[id];
      if (d.leases) Object.keys(d.leases).forEach((ip) => { if (d.leases[ip] === pc.mac) delete d.leases[ip]; });
    });
  };

  /* ---------- Services : DNS et web ---------- */
  Sim.prototype.resolve = function (fromId, name) {
    const ip = ipToInt(name);
    if (ip != null) return { ip };
    const d = this.devices[fromId], dns = d.pc ? d.pc.dns : null;
    if (dns == null) return { err: 'nodns' };
    const r = this.ping(fromId, dns);
    if (!r.ok) return { err: 'dnsdown' };
    const srv = this.devices[r.owner];
    if (srv.type !== 'server' || !srv.services.dns.on) return { err: 'dnsdown' };
    const rec = srv.services.dns.records.find((x) => x.name.toLowerCase() === String(name).toLowerCase());
    return rec ? { ip: rec.ip, via: dns } : { err: 'notfound' };
  };
  Sim.prototype.browse = function (fromId, url) {
    const host = String(url).trim().replace(/^https?:\/\//i, '').split(/[/:]/)[0];
    if (!host) return { err: 'URL vide.' };
    const res = this.resolve(fromId, host);
    if (res.err === 'nodns') return { err: 'Aucun serveur DNS configuré sur ce PC : utilise l\'adresse IP du serveur, ou renseigne un DNS.' };
    if (res.err) return { err: 'Impossible de trouver « ' + host + ' » (le serveur DNS ne répond pas ou ne connaît pas ce nom).' };
    const r = this.ping(fromId, res.ip);
    if (!r.ok) return { err: 'Le délai d\'attente de la requête est dépassé : ' + ipStr(res.ip) + ' ne répond pas.' };
    const srv = this.devices[r.owner];
    if (srv.type !== 'server' || !srv.services.http.on) return { err: 'Connexion refusée : aucun serveur web sur ' + ipStr(res.ip) + '.' };
    return { ok: true, ip: res.ip, page: srv.services.http.page, server: srv.label };
  };

  /* ---------- Trajet d'un paquet (pour l'animation du mode Simulation) ---------- */
  Sim.prototype.l2path = function (a, b) {
    const prev = {}, q = [a];
    prev[a] = null;
    while (q.length) {
      const cur = q.shift();
      if (cur === b) break;
      if (cur !== a && this.devices[cur].type !== 'switch') continue;
      this.links.forEach((l) => {
        let next = null, myPort = null;
        if (l.a[0] === cur) { next = l.b[0]; myPort = l.a[1]; } else if (l.b[0] === cur) { next = l.a[0]; myPort = l.b[1]; }
        if (next == null || next in prev || !this.physUp(cur, myPort)) return;
        prev[next] = cur;
        q.push(next);
      });
    }
    if (!(b in prev)) return null;
    const path = [];
    for (let x = b; x != null; x = prev[x]) path.unshift(x);
    return path;
  };
  Sim.prototype.trace = function (srcId, dst) {
    const r = this.ping(srcId, dst);
    const N = this.net();
    const seq = [srcId];
    (r.hops || []).forEach((ip) => { const e = N.eps.find((x) => x.ip === ip); if (e && seq[seq.length - 1] !== e.dev) seq.push(e.dev); });
    if (r.ok && r.owner && seq[seq.length - 1] !== r.owner) seq.push(r.owner);
    let path = [srcId];
    for (let i = 1; i < seq.length; i++) {
      const p = this.l2path(seq[i - 1], seq[i]);
      if (!p) break;
      path = path.concat(p.slice(1));
    }
    /* échec : on avance jusqu'au switch voisin pour montrer où le paquet se perd */
    if (!r.ok && r.why !== 'noip' && r.why !== 'nogw') {
      const last = path[path.length - 1];
      const l = this.links.find((x) => (x.a[0] === last || x.b[0] === last) && this.physUp(last, x.a[0] === last ? x.a[1] : x.b[1]));
      const nxt = l ? (l.a[0] === last ? l.b[0] : l.a[0]) : null;
      if (nxt && this.devices[nxt].type === 'switch' && path.indexOf(nxt) === -1 && !(r.hops || []).length) path.push(nxt);
    }
    return { ok: r.ok, why: r.why, path, from: r.from };
  };

  /* ---------- Affichages « show » ---------- */
  const pad = (s, n) => { s = String(s); return s.length >= n ? s + ' ' : s + ' '.repeat(n - s.length); };
  function vlanList(arr) {
    const a = arr.slice().sort((x, y) => x - y), out = [];
    for (let i = 0; i < a.length; i++) {
      let j = i;
      while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++;
      out.push(j > i ? a[i] + '-' + a[j] : String(a[i]));
      i = j;
    }
    return out.join(',');
  }
  Sim.prototype.showIpBrief = function (id) {
    const d = this.devices[id];
    const rows = ['Interface              IP-Address      OK? Method Status                Protocol'];
    sortIfs(Object.keys(d.cfg.ifs)).forEach((n) => {
      const i = d.cfg.ifs[n], up = this.ifUp(id, n);
      const st = i.shutdown ? 'administratively down' : up ? 'up' : 'down';
      rows.push(pad(n, 23) + pad(i.ip != null ? ipStr(i.ip) : 'unassigned', 16) + pad('YES', 4) + pad(i.ip != null ? 'manual' : 'unset', 7) + pad(st, 22) + (up ? 'up' : 'down'));
    });
    return rows.join('\n');
  };
  Sim.prototype.showVlan = function (id) {
    const d = this.devices[id];
    const rows = ['', 'VLAN Name                             Status    Ports', '---- -------------------------------- --------- -------------------------------'];
    const ports = sortIfs(Object.keys(d.cfg.ifs).filter((n) => n.indexOf('Vlan') !== 0));
    Object.keys(d.cfg.vlans).map(Number).sort((a, b) => a - b).forEach((v) => {
      const list = ports.filter((n) => d.cfg.ifs[n].mode !== 'trunk' && d.cfg.ifs[n].vlan === v).map(shortIf);
      const chunks = [];
      for (let k = 0; k < list.length; k += 4) chunks.push(list.slice(k, k + 4).join(', '));
      rows.push(pad(v, 5) + pad(d.cfg.vlans[v], 33) + pad('active', 10) + (chunks[0] || ''));
      for (let k = 1; k < chunks.length; k++) rows.push(' '.repeat(48) + chunks[k]);
    });
    [[1002, 'fddi-default'], [1003, 'token-ring-default'], [1004, 'fddinet-default'], [1005, 'trnet-default']].forEach((x) => rows.push(pad(x[0], 5) + pad(x[1], 33) + 'active'));
    return rows.join('\n');
  };
  Sim.prototype.showTrunk = function (id) {
    const d = this.devices[id];
    const tr = sortIfs(Object.keys(d.cfg.ifs).filter((n) => d.cfg.ifs[n].mode === 'trunk' && this.physUp(id, n)));
    if (!tr.length) return '';
    const vl = Object.keys(d.cfg.vlans).map(Number);
    const r = ['Port        Mode         Encapsulation  Status        Native vlan'];
    tr.forEach((n) => r.push(pad(shortIf(n), 12) + pad('on', 13) + pad('802.1q', 15) + pad('trunking', 14) + d.cfg.ifs[n].native));
    r.push('', 'Port        Vlans allowed on trunk');
    tr.forEach((n) => { const i = d.cfg.ifs[n]; r.push(pad(shortIf(n), 12) + (i.allowed ? vlanList(i.allowed) : '1-1005')); });
    r.push('', 'Port        Vlans allowed and active in management domain');
    tr.forEach((n) => r.push(pad(shortIf(n), 12) + vlanList(vl.filter((v) => allowed(d.cfg.ifs[n], v)))));
    return r.join('\n');
  };
  Sim.prototype.showRoute = function (id) {
    const d = this.devices[id], N = this.net();
    const out = ['Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP', '       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area', '       * - candidate default, U - per-user static route', ''];
    const routes = d.cfg.routes.filter((r) => this.staticUsable(N, id, r));
    const def = routes.find((r) => r.mask === 0);
    out.push(def ? 'Gateway of last resort is ' + (def.nh != null ? ipStr(def.nh) : '0.0.0.0') + ' to network 0.0.0.0' : 'Gateway of last resort is not set', '');
    const lines = [];
    N.eps.filter((e) => e.dev === id).forEach((e) => {
      lines.push({ k: net(e.ip, e.mask), t: 'C    ' + ipStr(net(e.ip, e.mask)) + '/' + maskLen(e.mask) + ' is directly connected, ' + e.ifn });
      lines.push({ k: e.ip, t: 'L    ' + ipStr(e.ip) + '/32 is directly connected, ' + e.ifn });
    });
    routes.forEach((r) => lines.push({ k: r.net, t: (r.mask === 0 ? 'S*   ' : 'S    ') + ipStr(r.net) + '/' + maskLen(r.mask) + ' [1/0] ' + (r.nh != null ? 'via ' + ipStr(r.nh) : 'is directly connected, ' + r.ifn) }));
    lines.sort((a, b) => a.k - b.k).forEach((l) => out.push(l.t));
    return out.join('\n');
  };
  Sim.prototype.showMac = function (id) {
    const d = this.devices[id];
    const r = ['          Mac Address Table', '-------------------------------------------', '', 'Vlan    Mac Address       Type        Ports', '----    -----------       --------    -----'];
    sortIfs(Object.keys(d.cfg.ifs).filter((n) => n.indexOf('Vlan') !== 0)).forEach((n) => {
      const p = this.peerOf(id, n);
      if (!p || !this.physUp(id, n)) return;
      const peer = this.devices[p[0]];
      const i = d.cfg.ifs[n];
      r.push(pad('   ' + (i.mode === 'trunk' ? i.native : i.vlan), 8) + pad(peer.mac.toLowerCase(), 18) + pad('DYNAMIC', 12) + shortIf(n));
    });
    return r.join('\n');
  };
  Sim.prototype.showLeases = function (id) {
    const d = this.devices[id];
    const r = ['IP address       Client-ID/              Lease expiration        Type', '                 Hardware address'];
    Object.keys(d.leases).forEach((ip) => r.push(pad(ip, 17) + pad(d.leases[ip], 24) + pad('--', 24) + 'Automatic'));
    return r.join('\n');
  };
  Sim.prototype.showAcl = function (id) {
    const d = this.devices[id], r = [];
    Object.keys(d.cfg.acls).forEach((n) => {
      r.push('Standard IP access list ' + n);
      d.cfg.acls[n].forEach((e, k) => r.push('    ' + (k + 1) * 10 + ' ' + aclText(e)));
    });
    return r.join('\n');
  };
  function aclText(e) {
    if (e.wild === 0xFFFFFFFF) return e.action + ' any';
    if (e.wild === 0) return e.action + ' host ' + ipStr(e.src);
    return e.action + ' ' + ipStr(e.src) + ' ' + ipStr(e.wild);
  }

  /* ---------- Configuration en cours (show running-config) ---------- */
  function renderConfig(d, c) {
    const L = ['!', 'version 15.1', 'no service timestamps log datetime msec', 'no service timestamps debug datetime msec', (c.servicePE ? '' : 'no ') + 'service password-encryption', '!', 'hostname ' + c.hostname, '!'];
    if (c.enableSecret) L.push('enable secret 5 ' + secret5(c.enableSecret));
    if (c.enablePassword) L.push('enable password ' + (c.servicePE ? '7 ' + type7(c.enablePassword) : c.enablePassword));
    if (c.enableSecret || c.enablePassword) L.push('!');
    if (d.type === 'router') {
      c.excluded.forEach((x) => L.push('ip dhcp excluded-address ' + ipStr(x[0]) + (x[1] !== x[0] ? ' ' + ipStr(x[1]) : '')));
      Object.keys(c.pools).forEach((p) => {
        const P = c.pools[p];
        L.push('!', 'ip dhcp pool ' + p);
        if (P.network != null) L.push(' network ' + ipStr(P.network) + ' ' + ipStr(P.mask));
        if (P.router != null) L.push(' default-router ' + ipStr(P.router));
        if (P.dns != null) L.push(' dns-server ' + ipStr(P.dns));
      });
      L.push('!');
    }
    if (!c.domainLookup) L.push('no ip domain-lookup');
    if (c.domainName) L.push('ip domain-name ' + c.domainName);
    Object.keys(c.users).forEach((u) => {
      const x = c.users[u];
      L.push('username ' + u + (x.priv ? ' privilege ' + x.priv : '') + (x.secret ? ' secret 5 ' + secret5(x.secret) : ' password ' + (c.servicePE ? '7 ' + type7(x.password) : x.password)));
    });
    if (c.sshVersion) L.push('ip ssh version ' + c.sshVersion);
    L.push('!');
    if (d.type === 'switch') L.push('spanning-tree mode pvst', '!');
    sortIfs(Object.keys(c.ifs)).forEach((n) => {
      const i = c.ifs[n];
      L.push('interface ' + n);
      if (i.desc) L.push(' description ' + i.desc);
      if (d.type === 'switch' && n.indexOf('Vlan') !== 0) {
        if (i.mode === 'trunk') {
          if (i.native !== 1) L.push(' switchport trunk native vlan ' + i.native);
          if (i.allowed) L.push(' switchport trunk allowed vlan ' + vlanList(i.allowed));
          L.push(' switchport mode trunk');
        } else {
          if (i.vlan !== 1) L.push(' switchport access vlan ' + i.vlan);
          if (i.modeSet) L.push(' switchport mode access');
        }
      }
      if (i.encap != null) L.push(' encapsulation dot1Q ' + i.encap + (i.encapNative ? ' native' : ''));
      if (d.type === 'router' || n.indexOf('Vlan') === 0) L.push(i.ip != null ? ' ip address ' + ipStr(i.ip) + ' ' + ipStr(i.mask) : ' no ip address');
      if (i.helper != null) L.push(' ip helper-address ' + ipStr(i.helper));
      if (i.aclIn != null) L.push(' ip access-group ' + i.aclIn + ' in');
      if (i.aclOut != null) L.push(' ip access-group ' + i.aclOut + ' out');
      if (i.shutdown) L.push(' shutdown');
      L.push('!');
    });
    if (d.type === 'switch' && c.gateway != null) L.push('ip default-gateway ' + ipStr(c.gateway), '!');
    if (d.type === 'router') {
      L.push('ip classless');
      c.routes.forEach((r) => L.push('ip route ' + ipStr(r.net) + ' ' + ipStr(r.mask) + ' ' + (r.nh != null ? ipStr(r.nh) : r.ifn)));
      L.push('!');
      Object.keys(c.acls).forEach((a) => c.acls[a].forEach((e) => L.push('access-list ' + a + ' ' + aclText(e))));
      if (Object.keys(c.acls).length) L.push('!');
    }
    if (c.banner) L.push('banner motd ^C' + c.banner + '^C', '!');
    const line = (name, x) => {
      L.push('line ' + name);
      if (x.password) L.push(' password ' + (c.servicePE ? '7 ' + type7(x.password) : x.password));
      if (x.local) L.push(' login local'); else if (x.login) L.push(' login');
      if (x.transport) L.push(' transport input ' + x.transport);
      L.push('!');
    };
    line('con 0', c.lines.con);
    if (d.type === 'router') L.push('line aux 0', '!');
    line('vty 0 4', c.lines.vty);
    L.push('!', 'end');
    return L.join('\n');
  }
  Sim.prototype.runningConfig = function (id, fromStartup) {
    const d = this.devices[id];
    const c = fromStartup ? JSON.parse(d.startup) : d.cfg;
    const body = renderConfig(d, c);
    return (fromStartup ? 'Using ' + body.length + ' bytes\n' : 'Building configuration...\n\nCurrent configuration : ' + body.length + ' bytes\n') + body;
  };
  Sim.prototype.saved = function (id) { const d = this.devices[id]; return d.startup != null && d.startup === JSON.stringify(d.cfg); };
  Sim.prototype.save = function (id) { const d = this.devices[id]; d.startup = JSON.stringify(d.cfg); };

  /* ---------- Sauvegarde de l'état du lab ---------- */
  const KEYS = ['cfg', 'startup', 'leases', 'pc', 'services', 'mac', 'label', 'x', 'y', 'mode', 'ctx', 'pending', 'used', 'history', 'screen', 'pingOk', 'pingFail', 'arp'];
  Sim.prototype.dump = function (meta) {
    return JSON.stringify(Object.assign({ v: 2, app: 'RéviCIEL-réseau' }, meta || {}, {
      devices: this.order.map((id) => {
        const d = this.devices[id], o = { id, type: d.type };
        KEYS.forEach((k) => { if (d[k] !== undefined) o[k] = k === 'screen' ? String(d[k]).slice(-12000) : k === 'history' ? d[k].slice(-60) : d[k]; });
        return o;
      }),
      links: this.links
    }));
  };
  /* Recrée un réseau complet à partir d'une sauvegarde (mode libre, import de fichier) */
  function fromDump(json) {
    const s = typeof json === 'string' ? JSON.parse(json) : json;
    if (!s || !Array.isArray(s.devices)) throw new Error('Fichier de réseau invalide.');
    const sim = new Sim({ devices: s.devices.map((d) => ({ id: d.id, type: d.type, x: d.x, y: d.y, label: d.label })), links: [] });
    sim.restore(JSON.stringify(s));
    return sim;
  }
  Sim.prototype.restore = function (json) {
    try {
      const s = JSON.parse(json);
      s.devices.forEach((x) => { const d = this.devices[x.id]; if (d) KEYS.forEach((k) => { if (x[k] !== undefined) d[k] = x[k]; }); });
      if (Array.isArray(s.links) && s.links.every((l) => this.devices[l.a[0]] && this.devices[l.b[0]])) this.links = s.links.map((l) => ({ a: l.a.slice(), b: l.b.slice(), cable: l.cable || 'auto' }));
      return true;
    } catch (e) { return false; }
  };

  global.NetSim = { Sim, fromDump, isHost, ipToInt, ipStr, maskLen, net, same, normIf, shortIf, sortIfs, newIf, defaultCfg, type7, vlanList };
})(window);
