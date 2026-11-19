/* RéviCIEL — ligne de commande façon Cisco IOS (switch, routeur) et invite de commandes du PC.
   Abréviations (conf t, sh ip int br), aide « ? », complétion Tab, messages d'erreur réalistes. */
(function (global) {
  'use strict';
  const { ipToInt, ipStr, maskLen, net, same, normIf, newIf, defaultCfg } = NetSim;

  const PROMPT = { user: '>', priv: '#', config: '(config)#', if: '(config-if)#', subif: '(config-subif)#', range: '(config-if-range)#', vlan: '(config-vlan)#', line: '(config-line)#', dhcp: '(dhcp-config)#' };
  const SUBS = ['if', 'subif', 'range', 'vlan', 'line', 'dhcp'];
  const HELP = {
    enable: 'Passer en mode privilégié / mots de passe', disable: 'Revenir au mode utilisateur', configure: 'Entrer en mode configuration', terminal: 'Configurer depuis le terminal',
    exit: 'Sortir du mode actuel', end: 'Revenir au mode privilégié', logout: 'Se déconnecter', show: 'Afficher des informations', ping: 'Tester la connexion vers une adresse',
    traceroute: 'Afficher le chemin vers une adresse', copy: 'Copier une configuration', write: 'Enregistrer la configuration', reload: 'Redémarrer l\'équipement', erase: 'Effacer la configuration enregistrée',
    'running-config': 'Configuration en cours (RAM)', 'startup-config': 'Configuration enregistrée (NVRAM)', ip: 'Commandes IP', interface: 'Configurer une interface', interfaces: 'État des interfaces',
    brief: 'Résumé', vlan: 'VLAN', route: 'Table de routage / route statique', hostname: 'Nommer l\'équipement', secret: 'Mot de passe chiffré', password: 'Mot de passe', service: 'Services',
    'password-encryption': 'Chiffrer les mots de passe affichés', banner: 'Message d\'accueil', motd: 'Message du jour', no: 'Annuler une commande', do: 'Lancer une commande du mode privilégié',
    line: 'Configurer une ligne (console, vty)', console: 'Ligne console', vty: 'Lignes d\'accès à distance', login: 'Demander un mot de passe', local: 'Utiliser les comptes locaux', transport: 'Protocoles autorisés',
    input: 'Connexions entrantes', ssh: 'SSH (chiffré)', telnet: 'Telnet (non chiffré)', username: 'Créer un compte', crypto: 'Chiffrement', key: 'Clés', generate: 'Générer', rsa: 'Clés RSA',
    'domain-name': 'Nom de domaine', 'domain-lookup': 'Résolution DNS des commandes inconnues', 'default-gateway': 'Passerelle du switch', address: 'Adresse IP', shutdown: 'Désactiver l\'interface',
    description: 'Description', switchport: 'Réglages de port de switch', mode: 'Mode du port', access: 'Port d\'accès (un VLAN)', trunk: 'Port trunk (plusieurs VLAN)', allowed: 'VLAN autorisés', native: 'VLAN natif',
    encapsulation: 'Encapsulation (sous-interface)', dot1q: 'IEEE 802.1Q', name: 'Nom', dhcp: 'Serveur DHCP', pool: 'Plage d\'adresses', 'excluded-address': 'Adresses exclues', network: 'Réseau distribué',
    'default-router': 'Passerelle donnée aux clients', 'dns-server': 'Serveur DNS donné aux clients', 'access-list': 'Liste de contrôle d\'accès (ACL)', 'access-group': 'Appliquer une ACL', permit: 'Autoriser', deny: 'Refuser',
    host: 'Une seule adresse', any: 'Toutes les adresses', in: 'Trafic entrant', out: 'Trafic sortant', 'access-lists': 'Afficher les ACL', binding: 'Baux DHCP', mac: 'Adresses MAC', 'address-table': 'Table MAC',
    version: 'Version du système', history: 'Dernières commandes', range: 'Plusieurs interfaces à la fois', 'helper-address': 'Relais DHCP'
  };
  const PHELP = { ip: ['A.B.C.D', 'Adresse IP'], mask: ['A.B.C.D', 'Masque de sous-réseau'], num: ['<nombre>', 'Nombre'], word: ['WORD', 'Texte (un mot)'], rest: ['LINE', 'Texte ou nom d\'interface (ex. g0/0)'] };

  /* ---------- Définition des commandes ---------- */
  const DEFS = [];
  function def(modes, pattern, fn, dev) { DEFS.push({ modes: modes.split(' '), words: pattern.split(' '), fn, dev, sig: pattern }); }
  const TRIES = {};
  function trie(type, mode) {
    const k = type + ':' + mode;
    if (TRIES[k]) return TRIES[k];
    const root = { kw: {}, params: [], def: null };
    DEFS.forEach((D) => {
      if (D.modes.indexOf(mode) === -1 || (D.dev && D.dev !== type)) return;
      let node = root;
      D.words.forEach((w) => {
        const pm = w.match(/^<(\w+)>$/);
        if (pm) {
          let b = node.params.find((x) => x.p === pm[1]);
          if (!b) { b = { p: pm[1], node: { kw: {}, params: [], def: null } }; node.params.push(b); }
          node = b.node;
        } else {
          const kk = w.toLowerCase();
          if (!node.kw[kk]) node.kw[kk] = { kw: {}, params: [], def: null };
          node = node.kw[kk];
        }
      });
      node.def = D;
    });
    TRIES[k] = root;
    return root;
  }
  function param(p, w) {
    if (p === 'ip') { const v = ipToInt(w); return v == null ? undefined : v; }
    if (p === 'mask') { const v = ipToInt(w); return v == null || maskLen(v) < 0 ? undefined : v; }
    if (p === 'num') return /^\d+$/.test(w) ? Number(w) : undefined;
    if (p === 'word') return w;
    return undefined;
  }
  function tokenize(line) { const out = [], re = /\S+/g; let m; while ((m = re.exec(line))) out.push({ w: m[0], i: m.index }); return out; }
  function walk(root, toks, line) {
    let node = root;
    const args = [];
    for (let k = 0; k < toks.length; k++) {
      const w = toks[k].w, lw = w.toLowerCase();
      let next = node.kw[lw];
      if (!next) {
        const c = Object.keys(node.kw).filter((x) => x.indexOf(lw) === 0);
        if (c.length > 1) return { err: 'ambiguous', at: k };
        if (c.length === 1) next = node.kw[c[0]];
      }
      if (next) { node = next; continue; }
      let ok = false;
      for (const b of node.params) {
        if (b.p === 'rest') { args.push(line.slice(toks[k].i).trim()); return { node: b.node, args, rest: true }; }
        const v = param(b.p, w);
        if (v !== undefined) { args.push(v); node = b.node; ok = true; break; }
      }
      if (!ok) return { err: 'invalid', at: k };
    }
    return { node, args };
  }

  function promptOf(d) {
    if (d.type === 'pc') return d.pending ? d.pending.prompt : 'C:\\>';
    if (d.pending && d.pending.prompt != null) return d.pending.prompt;
    return d.cfg.hostname + PROMPT[d.mode];
  }
  const caret = (d, idx) => ' '.repeat(promptOf(d).length + idx) + '^\n% Invalid input detected at \'^\' marker.';
  function ctxOf(sim, d, toks) {
    return {
      sim, d, c: d.cfg, toks,
      invalid: (k) => caret(d, toks.length ? toks[Math.max(0, Math.min(k, toks.length - 1))].i : 0),
      setMode: (m, ctx) => { d.mode = m; d.ctx = ctx || null; }
    };
  }
  const curIfs = (x) => (x.d.ctx && x.d.ctx.ifs) || [];
  function eachIf(x, fn) { const out = []; curIfs(x).forEach((n) => { const r = fn(x.c.ifs[n], n); if (r) out.push(r); }); return out.join('\n'); }
  const bcast = (ip, mask) => (net(ip, mask) | ~mask) >>> 0;
  const sysMsg = '%SYS-5-CONFIG_I: Configured from console by console';

  /* ---------- Exécution ---------- */
  function exec(sim, id, line) {
    const d = sim.devices[id];
    if (d.pending) return pending(sim, d, line);
    const toks = tokenize(line);
    if (!toks.length) return '';
    d.history.push(line.trim());
    if (d.history.length > 60) d.history.shift();
    let r = walk(trie(d.type, d.mode), toks, line);
    if ((r.err || !r.node.def) && SUBS.indexOf(d.mode) !== -1) {
      const r2 = walk(trie(d.type, 'config'), toks, line);
      if (!r2.err && r2.node.def) { d.mode = 'config'; d.ctx = null; r = r2; }
    }
    if (r.err === 'ambiguous') return '% Ambiguous command:  "' + line.trim() + '"';
    if (r.err === 'invalid') {
      if ((d.mode === 'user' || d.mode === 'priv') && toks.length === 1) {
        return (d.cfg.domainLookup ? 'Translating "' + toks[0].w + '"...domain server (255.255.255.255)\n' : '') + '% Unknown command or computer name, or unable to find computer address';
      }
      return caret(d, toks[r.at].i);
    }
    if (!r.node.def) return '% Incomplete command.';
    d.used[r.node.def.sig] = true;
    const out = r.node.def.fn(ctxOf(sim, d, toks), r.args);
    return out == null ? '' : String(out);
  }
  function doExec(x, text) {
    const toks = tokenize(text);
    const r = walk(trie(x.d.type, 'priv'), toks, text);
    if (r.err || !r.node.def) return '% Invalid input detected at \'^\' marker.';
    x.d.used[r.node.def.sig] = true;
    const out = r.node.def.fn(ctxOf(x.sim, x.d, toks), r.args);
    return out == null ? '' : out;
  }
  function pending(sim, d, line) {
    const p = d.pending, ans = line.trim();
    d.pending = null;
    if (p.type === 'enable') {
      const ok = d.cfg.enableSecret ? ans === d.cfg.enableSecret : ans === d.cfg.enablePassword;
      if (ok) { d.mode = 'priv'; return ''; }
      p.tries = (p.tries || 0) + 1;
      if (p.tries >= 3) return '% Bad secrets\n';
      d.pending = p;
      return '';
    }
    if (p.type === 'login') {
      if (ans === d.cfg.lines.con.password) return '';
      d.pending = p;
      return '';
    }
    if (p.type === 'copy') {
      if (ans === '' || ans === 'startup-config') { sim.save(d.id); return 'Building configuration...\n[OK]'; }
      return '%Error opening ' + ans + ' (No such file or directory)';
    }
    if (p.type === 'conf') {
      if (ans === '' || /^t/i.test(ans)) { d.mode = 'config'; return 'Enter configuration commands, one per line.  End with CNTL/Z.'; }
      return '?Must be "terminal", "memory" or "network"';
    }
    if (p.type === 'rsa') return genRsa(d.cfg, ans === '' ? 512 : Number(ans));
    if (p.type === 'erase') {
      if (ans === '' || /^y/i.test(ans)) { d.startup = null; return '[OK]\nErase of nvram: complete'; }
      return '';
    }
    if (p.type === 'reload-save') {
      if (/^y/i.test(ans)) sim.save(d.id);
      else if (!/^n/i.test(ans)) { d.pending = p; return '% Please answer \'yes\' or \'no\'.'; }
      d.pending = { type: 'reload', prompt: 'Proceed with reload? [confirm]' };
      return /^y/i.test(ans) ? 'Building configuration...\n[OK]' : '';
    }
    if (p.type === 'reload') {
      if (!(ans === '' || /^y/i.test(ans))) return '';
      d.cfg = d.startup ? JSON.parse(d.startup) : defaultCfg(d.type);
      d.mode = 'user'; d.ctx = null; d.arp = {};
      return '\n%SYS-5-RELOAD: Reload requested by console. Reload Reason: Reload Command.\n\nSystem Bootstrap... (simulation)\n\nPress RETURN to get started!\n' + (d.cfg.banner ? '\n' + d.cfg.banner + '\n' : '');
    }
    return '';
  }
  function genRsa(c, bits) {
    if (!(bits >= 360 && bits <= 4096)) return '% A decimal number between 360 and 4096.';
    c.rsa = bits;
    return '% Generating ' + bits + ' bit RSA keys, keys will be non-exportable...[OK]\n%SSH-5-ENABLED: SSH 1.99 has been enabled';
  }
  function rsaCheck(c) {
    if (/^(Router|Switch)$/.test(c.hostname)) return '% Please define a hostname other than ' + c.hostname + '.';
    if (!c.domainName) return '% Please define a domain-name first.';
    return null;
  }

  /* ---------- Mode utilisateur et privilégié ---------- */
  function logout(x) {
    const d = x.d, c = d.cfg;
    d.mode = 'user'; d.ctx = null;
    let s = '\n' + c.hostname + ' con0 is now available\n\nPress RETURN to get started.\n' + (c.banner ? '\n' + c.banner + '\n' : '');
    if (c.lines.con.login && c.lines.con.password) { d.pending = { type: 'login', prompt: 'Password: ', secret: true }; s += '\n\nUser Access Verification\n'; }
    return s;
  }
  function pingIOS(sim, d, dst) {
    const r = sim.ping(d.id, dst);
    const head = 'Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ' + ipStr(dst) + ', timeout is 2 seconds:\n';
    let marks, okN;
    if (r.ok) { const first = !d.arp[ipStr(dst)]; d.arp[ipStr(dst)] = 1; marks = first ? '.!!!!' : '!!!!!'; okN = first ? 4 : 5; d.pingOk[ipStr(dst)] = 1; }
    else { marks = r.why === 'acl' || (r.why === 'noroute' && r.from != null) ? 'U.U.U' : '.....'; okN = 0; d.pingFail[ipStr(dst)] = 1; }
    return head + marks + '\nSuccess rate is ' + okN * 20 + ' percent (' + okN + '/5)' + (okN ? ', round-trip min/avg/max = 0/0/1 ms' : '');
  }
  function traceIOS(sim, d, dst) {
    const r = sim.ping(d.id, dst);
    const out = ['Type escape sequence to abort.', 'Tracing the route to ' + ipStr(dst), ''];
    let k = 1;
    (r.hops || []).forEach((h) => out.push('  ' + k++ + ' ' + ipStr(h) + ' 0 msec 0 msec 0 msec'));
    if (r.ok) out.push('  ' + k + ' ' + ipStr(dst) + ' 0 msec 0 msec 0 msec');
    else for (let j = 0; j < 3; j++) out.push('  ' + k++ + '  *    *    *');
    return out.join('\n');
  }
  function version(d) {
    return 'Simulateur RéviCIEL - logiciel de type IOS, version 15.1\n' + d.cfg.hostname + ' uptime is 12 minutes\n\n' +
      (d.type === 'switch' ? 'Commutateur 24 ports FastEthernet + 2 ports GigabitEthernet' : 'Routeur 3 ports GigabitEthernet') + '\nConfiguration register is 0x2102';
  }
  const save = (x) => { x.sim.save(x.d.id); return 'Building configuration...\n[OK]'; };

  def('user', 'enable', (x) => {
    if (x.c.enableSecret || x.c.enablePassword) { x.d.pending = { type: 'enable', prompt: 'Password: ', secret: true }; return ''; }
    x.setMode('priv');
  });
  def('priv', 'enable', () => '');
  def('priv', 'disable', (x) => x.setMode('user'));
  def('user priv', 'exit', logout);
  def('user priv', 'logout', logout);
  def('priv', 'configure terminal', (x) => { x.setMode('config'); return 'Enter configuration commands, one per line.  End with CNTL/Z.'; });
  def('priv', 'configure', (x) => { x.d.pending = { type: 'conf', prompt: 'Configuring from terminal, memory, or network [terminal]? ' }; });
  def('user priv', 'ping <ip>', (x, a) => pingIOS(x.sim, x.d, a[0]));
  def('user priv', 'traceroute <ip>', (x, a) => traceIOS(x.sim, x.d, a[0]));
  def('priv', 'show running-config', (x) => x.sim.runningConfig(x.d.id));
  def('priv', 'show startup-config', (x) => (x.d.startup ? x.sim.runningConfig(x.d.id, true) : 'startup-config is not present'));
  def('user priv', 'show ip interface brief', (x) => x.sim.showIpBrief(x.d.id));
  def('priv', 'show vlan brief', (x) => x.sim.showVlan(x.d.id), 'switch');
  def('priv', 'show vlan', (x) => x.sim.showVlan(x.d.id), 'switch');
  def('priv', 'show interfaces trunk', (x) => x.sim.showTrunk(x.d.id), 'switch');
  def('priv', 'show mac address-table', (x) => x.sim.showMac(x.d.id), 'switch');
  def('user priv', 'show ip route', (x) => x.sim.showRoute(x.d.id), 'router');
  def('priv', 'show ip dhcp binding', (x) => x.sim.showLeases(x.d.id), 'router');
  def('priv', 'show access-lists', (x) => x.sim.showAcl(x.d.id), 'router');
  def('user priv', 'show version', (x) => version(x.d));
  def('user priv', 'show history', (x) => x.d.history.slice(-10).map((h) => '  ' + h).join('\n'));
  def('priv', 'copy running-config startup-config', (x) => { x.d.pending = { type: 'copy', prompt: 'Destination filename [startup-config]? ' }; });
  def('priv', 'write memory', save);
  def('priv', 'write', save);
  def('priv', 'erase startup-config', (x) => { x.d.pending = { type: 'erase', prompt: 'Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]' }; });
  def('priv', 'reload', (x) => {
    x.d.pending = x.sim.saved(x.d.id) ? { type: 'reload', prompt: 'Proceed with reload? [confirm]' } : { type: 'reload-save', prompt: 'System configuration has been modified. Save? [yes/no]:' };
  });
  def('priv', 'terminal length <num>', () => '');

  /* ---------- Configuration globale ---------- */
  const SUBM = SUBS.join(' ');
  def('config', 'exit', (x) => x.setMode('priv'));
  def('config ' + SUBM, 'end', (x) => { x.setMode('priv'); return sysMsg; });
  def(SUBM, 'exit', (x) => x.setMode('config'));
  def('config ' + SUBM, 'do <rest>', (x, a) => doExec(x, a[0]));
  def('config', 'hostname <word>', (x, a) => { x.c.hostname = a[0]; });
  def('config', 'enable secret <word>', (x, a) => { x.c.enableSecret = a[0]; });
  def('config', 'enable password <word>', (x, a) => { x.c.enablePassword = a[0]; });
  def('config', 'no enable secret', (x) => { x.c.enableSecret = null; });
  def('config', 'no enable password', (x) => { x.c.enablePassword = null; });
  def('config', 'service password-encryption', (x) => { x.c.servicePE = true; });
  def('config', 'no service password-encryption', (x) => { x.c.servicePE = false; });
  def('config', 'banner motd <rest>', (x, a) => {
    const s = a[0], dl = s[0], end = s.indexOf(dl, 1);
    x.c.banner = (end > 0 ? s.slice(1, end) : s.slice(1)).trim() || null;
  });
  def('config', 'no banner motd', (x) => { x.c.banner = null; });
  def('config', 'no ip domain-lookup', (x) => { x.c.domainLookup = false; });
  def('config', 'ip domain-lookup', (x) => { x.c.domainLookup = true; });
  def('config', 'ip domain-name <word>', (x, a) => { x.c.domainName = a[0]; });
  def('config', 'ip domain name <word>', (x, a) => { x.c.domainName = a[0]; });
  def('config', 'username <word> secret <word>', (x, a) => { x.c.users[a[0]] = { secret: a[1] }; });
  def('config', 'username <word> password <word>', (x, a) => { x.c.users[a[0]] = { password: a[1] }; });
  def('config', 'username <word> privilege <num> secret <word>', (x, a) => { x.c.users[a[0]] = { priv: a[1], secret: a[2] }; });
  def('config', 'username <word> privilege <num> password <word>', (x, a) => { x.c.users[a[0]] = { priv: a[1], password: a[2] }; });
  def('config', 'no username <word>', (x, a) => { delete x.c.users[a[0]]; });
  def('config', 'crypto key generate rsa', (x) => {
    const err = rsaCheck(x.c);
    if (err) return err;
    x.d.pending = { type: 'rsa', prompt: 'How many bits in the modulus [512]: ' };
    return 'The name for the keys will be: ' + x.c.hostname + '.' + x.c.domainName + '\nChoose the size of the key modulus in the range of 360 to 4096 for your\n  General Purpose Keys. Choosing a key modulus greater than 512 may take\n  a few minutes.\n';
  });
  def('config', 'crypto key generate rsa general-keys modulus <num>', (x, a) => rsaCheck(x.c) || genRsa(x.c, a[0]));
  def('config', 'ip ssh version <num>', (x, a) => {
    if (a[0] !== 1 && a[0] !== 2) return x.invalid(3);
    if (!x.c.rsa || (a[0] === 2 && x.c.rsa < 768)) return 'Please create RSA keys (of atleast 768 bits size) to enable SSH v2.';
    x.c.sshVersion = a[0];
  });
  def('config', 'spanning-tree mode <word>', () => '');
  def('config', 'no cdp run', () => '');
  def('config', 'cdp run', () => '');
  def('config', 'ip routing', () => '', 'router');

  /* interfaces */
  def('config', 'interface <rest>', (x, a) => {
    const n = normIf(a[0]), c = x.c;
    if (!n) return x.invalid(1);
    if (!c.ifs[n]) {
      if (n.indexOf('.') !== -1 && x.d.type === 'router' && c.ifs[n.split('.')[0]]) c.ifs[n] = newIf(false);
      else if (n.indexOf('Vlan') === 0 && x.d.type === 'switch' && Number(n.slice(4)) >= 1 && Number(n.slice(4)) <= 4094) c.ifs[n] = newIf(false);
      else return x.invalid(1);
    }
    x.setMode(n.indexOf('.') !== -1 ? 'subif' : 'if', { ifs: [n] });
  });
  def('config', 'interface range <rest>', (x, a) => {
    const list = [];
    for (const part of a[0].split(',')) {
      const m = part.replace(/\s+/g, '').match(/^([a-z]+)(\d+\/)(\d+)(?:-(\d+))?$/i);
      const base = m && normIf(m[1] + m[2] + m[3]);
      if (!base) return x.invalid(2);
      const prefix = base.replace(/\d+$/, ''), from = Number(m[3]), to = m[4] ? Number(m[4]) : from;
      if (to < from) return x.invalid(2);
      for (let k = from; k <= to; k++) { if (!x.c.ifs[prefix + k]) return x.invalid(2); list.push(prefix + k); }
    }
    x.setMode('range', { ifs: list });
  });
  def('config', 'no interface <rest>', (x, a) => {
    const n = normIf(a[0]);
    if (!n || n.indexOf('.') === -1 || !x.c.ifs[n]) return x.invalid(2);
    delete x.c.ifs[n];
  }, 'router');

  /* VLAN */
  def('config', 'vlan <num>', (x, a) => {
    const v = a[0];
    if (v < 1 || v > 4094 || (v >= 1002 && v <= 1005)) return x.invalid(1);
    if (!(v in x.c.vlans)) x.c.vlans[v] = 'VLAN' + String(v).padStart(4, '0');
    x.setMode('vlan', { vlan: v });
  }, 'switch');
  def('config', 'no vlan <num>', (x, a) => { if (a[0] === 1) return '%Default VLAN 1 may not be deleted.'; delete x.c.vlans[a[0]]; }, 'switch');
  def('vlan', 'name <word>', (x, a) => { x.c.vlans[x.d.ctx.vlan] = a[0]; }, 'switch');
  def('config', 'ip default-gateway <ip>', (x, a) => { x.c.gateway = a[0]; }, 'switch');
  def('config', 'no ip default-gateway', (x) => { x.c.gateway = null; }, 'switch');

  /* routes statiques */
  function addRoute(x, ip, mask, nh, ifn) {
    if (net(ip, mask) !== ip) return '%Inconsistent address and mask';
    x.c.routes = x.c.routes.filter((r) => !(r.net === ip && r.mask === mask && r.nh === nh && r.ifn === ifn));
    x.c.routes.push({ net: ip, mask, nh, ifn });
  }
  def('config', 'ip route <ip> <mask> <ip>', (x, a) => addRoute(x, a[0], a[1], a[2], null), 'router');
  def('config', 'ip route <ip> <mask> <rest>', (x, a) => {
    const n = normIf(a[2]);
    if (!n || !x.c.ifs[n]) return x.invalid(4);
    return addRoute(x, a[0], a[1], null, n);
  }, 'router');
  def('config', 'no ip route <ip> <mask>', (x, a) => { x.c.routes = x.c.routes.filter((r) => !(r.net === a[0] && r.mask === a[1])); }, 'router');
  def('config', 'no ip route <ip> <mask> <ip>', (x, a) => { x.c.routes = x.c.routes.filter((r) => !(r.net === a[0] && r.mask === a[1] && r.nh === a[2])); }, 'router');
  def('config', 'no ip route <ip> <mask> <rest>', (x, a) => { x.c.routes = x.c.routes.filter((r) => !(r.net === a[0] && r.mask === a[1])); }, 'router');

  /* DHCP */
  const pool = (x) => x.c.pools[x.d.ctx.pool];
  def('config', 'ip dhcp excluded-address <ip>', (x, a) => { x.c.excluded.push([a[0], a[0]]); }, 'router');
  def('config', 'ip dhcp excluded-address <ip> <ip>', (x, a) => { if (a[1] < a[0]) return x.invalid(4); x.c.excluded.push([a[0], a[1]]); }, 'router');
  def('config', 'ip dhcp pool <word>', (x, a) => {
    if (!x.c.pools[a[0]]) x.c.pools[a[0]] = { network: null, mask: null, router: null, dns: null };
    x.setMode('dhcp', { pool: a[0] });
  }, 'router');
  def('config', 'no ip dhcp pool <word>', (x, a) => { delete x.c.pools[a[0]]; }, 'router');
  def('dhcp', 'network <ip> <mask>', (x, a) => { const p = pool(x); p.network = net(a[0], a[1]); p.mask = a[1]; }, 'router');
  def('dhcp', 'default-router <ip>', (x, a) => { pool(x).router = a[0]; }, 'router');
  def('dhcp', 'dns-server <ip>', (x, a) => { pool(x).dns = a[0]; }, 'router');

  /* ACL standard */
  function addAce(x, n, action, src, wild) {
    if (n < 1 || n > 99) return '% Ce simulateur gère les ACL standard (numéros 1 à 99).';
    (x.c.acls[n] = x.c.acls[n] || []).push({ action, src: (src & ~wild) >>> 0, wild });
  }
  ['permit', 'deny'].forEach((act) => {
    def('config', 'access-list <num> ' + act + ' host <ip>', (x, a) => addAce(x, a[0], act, a[1], 0), 'router');
    def('config', 'access-list <num> ' + act + ' any', (x, a) => addAce(x, a[0], act, 0, 0xFFFFFFFF), 'router');
    def('config', 'access-list <num> ' + act + ' <ip> <ip>', (x, a) => addAce(x, a[0], act, a[1], a[2]), 'router');
    def('config', 'access-list <num> ' + act + ' <ip>', (x, a) => addAce(x, a[0], act, a[1], 0), 'router');
  });
  def('config', 'no access-list <num>', (x, a) => { delete x.c.acls[a[0]]; }, 'router');

  /* lignes console et vty */
  const ln = (x) => x.c.lines[x.d.ctx.line];
  def('config', 'line console <num>', (x) => x.setMode('line', { line: 'con' }));
  def('config', 'line vty <num> <num>', (x) => x.setMode('line', { line: 'vty' }));
  def('config', 'line vty <num>', (x) => x.setMode('line', { line: 'vty' }));
  def('line', 'password <word>', (x, a) => { ln(x).password = a[0]; });
  def('line', 'no password', (x) => { ln(x).password = null; });
  def('line', 'login', (x) => {
    const l = ln(x);
    l.login = true; l.local = false;
    if (!l.password) return '% Login disabled on line ' + (x.d.ctx.line === 'con' ? '0' : '1') + ', until \'password\' is set';
  });
  def('line', 'login local', (x) => { const l = ln(x); l.login = true; l.local = true; });
  def('line', 'no login', (x) => { const l = ln(x); l.login = false; l.local = false; });
  ['ssh', 'telnet', 'all', 'none', 'telnet ssh', 'ssh telnet'].forEach((t) => def('line', 'transport input ' + t, (x) => { ln(x).transport = t === 'ssh telnet' ? 'telnet ssh' : t; }));
  def('line', 'exec-timeout <num> <num>', () => '');
  def('line', 'exec-timeout <num>', () => '');
  def('line', 'logging synchronous', () => '');

  /* ---------- Mode interface ---------- */
  const IFM = 'if subif range';
  function linkMsg(sim, d, n, wasUp) {
    const up = sim.ifUp(d.id, n);
    if (up === wasUp) return '';
    if (up) return '%LINK-5-CHANGED: Interface ' + n + ', changed state to up\n\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ' + n + ', changed state to up';
    return '%LINK-5-CHANGED: Interface ' + n + ', changed state to ' + (d.cfg.ifs[n].shutdown ? 'administratively down' : 'down') + '\n\n%LINEPROTO-5-UPDOWN: Line protocol on Interface ' + n + ', changed state to down';
  }
  function setShut(x, val) {
    const msgs = [];
    curIfs(x).forEach((n) => {
      const was = x.sim.ifUp(x.d.id, n);
      x.c.ifs[n].shutdown = val;
      const m = linkMsg(x.sim, x.d, n, was);
      if (m) msgs.push(m);
    });
    return msgs.join('\n\n');
  }
  const l2only = (x) => (curIfs(x).some((n) => n.indexOf('Vlan') === 0) ? x.invalid(0) : null);
  function parseVl(s) {
    const out = [];
    for (const part of s.split(',')) {
      const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
      if (!m) return null;
      const a = Number(m[1]), b = m[2] ? Number(m[2]) : a;
      if (b < a || b > 4094) return null;
      for (let k = a; k <= b; k++) if (out.indexOf(k) === -1) out.push(k);
    }
    return out;
  }
  def(IFM, 'ip address <ip> <mask>', (x, a) => {
    const names = curIfs(x), [ip, mask] = a;
    if (names.length !== 1) return x.invalid(0);
    const n = names[0], c = x.c, i = c.ifs[n];
    if (x.d.type === 'switch' && n.indexOf('Vlan') !== 0) return x.invalid(0);
    const len = maskLen(mask);
    if (len < 31 && (ip === net(ip, mask) || ip === bcast(ip, mask))) return 'Bad mask /' + len + ' for address ' + ipStr(ip);
    if (n.indexOf('.') !== -1 && i.encap == null) return '\n% Configuring IP routing on a LAN subinterface is only allowed if that\nsubinterface is already configured as part of an IEEE 802.10, IEEE 802.1Q,\nor ISL vLAN.\n';
    for (const o of Object.keys(c.ifs)) {
      const oi = c.ifs[o];
      if (o !== n && oi.ip != null && (same(oi.ip, ip, mask) || same(oi.ip, ip, oi.mask))) return '% ' + ipStr(net(ip, mask)) + ' overlaps with ' + o;
    }
    i.ip = ip; i.mask = mask;
  });
  def(IFM, 'no ip address', (x) => eachIf(x, (i) => { i.ip = null; i.mask = null; }));
  def(IFM, 'shutdown', (x) => setShut(x, true));
  def(IFM, 'no shutdown', (x) => setShut(x, false));
  def(IFM, 'description <rest>', (x, a) => eachIf(x, (i) => { i.desc = a[0]; }));
  def(IFM, 'no description', (x) => eachIf(x, (i) => { i.desc = null; }));
  def(IFM, 'switchport mode access', (x) => l2only(x) || eachIf(x, (i) => { i.mode = 'access'; i.modeSet = true; }), 'switch');
  def(IFM, 'switchport mode trunk', (x) => l2only(x) || eachIf(x, (i) => { i.mode = 'trunk'; i.modeSet = true; }), 'switch');
  def(IFM, 'switchport access vlan <num>', (x, a) => {
    const v = a[0];
    if (l2only(x)) return l2only(x);
    if (v < 1 || v > 4094) return x.invalid(3);
    let msg = '';
    if (!(v in x.c.vlans)) { x.c.vlans[v] = 'VLAN' + String(v).padStart(4, '0'); msg = '% Access VLAN does not exist. Creating vlan ' + v; }
    eachIf(x, (i) => { i.vlan = v; });
    return msg;
  }, 'switch');
  def(IFM, 'no switchport access vlan', (x) => eachIf(x, (i) => { i.vlan = 1; }), 'switch');
  def(IFM, 'switchport trunk native vlan <num>', (x, a) => l2only(x) || eachIf(x, (i) => { i.native = a[0]; }), 'switch');
  def(IFM, 'switchport trunk allowed vlan <rest>', (x, a) => {
    if (l2only(x)) return l2only(x);
    const s = a[0].trim().toLowerCase();
    let m = s.match(/^(add|remove|except)\s+(.+)$/);
    const list = parseVl(m ? m[2] : s);
    if (s !== 'all' && s !== 'none' && !list) return x.invalid(4);
    eachIf(x, (i) => {
      const all = () => { const r = []; for (let k = 1; k <= 4094; k++) r.push(k); return r; };
      if (s === 'all') i.allowed = null;
      else if (s === 'none') i.allowed = [];
      else if (!m) i.allowed = list;
      else if (m[1] === 'add') { if (i.allowed) list.forEach((v) => { if (i.allowed.indexOf(v) === -1) i.allowed.push(v); }); }
      else if (m[1] === 'remove') i.allowed = (i.allowed || all()).filter((v) => list.indexOf(v) === -1);
      else i.allowed = all().filter((v) => list.indexOf(v) === -1);
    });
  }, 'switch');
  def(IFM, 'switchport nonegotiate', () => '', 'switch');
  def(IFM, 'switchport port-security', () => '', 'switch');
  function encap(x, v, nat) {
    if (x.d.mode !== 'subif' || v < 1 || v > 4094) return x.invalid(0);
    eachIf(x, (i) => { i.encap = v; i.encapNative = nat; });
  }
  def(IFM, 'encapsulation dot1q <num>', (x, a) => encap(x, a[0], false), 'router');
  def(IFM, 'encapsulation dot1q <num> native', (x, a) => encap(x, a[0], true), 'router');
  def(IFM, 'ip access-group <num> in', (x, a) => eachIf(x, (i) => { i.aclIn = a[0]; }), 'router');
  def(IFM, 'ip access-group <num> out', (x, a) => eachIf(x, (i) => { i.aclOut = a[0]; }), 'router');
  def(IFM, 'no ip access-group <num> in', (x) => eachIf(x, (i) => { i.aclIn = null; }), 'router');
  def(IFM, 'no ip access-group <num> out', (x) => eachIf(x, (i) => { i.aclOut = null; }), 'router');
  def(IFM, 'ip helper-address <ip>', (x, a) => eachIf(x, (i) => { i.helper = a[0]; }), 'router');
  def(IFM, 'speed <word>', () => '');
  def(IFM, 'duplex <word>', () => '');

  /* ---------- Aide « ? » et complétion ---------- */
  const pad = (s, n) => { s = String(s); return s.length >= n ? s + ' ' : s + ' '.repeat(n - s.length); };
  /* « do show … » dans un mode de configuration : l'aide et la complétion suivent le mode privilégié */
  function viaDo(d, text) {
    if (d.mode === 'user' || d.mode === 'priv') return null;
    const m = text.match(/^\s*do\s+/i);
    return m ? { mode: 'priv', text: text.slice(m[0].length), offset: m[0].length } : null;
  }
  function locate(d, toks, line, mode) {
    mode = mode || d.mode;
    let r = walk(trie(d.type, mode), toks, line);
    if ((r.err || r.rest) && SUBS.indexOf(mode) !== -1) {
      const r2 = walk(trie(d.type, 'config'), toks, line);
      if (!r2.err) r = r2;
    }
    return r;
  }
  function help(sim, id, before) {
    const d = sim.devices[id];
    if (d.type === 'pc') return pcHelp();
    if (d.pending) return '';
    d.used['?'] = true;
    const dd = viaDo(d, before);
    if (dd) before = dd.text;
    const endsSpace = before === '' || /\s$/.test(before);
    const toks = tokenize(before);
    const lead = endsSpace ? toks : toks.slice(0, -1);
    const partial = endsSpace ? '' : toks[toks.length - 1].w.toLowerCase();
    const r = locate(d, lead, before, dd && dd.mode);
    if (r.err) return '% Unrecognized command';
    if (r.rest) return '  LINE    <cr>';
    const node = r.node;
    let kws = Object.keys(node.kw).filter((k) => k.indexOf(partial) === 0).sort();
    if (!lead.length && SUBS.indexOf(d.mode) !== -1 && endsSpace) kws = kws.filter((k) => k !== 'do').concat(['do']);
    if (!endsSpace) return kws.length ? kws.join('  ') : '% Unrecognized command';
    const rows = kws.map((k) => '  ' + pad(k, 22) + (HELP[k] || ''));
    node.params.forEach((b) => rows.push('  ' + pad(PHELP[b.p][0], 22) + PHELP[b.p][1]));
    if (node.def) rows.push('  <cr>');
    return rows.join('\n') || '% Unrecognized command';
  }
  function complete(sim, id, line) {
    const d = sim.devices[id];
    if (d.type === 'pc' || d.pending || !line || /\s$/.test(line)) return line;
    const dd = viaDo(d, line);
    const text = dd ? dd.text : line, off = dd ? dd.offset : 0;
    if (!text) return line;
    const toks = tokenize(text), last = toks[toks.length - 1];
    const r = locate(d, toks.slice(0, -1), text, dd && dd.mode);
    if (r.err || r.rest) return line;
    const c = Object.keys(r.node.kw).filter((k) => k.indexOf(last.w.toLowerCase()) === 0);
    return c.length === 1 ? line.slice(0, off + last.i) + c[0] + ' ' : line;
  }
  function ctrlZ(sim, id) {
    const d = sim.devices[id];
    if (d.type === 'pc' || d.pending) return '';
    if (d.mode === 'user' || d.mode === 'priv') return '';
    d.mode = 'priv'; d.ctx = null;
    return sysMsg;
  }
  function boot(sim, id) {
    const d = sim.devices[id];
    if (d.type === 'pc') return 'Invite de commandes du PC ' + d.label + ' (simulation)\nTape « help » pour la liste des commandes.\n';
    return '\nPress RETURN to get started!\n\n' + (d.cfg.banner ? d.cfg.banner + '\n\n' : '');
  }
  /* Configuration initiale d'un lab (commandes tapées en mode configuration) */
  function runSetup(sim, id, cmds) {
    const d = sim.devices[id];
    d.mode = 'config'; d.ctx = null;
    cmds.forEach((c) => exec(sim, id, c));
    d.mode = 'user'; d.ctx = null; d.pending = null; d.used = {}; d.history = []; d.arp = {};
    sim.save(id);
  }

  /* ---------- Invite de commandes du PC ---------- */
  function pcHelp() {
    return 'Commandes disponibles :\n  ipconfig            afficher la configuration IP\n  ipconfig /all       configuration détaillée (MAC, DHCP, DNS)\n  ipconfig /renew     demander une adresse au serveur DHCP\n  ipconfig /release   libérer l\'adresse DHCP\n  ping <adresse>      tester la connexion\n  tracert <adresse>   afficher les routeurs traversés\n  ssh -l <compte> <adresse>   connexion SSH\n  telnet <adresse>    connexion Telnet\n  cls                 effacer l\'écran';
  }
  const macDash = (m) => m.replace(/\./g, '').match(/.{2}/g).join('-');
  function ipconfig(sim, d, all) {
    const p = d.pc, up = sim.ifUp(d.id);
    const out = ['', 'Configuration IP de Windows', '', 'Carte Ethernet Ethernet :', ''];
    if (!up) out.push('   Statut du média. . . . . . . . . . . . : Média déconnecté');
    if (all) out.push('   Adresse physique . . . . . . . . . . . : ' + macDash(d.mac), '   DHCP activé. . . . . . . . . . . . . . : ' + (p.dhcp ? 'Oui' : 'Non'));
    if (up) {
      out.push('   Adresse IPv4. . . . . . . . . . . . . .: ' + (p.ip != null ? ipStr(p.ip) : '0.0.0.0'));
      out.push('   Masque de sous-réseau. . . . . . . . . : ' + (p.mask != null ? ipStr(p.mask) : '0.0.0.0'));
      out.push('   Passerelle par défaut. . . . . . . . . : ' + (p.gw != null ? ipStr(p.gw) : ''));
      if (all) out.push('   Serveurs DNS. . . . . . . . . . . . . .: ' + (p.dns != null ? ipStr(p.dns) : ''));
    }
    return out.join('\n');
  }
  function dhcpApply(sim, d) {
    const r = sim.dhcp(d.id);
    const p = d.pc;
    if (r && !r.full) { p.ip = r.ip; p.mask = r.mask; p.gw = r.gw; p.dns = r.dns; return { ok: true, server: r.server }; }
    const h = parseInt(d.mac.replace(/\./g, '').slice(-4), 16);
    p.ip = ipToInt('169.254.' + ((h >> 8) % 254 + 1) + '.' + ((h & 255) % 254 + 1)); p.mask = ipToInt('255.255.0.0'); p.gw = null; p.dns = null;
    return { ok: false, full: r && r.full };
  }
  function pcPing(sim, d, dst) {
    const s = ipStr(dst);
    const head = 'Envoi d\'une requête \'Ping\'  ' + s + ' avec 32 octets de données :';
    const r = sim.ping(d.id, dst);
    let line, rec;
    if (r.ok) { line = 'Réponse de ' + s + ' : octets=32 temps<1ms TTL=' + ((sim.devices[r.owner].type === 'pc' ? 128 : 255) - r.hops.length); rec = 4; d.pingOk[s] = 1; }
    else if ((r.why === 'noroute' || r.why === 'acl') && r.from != null) { line = 'Réponse de ' + ipStr(r.from) + ' : Impossible de joindre l\'hôte de destination.'; rec = 4; d.pingFail[s] = 1; }
    else if (r.why === 'noip' || r.why === 'nogw') { line = 'Échec de la transmission. Défaillance générale.'; rec = 0; d.pingFail[s] = 1; }
    else { line = 'Délai d\'attente de la demande dépassé.'; rec = 0; d.pingFail[s] = 1; }
    const lost = 4 - rec;
    let st = 'Statistiques Ping pour ' + s + ':\n    Paquets : envoyés = 4, reçus = ' + rec + ', perdus = ' + lost + ' (perte ' + lost * 25 + '%),';
    if (rec) st += '\nDurée approximative des boucles en millisecondes :\n    Minimum = 0ms, Maximum = 1ms, Moyenne = 0ms';
    return head + '\n' + Array(4).fill(line).join('\n') + '\n\n' + st;
  }
  function pcTrace(sim, d, dst) {
    const r = sim.ping(d.id, dst);
    if (!r.ok && (r.why === 'noip' || r.why === 'nogw')) return 'Échec de la transmission. Défaillance générale.';
    const out = ['', 'Détermination de l\'itinéraire vers ' + ipStr(dst) + ' avec un maximum de 30 sauts.', ''];
    let k = 1;
    const row = (ip) => '  ' + k++ + '    <1 ms    <1 ms    <1 ms  ' + ip;
    (r.hops || []).forEach((h) => out.push(row(ipStr(h))));
    if (r.ok) out.push(row(ipStr(dst)));
    else for (let j = 0; j < 3; j++) out.push('  ' + k++ + '     *        *        *     Délai d\'attente de la demande dépassé.');
    out.push('', 'Itinéraire déterminé.');
    return out.join('\n');
  }
  function remote(sim, d, ip, proto, user) {
    const r = sim.ping(d.id, ip);
    if (!r.ok) return 'Trying ' + ipStr(ip) + ' ...\n% Connection timed out; remote host not responding';
    const dev = sim.devices[r.owner];
    if (dev.type === 'pc') return '% Connection refused by remote host';
    const v = dev.cfg.lines.vty, t = v.transport || 'all';
    if ((t !== 'all' && t.indexOf(proto) === -1) || (proto === 'ssh' && !dev.cfg.rsa)) return '% Connection refused by remote host';
    if (!v.login) return 'Password required, but none set\n\n[Connection to ' + ipStr(ip) + ' closed by foreign host]';
    d.pending = { type: 'remote', prompt: 'Password: ', secret: true, target: dev.id, user, proto };
    return proto === 'telnet' ? 'Trying ' + ipStr(ip) + ' ...Open\n' + (dev.cfg.banner ? dev.cfg.banner + '\n' : '') + '\nUser Access Verification\n' : '';
  }
  function pcExec(sim, id, line) {
    const d = sim.devices[id];
    if (d.pending) {
      const p = d.pending;
      d.pending = null;
      const dev = sim.devices[p.target], v = dev.cfg.lines.vty, ans = line.trim();
      const u = dev.cfg.users[p.user];
      const ok = v.local ? !!u && (u.secret || u.password) === ans : v.password === ans;
      if (!ok) return '% Login invalid\n\n[Connection to ' + dev.cfg.hostname + ' closed by foreign host]';
      d.used[p.proto + '-ok'] = 1;
      return '\n' + dev.cfg.hostname + '>\n(Connexion ' + p.proto.toUpperCase() + ' réussie vers ' + dev.cfg.hostname + ' — dans ce simulateur, la session se referme aussitôt.)\n[Connection to ' + dev.cfg.hostname + ' closed by foreign host]';
    }
    const t = line.trim();
    if (!t) return '';
    d.history.push(t);
    if (d.history.length > 60) d.history.shift();
    const w = t.split(/\s+/), cmd = w[0].toLowerCase();
    d.used['pc:' + cmd] = 1;
    const ipArg = () => { const x = w.slice(1).find((s) => ipToInt(s) != null); return x ? ipToInt(x) : null; };
    if (cmd === 'ipconfig') {
      const o = (w[1] || '').toLowerCase();
      if (!o) return ipconfig(sim, d, false);
      if (o === '/all') return ipconfig(sim, d, true);
      if (o === '/release') { if (!d.pc.dhcp) return 'La carte n\'est pas en DHCP.'; sim.release(id); d.pc.ip = null; d.pc.mask = null; d.pc.gw = null; return ipconfig(sim, d, false); }
      if (o === '/renew') {
        if (!d.pc.dhcp) return 'La carte n\'est pas en DHCP : choisis « DHCP » dans la configuration IP du PC.';
        const r = dhcpApply(sim, d);
        return (r.ok ? '' : 'Une erreur s\'est produite lors du renouvellement de l\'interface Ethernet :\nimpossible de contacter votre serveur DHCP. Le délai d\'attente de la demande a expiré.\n') + ipconfig(sim, d, false);
      }
      return 'Erreur : option non reconnue « ' + w[1] + ' ».';
    }
    if (cmd === 'ping') { const ip = ipArg(); return ip == null ? 'La requête Ping n\'a pas pu trouver l\'hôte ' + (w[1] || '') + '. Vérifiez le nom et essayez à nouveau.' : pcPing(sim, d, ip); }
    if (cmd === 'tracert') { const ip = ipArg(); return ip == null ? 'Impossible de résoudre le nom du système cible ' + (w[1] || '') + '.' : pcTrace(sim, d, ip); }
    if (cmd === 'ssh') {
      let user = null, ip = null;
      for (let k = 1; k < w.length; k++) { if (w[k] === '-l') user = w[++k]; else if (ipToInt(w[k]) != null) ip = ipToInt(w[k]); }
      if (!user || ip == null) return 'Utilisation : ssh -l <compte> <adresse IP>';
      return remote(sim, d, ip, 'ssh', user);
    }
    if (cmd === 'telnet') { const ip = ipArg(); return ip == null ? 'Utilisation : telnet <adresse IP>' : remote(sim, d, ip, 'telnet', null); }
    if (cmd === 'help' || cmd === '?') return pcHelp();
    if (cmd === 'cls') return '\f';
    return '\'' + w[0] + '\' n\'est pas reconnu en tant que commande interne\nou externe, un programme exécutable ou un fichier de commandes.';
  }

  global.NetCLI = {
    exec, pcExec, help, complete, ctrlZ, boot, runSetup, promptOf, dhcpApply,
    isSecret: (d) => !!(d.pending && d.pending.secret)
  };
})(window);
