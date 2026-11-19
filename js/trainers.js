/* RéviCIEL — générateurs d'exercices (infinis, corrigés pas à pas) */
(function (global) {
  'use strict';
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fr = (x, d = 3) => {
    const r = Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
    return String(r).replace('.', ',');
  };
  const spaced = (s, n = 4) => s.replace(new RegExp('(.{' + n + '})(?=.)', 'g'), '$1 ');
  const cleanNum = (s) => String(s).trim().replace(/\s+/g, '').replace(',', '.');
  function parseNum(s) {
    const v = parseFloat(cleanNum(s).replace(/[^\d.eE+-]/g, ''));
    return isFinite(v) ? v : NaN;
  }
  const close = (a, b, tol = 0.02) => isFinite(a) && Math.abs(a - b) <= Math.max(Math.abs(b) * tol, 1e-9);

  /* ---------- 1. Conversions binaire / décimal / hexadécimal ---------- */
  function bitsTable(n) {
    const b = n.toString(2).padStart(8, '0');
    const w = [128, 64, 32, 16, 8, 4, 2, 1];
    return '<div class="bits">' + w.map((x) => '<div class="muted">' + x + '</div>').join('') +
      b.split('').map((c) => '<div class="' + (c === '1' ? 'on' : '') + '">' + c + '</div>').join('') + '</div>';
  }
  function decompose(n) {
    const w = [128, 64, 32, 16, 8, 4, 2, 1].filter((x) => n & x);
    return w.length ? w.join(' + ') : '0';
  }
  const conversions = {
    id: 'conversions', title: 'Binaire, décimal, hexadécimal', icon: 'binary', color: '#4f46e5', subject: 'info',
    desc: 'Convertis des octets entre les trois bases, comme pour les adresses IP et MAC.',
    generate() {
      const n = rnd(0, 255);
      const mode = pick(['d2b', 'b2d', 'd2h', 'h2d', 'b2h', 'h2b']);
      const bin = n.toString(2).padStart(8, '0'), hex = n.toString(16).toUpperCase().padStart(2, '0');
      const hi = n >> 4, lo = n & 15;
      const L = {
        d2b: ['Convertis en <b>binaire</b> (8 bits) :', String(n), 'ex. 0110 1010'],
        b2d: ['Convertis en <b>décimal</b> :', spaced(bin), 'ex. 106'],
        d2h: ['Convertis en <b>hexadécimal</b> :', String(n), 'ex. 6A'],
        h2d: ['Convertis en <b>décimal</b> :', '0x' + hex, 'ex. 106'],
        b2h: ['Convertis en <b>hexadécimal</b> :', spaced(bin), 'ex. 6A'],
        h2b: ['Convertis en <b>binaire</b> (8 bits) :', '0x' + hex, 'ex. 0110 1010']
      }[mode];
      const steps = [];
      if (mode === 'd2b' || mode === 'b2d') {
        steps.push('Poids des bits d\'un octet : 128, 64, 32, 16, 8, 4, 2, 1.');
        steps.push(n + ' = ' + decompose(n) + ' → bits à 1 aux positions de ces poids.');
        steps.push('Résultat : <code>' + spaced(bin) + '</code> = <code>' + n + '</code>');
      } else if (mode === 'd2h' || mode === 'h2d') {
        steps.push('En hexadécimal, chaque chiffre vaut 0 à 15 (A=10, B=11, C=12, D=13, E=14, F=15).');
        steps.push(n + ' = ' + hi + ' × 16 + ' + lo + ' → chiffres ' + hi.toString(16).toUpperCase() + ' et ' + lo.toString(16).toUpperCase() + '.');
        steps.push('Résultat : <code>0x' + hex + '</code> = <code>' + n + '</code>');
      } else {
        steps.push('Un chiffre hexadécimal = 4 bits (un quartet). On découpe l\'octet en deux quartets.');
        steps.push('<code>' + bin.slice(0, 4) + '</code> = ' + hi + ' = ' + hi.toString(16).toUpperCase() + ' ; <code>' + bin.slice(4) + '</code> = ' + lo + ' = ' + lo.toString(16).toUpperCase() + '.');
        steps.push('Résultat : <code>' + spaced(bin) + '</code> = <code>0x' + hex + '</code>');
      }
      const target = mode.endsWith('2b') ? 'b' : mode.endsWith('2h') ? 'h' : 'd';
      return {
        question: L[0], value: L[1], placeholder: L[2],
        extra: mode === 'd2b' || mode === 'b2d' ? bitsTable(n) : '',
        answer: target === 'b' ? spaced(bin) : target === 'h' ? hex : String(n),
        steps,
        check(input) {
          const s = String(input).trim().replace(/\s+/g, '');
          if (target === 'b') return /^[01]{1,8}$/.test(s) && parseInt(s, 2) === n;
          if (target === 'h') return /^(0x)?[0-9a-f]{1,2}h?$/i.test(s) && parseInt(s.replace(/^0x/i, '').replace(/h$/i, ''), 16) === n;
          return /^\d+$/.test(s) && parseInt(s, 10) === n;
        }
      };
    }
  };

  /* ---------- 2. Adressage IPv4 ---------- */
  const ipStr = (x) => [x >>> 24, (x >>> 16) & 255, (x >>> 8) & 255, x & 255].join('.');
  function parseIp(s) {
    const m = String(s).trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!m) return null;
    const p = m.slice(1).map(Number);
    if (p.some((x) => x > 255)) return null;
    return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
  }
  const ipv4 = {
    id: 'ipv4', title: 'Adressage IPv4', icon: 'network', color: '#0284c7', subject: 'reseaux',
    desc: 'Adresse réseau, broadcast, masque, nombre d\'hôtes : la méthode du « nombre magique ».',
    generate() {
      const cidr = pick([8, 16, 20, 22, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 30]);
      const base = pick([[192, 168, rnd(0, 255)], [10, rnd(0, 255), rnd(0, 255)], [172, rnd(16, 31), rnd(0, 255)]]);
      const ip = (((base[0] << 24) >>> 0) + (base[1] << 16) + (base[2] << 8) + rnd(1, 254)) >>> 0;
      const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
      const net = (ip & mask) >>> 0, bc = (net | (~mask >>> 0)) >>> 0;
      const hosts = Math.pow(2, 32 - cidr) - 2;
      const boundary = cidr % 8 === 0;
      const octet = boundary ? cidr / 8 - 1 : Math.floor(cidr / 8);
      const maskOct = (mask >>> (24 - 8 * octet)) & 255;
      const magic = 256 - maskOct;
      const ipOct = (ip >>> (24 - 8 * octet)) & 255;
      const blockStart = Math.floor(ipOct / magic) * magic;
      const kind = pick(['net', 'net', 'bc', 'bc', 'hosts', 'mask', 'first', 'last']);
      const Q = {
        net: ['Quelle est l\'<b>adresse du réseau</b> ?', ipStr(net)],
        bc: ['Quelle est l\'<b>adresse de diffusion (broadcast)</b> ?', ipStr(bc)],
        hosts: ['Combien d\'<b>hôtes</b> (machines) peut-on adresser dans ce réseau ?', String(hosts)],
        mask: ['Écris le <b>masque</b> en notation décimale pointée.', ipStr(mask)],
        first: ['Quelle est la <b>première adresse utilisable</b> ?', ipStr(net + 1)],
        last: ['Quelle est la <b>dernière adresse utilisable</b> ?', ipStr(bc - 1)]
      }[kind];
      const oct = ['1er', '2e', '3e', '4e'][octet];
      const steps = [
        '/' + cidr + ' → ' + cidr + ' bits à 1 → masque <code>' + ipStr(mask) + '</code>.'
      ].concat(boundary ? [
        'Le masque s\'arrête pile sur un octet : les ' + (cidr / 8) + ' premier(s) octet(s) = partie réseau, le reste = partie hôte.',
        'Réseau : octets hôtes à 0 · broadcast : octets hôtes à 255.'
      ] : [
        'Octet « intéressant » : le ' + oct + ' (masque = ' + maskOct + '). Nombre magique = 256 − ' + maskOct + ' = <b>' + magic + '</b>.',
        'Dans le ' + oct + ' octet, ' + ipOct + ' est dans le bloc [' + blockStart + ' ; ' + (blockStart + magic - 1) + '] (multiples de ' + magic + ').'
      ]).concat([
        'Réseau <code>' + ipStr(net) + '</code> · broadcast <code>' + ipStr(bc) + '</code>.',
        'Hôtes : 2<sup>' + (32 - cidr) + '</sup> − 2 = <b>' + hosts.toLocaleString('fr-FR') + '</b> (de <code>' + ipStr(net + 1) + '</code> à <code>' + ipStr(bc - 1) + '</code>).'
      ]);
      return {
        question: Q[0], value: ipStr(ip) + '/' + cidr,
        placeholder: kind === 'hosts' ? 'ex. 62' : 'ex. 192.168.1.0',
        answer: Q[1], steps,
        check(input) {
          if (kind === 'hosts') return parseInt(cleanNum(input), 10) === hosts;
          return parseIp(input) === parseIp(Q[1]);
        }
      };
    }
  };

  /* ---------- 3. Loi d'Ohm et puissance ---------- */
  const E12 = [100, 120, 150, 180, 220, 270, 330, 390, 470, 560, 680, 820, 1000, 1200, 1500, 2200, 3300, 4700, 6800, 10000];
  const ohmStr = (r) => r >= 1000 ? fr(r / 1000) + ' kΩ' : r + ' Ω';
  const ohm = {
    id: 'ohm', title: 'Loi d\'Ohm et puissance', icon: 'ohm', color: '#ea580c', subject: 'electronique',
    desc: 'U = R × I, P = U × I et la résistance de protection d\'une LED.',
    generate() {
      const kind = pick(['U', 'U', 'I', 'R', 'P', 'LED']);
      let q, ans, unit, steps;
      if (kind === 'LED') {
        const ualim = pick([5, 5, 9, 12, 3.3]);
        const led = pick([{ c: 'rouge', v: 2 }, { c: 'verte', v: 2.2 }, { c: 'jaune', v: 2.1 }, { c: 'bleue', v: 3 }]);
        if (led.v >= ualim) led.v = 2;
        const ima = pick([10, 15, 20]);
        ans = (ualim - led.v) / (ima / 1000); unit = 'Ω';
        q = 'Une LED ' + led.c + ' (U<sub>LED</sub> = ' + fr(led.v) + ' V) doit être alimentée en ' + fr(ualim) + ' V avec I = ' + ima + ' mA. Quelle résistance de protection R faut-il (en Ω) ?';
        steps = ['La résistance « absorbe » le reste de la tension : U<sub>R</sub> = ' + fr(ualim) + ' − ' + fr(led.v) + ' = ' + fr(ualim - led.v) + ' V.',
          'I = ' + ima + ' mA = ' + fr(ima / 1000) + ' A.',
          'R = U<sub>R</sub> / I = ' + fr(ualim - led.v) + ' / ' + fr(ima / 1000) + ' = <b>' + fr(ans, 1) + ' Ω</b> (on prend la valeur normalisée juste au-dessus).'];
      } else {
        const R = pick(E12), Ima = pick([2, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50]);
        const I = Ima / 1000, U = R * I, P = U * I;
        if (kind === 'U') { ans = U; unit = 'V'; q = 'Une résistance de ' + ohmStr(R) + ' est traversée par un courant de ' + Ima + ' mA. Quelle est la tension U à ses bornes (en V) ?'; steps = ['Loi d\'Ohm : U = R × I (R en Ω, I en A).', 'I = ' + Ima + ' mA = ' + fr(I) + ' A.', 'U = ' + R + ' × ' + fr(I) + ' = <b>' + fr(U) + ' V</b>']; }
        if (kind === 'I') { ans = Ima; unit = 'mA'; q = 'On applique ' + fr(U) + ' V aux bornes d\'une résistance de ' + ohmStr(R) + '. Quelle est l\'intensité I (en mA) ?'; steps = ['I = U / R.', 'I = ' + fr(U) + ' / ' + R + ' = ' + fr(I, 4) + ' A.', 'En milliampères : × 1000 → <b>' + fr(Ima) + ' mA</b>']; }
        if (kind === 'R') { ans = R; unit = 'Ω'; q = 'Un dipôle ohmique a une tension de ' + fr(U) + ' V à ses bornes pour un courant de ' + Ima + ' mA. Quelle est sa résistance (en Ω) ?'; steps = ['R = U / I (I en A).', 'I = ' + Ima + ' mA = ' + fr(I) + ' A.', 'R = ' + fr(U) + ' / ' + fr(I) + ' = <b>' + R + ' Ω</b>']; }
        if (kind === 'P') { ans = P * 1000; unit = 'mW'; q = 'Une résistance de ' + ohmStr(R) + ' est traversée par ' + Ima + ' mA. Quelle puissance dissipe-t-elle (en mW) ?'; steps = ['P = U × I = R × I².', 'U = R × I = ' + R + ' × ' + fr(I) + ' = ' + fr(U) + ' V.', 'P = ' + fr(U) + ' × ' + fr(I) + ' = ' + fr(P, 5) + ' W = <b>' + fr(P * 1000, 2) + ' mW</b>']; }
      }
      return {
        question: q, value: '', placeholder: 'Réponse en ' + unit, unit,
        answer: fr(ans, 2) + ' ' + unit, steps,
        check(input) {
          let s = cleanNum(input).replace(/(ohms?|Ω)$/i, '');
          let v = parseNum(s);
          if (unit === 'Ω' && /k$/i.test(s)) v = parseNum(s.slice(0, -1)) * 1000;
          return close(v, ans, 0.02);
        }
      };
    }
  };

  /* ---------- 4. Code couleur des résistances ---------- */
  const COLORS = [
    { n: 'noir', c: '#111111' }, { n: 'marron', c: '#7c4a1e' }, { n: 'rouge', c: '#dc2626' }, { n: 'orange', c: '#f97316' },
    { n: 'jaune', c: '#facc15' }, { n: 'vert', c: '#16a34a' }, { n: 'bleu', c: '#2563eb' }, { n: 'violet', c: '#7c3aed' },
    { n: 'gris', c: '#9ca3af' }, { n: 'blanc', c: '#f8fafc' }
  ];
  const TOL = [{ n: 'or', c: '#c9a227', t: '± 5 %' }, { n: 'argent', c: '#c0c4cc', t: '± 10 %' }, { n: 'marron', c: '#7c4a1e', t: '± 1 %' }];
  function resistorSvg(bands) {
    const xs = [118, 150, 182, 262];
    return '<svg class="resistor" viewBox="0 0 420 120" role="img" aria-label="Résistance à 4 anneaux">' +
      '<line x1="0" y1="60" x2="420" y2="60" stroke="#94a3b8" stroke-width="6"/>' +
      '<rect x="80" y="22" width="260" height="76" rx="34" fill="#e8d3a8" stroke="#b9a27a" stroke-width="2"/>' +
      bands.map((b, i) => '<rect x="' + xs[i] + '" y="22" width="18" height="76" fill="' + b.c + '" stroke="rgba(0,0,0,.25)"/>').join('') +
      '</svg>';
  }
  function fmtOhm(v) {
    if (v >= 1e6) return fr(v / 1e6) + ' MΩ';
    if (v >= 1e3) return fr(v / 1e3) + ' kΩ';
    return fr(v) + ' Ω';
  }
  const resistances = {
    id: 'resistances', title: 'Code couleur des résistances', icon: 'resistor', color: '#b45309', subject: 'electronique',
    desc: 'Lis la valeur d\'une résistance à 4 anneaux. Astuce : « Ne Mangez Rien Ou Je Vous Brûle Votre Grande Barbe ».',
    generate() {
      const d1 = rnd(1, 9), d2 = rnd(0, 9), mult = rnd(0, 5), tol = pick([TOL[0], TOL[0], TOL[1], TOL[2]]);
      const value = (d1 * 10 + d2) * Math.pow(10, mult);
      const bands = [COLORS[d1], COLORS[d2], COLORS[mult], tol];
      return {
        question: 'Quelle est la valeur de cette résistance ? (ex. <code>4700</code>, <code>4,7k</code> ou <code>4.7 kΩ</code>)',
        value: '', extra: resistorSvg(bands) + '<p class="muted small" style="text-align:center">Anneaux : ' + bands.map((b) => b.n).join(' · ') + '</p>',
        placeholder: 'Valeur en Ω', answer: fmtOhm(value) + ' ' + tol.t,
        steps: [
          '1er anneau ' + COLORS[d1].n + ' = ' + d1 + ', 2e anneau ' + COLORS[d2].n + ' = ' + d2 + ' → ' + (d1 * 10 + d2) + '.',
          '3e anneau (multiplicateur) ' + COLORS[mult].n + ' = × 10^' + mult + ' (× ' + Math.pow(10, mult).toLocaleString('fr-FR') + ').',
          'Valeur : ' + (d1 * 10 + d2) + ' × ' + Math.pow(10, mult).toLocaleString('fr-FR') + ' = <b>' + fmtOhm(value) + '</b> ; 4e anneau ' + tol.n + ' = tolérance ' + tol.t + '.'
        ],
        check(input) {
          let s = cleanNum(input).replace(/(ohms?|Ω)$/i, '');
          let k = 1;
          if (/k$/i.test(s)) { k = 1e3; s = s.slice(0, -1); } else if (/m$/i.test(s)) { k = 1e6; s = s.slice(0, -1); }
          const m = s.match(/^(\d+)[kKmMrR](\d+)$/);
          let v = m ? parseFloat(m[1] + '.' + m[2]) * (/[kK]/.test(s) ? 1e3 : /[mM]/.test(s) ? 1e6 : 1) : parseNum(s) * k;
          return close(v, value, 0.001);
        }
      };
    }
  };

  /* ---------- 5. Pourcentages et évolutions ---------- */
  const pourcentages = {
    id: 'pourcentages', title: 'Pourcentages et évolutions', icon: 'percent', color: '#2563eb', subject: 'maths',
    desc: 'Appliquer un pourcentage, coefficient multiplicateur, taux d\'évolution.',
    generate() {
      const kind = pick(['part', 'up', 'down', 'coef', 'rate', 'rate']);
      let q, ans, steps, unit = '';
      if (kind === 'part') { const t = pick([5, 10, 15, 20, 25, 30, 40, 75]), v = pick([40, 60, 80, 120, 150, 200, 240, 360]); ans = v * t / 100; q = 'Calcule ' + t + ' % de ' + v + '.'; steps = ['Prendre t % d\'une valeur : valeur × t / 100.', v + ' × ' + t + ' / 100 = <b>' + fr(ans) + '</b>']; }
      if (kind === 'up') { const t = pick([5, 10, 12, 15, 20, 25, 30]), v = pick([40, 50, 80, 120, 200, 250]); ans = v * (1 + t / 100); unit = '€'; q = 'Un prix de ' + v + ' € augmente de ' + t + ' %. Quel est le nouveau prix (en €) ?'; steps = ['Augmenter de t % → multiplier par (1 + t/100) = ' + fr(1 + t / 100) + '.', v + ' × ' + fr(1 + t / 100) + ' = <b>' + fr(ans) + ' €</b>']; }
      if (kind === 'down') { const t = pick([5, 10, 15, 20, 25, 30, 40, 50]), v = pick([40, 60, 80, 120, 150, 300]); ans = v * (1 - t / 100); unit = '€'; q = 'Un article à ' + v + ' € est soldé à −' + t + ' %. Quel est son nouveau prix (en €) ?'; steps = ['Baisser de t % → multiplier par (1 − t/100) = ' + fr(1 - t / 100) + '.', v + ' × ' + fr(1 - t / 100) + ' = <b>' + fr(ans) + ' €</b>']; }
      if (kind === 'coef') { const up = Math.random() < 0.5, t = pick([3, 5, 8, 10, 15, 20, 25, 40]); ans = up ? 1 + t / 100 : 1 - t / 100; q = 'Quel est le coefficient multiplicateur associé à une ' + (up ? 'hausse' : 'baisse') + ' de ' + t + ' % ?'; steps = [(up ? 'Hausse : CM = 1 + t/100' : 'Baisse : CM = 1 − t/100') + ' = <b>' + fr(ans) + '</b>']; }
      if (kind === 'rate') { const va = pick([40, 50, 80, 100, 120, 200, 250]), t = pick([-40, -25, -20, -10, 10, 15, 20, 25, 50]); const vf = va * (1 + t / 100); ans = t; unit = '%'; q = 'Une valeur passe de ' + va + ' à ' + fr(vf) + '. Quel est le taux d\'évolution (en %) ?'; steps = ['Taux = (V<sub>arrivée</sub> − V<sub>départ</sub>) / V<sub>départ</sub> × 100.', '(' + fr(vf) + ' − ' + va + ') / ' + va + ' × 100 = <b>' + (t > 0 ? '+' : '') + t + ' %</b>' + (t < 0 ? ' (c\'est une baisse)' : '')]; }
      return {
        question: q, value: '', placeholder: unit ? 'Réponse en ' + unit : 'Réponse', answer: fr(ans) + (unit ? ' ' + unit : ''), steps,
        check(input) { return close(parseNum(String(input).replace('%', '').replace('€', '')), ans, 0.005); }
      };
    }
  };

  /* ---------- 6. Verbes irréguliers (anglais) ---------- */
  const VERBS = [['be', 'was/were', 'been', 'être'], ['become', 'became', 'become', 'devenir'], ['begin', 'began', 'begun', 'commencer'], ['break', 'broke', 'broken', 'casser'],
    ['bring', 'brought', 'brought', 'apporter'], ['build', 'built', 'built', 'construire'], ['buy', 'bought', 'bought', 'acheter'], ['catch', 'caught', 'caught', 'attraper'],
    ['choose', 'chose', 'chosen', 'choisir'], ['come', 'came', 'come', 'venir'], ['cut', 'cut', 'cut', 'couper'], ['do', 'did', 'done', 'faire'], ['drive', 'drove', 'driven', 'conduire'],
    ['eat', 'ate', 'eaten', 'manger'], ['fall', 'fell', 'fallen', 'tomber'], ['feel', 'felt', 'felt', 'ressentir'], ['find', 'found', 'found', 'trouver'], ['forget', 'forgot', 'forgotten', 'oublier'],
    ['get', 'got', 'got/gotten', 'obtenir'], ['give', 'gave', 'given', 'donner'], ['go', 'went', 'gone', 'aller'], ['have', 'had', 'had', 'avoir'], ['hear', 'heard', 'heard', 'entendre'],
    ['keep', 'kept', 'kept', 'garder'], ['know', 'knew', 'known', 'savoir, connaître'], ['leave', 'left', 'left', 'partir, laisser'], ['lose', 'lost', 'lost', 'perdre'], ['make', 'made', 'made', 'fabriquer'],
    ['meet', 'met', 'met', 'rencontrer'], ['pay', 'paid', 'paid', 'payer'], ['put', 'put', 'put', 'mettre'], ['read', 'read', 'read', 'lire'], ['run', 'ran', 'run', 'courir'], ['say', 'said', 'said', 'dire'],
    ['see', 'saw', 'seen', 'voir'], ['sell', 'sold', 'sold', 'vendre'], ['send', 'sent', 'sent', 'envoyer'], ['speak', 'spoke', 'spoken', 'parler'], ['spend', 'spent', 'spent', 'dépenser'],
    ['take', 'took', 'taken', 'prendre'], ['teach', 'taught', 'taught', 'enseigner'], ['tell', 'told', 'told', 'raconter'], ['think', 'thought', 'thought', 'penser'],
    ['understand', 'understood', 'understood', 'comprendre'], ['win', 'won', 'won', 'gagner'], ['write', 'wrote', 'written', 'écrire']];
  const verbes = {
    id: 'verbes', title: 'Verbes irréguliers anglais', icon: 'speech', color: '#0891b2', subject: 'anglais',
    desc: 'Prétérit, participe passé ou traduction : 46 verbes indispensables, tirés au hasard.',
    generate() {
      const v = pick(VERBS), kind = pick(['past', 'past', 'pp', 'pp', 'base']);
      const target = kind === 'past' ? v[1] : kind === 'pp' ? v[2] : v[0];
      const q = kind === 'past' ? 'Quel est le <b>prétérit</b> (past simple) de :' : kind === 'pp' ? 'Quel est le <b>participe passé</b> de :' : 'Traduis en anglais (base verbale) :';
      return {
        question: q, value: kind === 'base' ? v[3] : v[0], placeholder: 'ex. went', answer: target,
        steps: [v[0] + ' – ' + v[1] + ' – ' + v[2] + ' : ' + v[3] + '.', kind === 'past' ? 'Le prétérit s\'utilise au past simple : <i>Yesterday I ' + v[1].split('/')[0] + '…</i>' : kind === 'pp' ? 'Le participe passé s\'utilise après have (present perfect) : <i>I have ' + v[2].split('/')[0] + '…</i>' : 'Base verbale : la forme du dictionnaire, sans « to ».'],
        check: (input) => target.split('/').some((a) => a === String(input).trim().toLowerCase().replace(/^to\s+/, ''))
      };
    }
  };

  /* ---------- 7. Électricité et énergie (physique-chimie) ---------- */
  const elec = {
    id: 'electricite', title: 'Signaux, puissance et énergie', icon: 'flask', color: '#7c3aed', subject: 'physique-chimie',
    desc: 'f = 1/T, valeur efficace, P = U × I, énergie en kWh et coût : des calculs toujours différents.',
    generate() {
      const kind = pick(['f', 'T', 'eff', 'P', 'E', 'cout']);
      let q, ans, unit, steps;
      if (kind === 'f') { const T = pick([2, 4, 5, 10, 20, 25, 40, 50]); ans = 1000 / T; unit = 'Hz'; q = 'Un signal a une période de ' + T + ' ms. Quelle est sa fréquence (en Hz) ?'; steps = ['f = 1 / T avec T en secondes.', 'T = ' + T + ' ms = ' + fr(T / 1000) + ' s.', 'f = 1 / ' + fr(T / 1000) + ' = <b>' + fr(ans) + ' Hz</b>']; }
      if (kind === 'T') { const f = pick([50, 100, 200, 250, 500, 1000]); ans = 1000 / f; unit = 'ms'; q = 'Un signal a une fréquence de ' + f + ' Hz. Quelle est sa période (en ms) ?'; steps = ['T = 1 / f = 1 / ' + f + ' = ' + fr(1 / f, 4) + ' s.', 'En millisecondes : × 1 000 → <b>' + fr(ans) + ' ms</b>']; }
      if (kind === 'eff') { const U = pick([5, 10, 12, 24, 100, 325]); ans = U / Math.SQRT2; unit = 'V'; q = 'Une tension sinusoïdale a une valeur maximale de ' + U + ' V. Quelle est sa valeur efficace (en V) ?'; steps = ['U<sub>eff</sub> = U<sub>max</sub> / √2.', U + ' / 1,414 = <b>' + fr(ans, 2) + ' V</b>']; }
      if (kind === 'P') { const I = pick([0.5, 2, 4, 5, 8, 10]); ans = 230 * I; unit = 'W'; q = 'Un appareil branché sur 230 V absorbe ' + fr(I) + ' A. Quelle est sa puissance (en W) ?'; steps = ['P = U × I.', '230 × ' + fr(I) + ' = <b>' + fr(ans) + ' W</b>']; }
      if (kind === 'E') { const P = pick([60, 100, 300, 500, 1000, 2000]), h = pick([2, 3, 4, 5, 8, 10]); ans = P * h / 1000; unit = 'kWh'; q = 'Un appareil de ' + P + ' W fonctionne ' + h + ' h. Énergie consommée (en kWh) ?'; steps = ['E = P × t = ' + P + ' × ' + h + ' = ' + P * h + ' Wh.', 'En kWh : ÷ 1 000 → <b>' + fr(ans) + ' kWh</b>']; }
      if (kind === 'cout') { const P = pick([500, 1000, 1500, 2000]), h = pick([2, 4, 6, 10]), prix = 0.25; ans = P * h / 1000 * prix; unit = '€'; q = 'Un radiateur de ' + P + ' W fonctionne ' + h + ' h. Avec un kWh à 0,25 €, combien coûte l\'énergie (en €) ?'; steps = ['E = ' + P + ' × ' + h + ' = ' + P * h + ' Wh = ' + fr(P * h / 1000) + ' kWh.', 'Coût = ' + fr(P * h / 1000) + ' × 0,25 = <b>' + fr(ans, 2) + ' €</b>']; }
      return { question: q, value: '', placeholder: 'Réponse en ' + unit, answer: fr(ans, 2) + ' ' + unit, steps, check: (i) => close(parseNum(i), ans, 0.02) };
    }
  };

  /* ---------- 8. Suites et second degré (maths) ---------- */
  const algebre = {
    id: 'algebre', title: 'Suites et second degré', icon: 'sigma', color: '#2563eb', subject: 'maths',
    desc: 'Terme d\'une suite arithmétique ou géométrique, discriminant, solutions, sommet de la parabole.',
    generate() {
      const kind = pick(['arith', 'geo', 'delta', 'racine', 'sommet']);
      let q, ans, steps;
      if (kind === 'arith') { const u0 = rnd(-5, 20), r = pick([-4, -3, -2, 2, 3, 5, 7]), n = rnd(4, 12); ans = u0 + n * r; q = 'Suite arithmétique : u<sub>0</sub> = ' + u0 + ' et r = ' + r + '. Calcule u<sub>' + n + '</sub>.'; steps = ['u<sub>n</sub> = u<sub>0</sub> + n × r.', u0 + ' + ' + n + ' × (' + r + ') = <b>' + ans + '</b>']; }
      if (kind === 'geo') { const u0 = pick([1, 2, 3, 5, 10]), qq = pick([2, 3]), n = rnd(3, 6); ans = u0 * Math.pow(qq, n); q = 'Suite géométrique : u<sub>0</sub> = ' + u0 + ' et q = ' + qq + '. Calcule u<sub>' + n + '</sub>.'; steps = ['u<sub>n</sub> = u<sub>0</sub> × q<sup>n</sup>.', u0 + ' × ' + qq + '<sup>' + n + '</sup> = ' + u0 + ' × ' + Math.pow(qq, n) + ' = <b>' + ans + '</b>']; }
      const r1 = rnd(-6, 3), r2 = r1 + rnd(1, 7), b = -(r1 + r2), c = r1 * r2;
      const poly = 'x² ' + (b < 0 ? '− ' + -b : '+ ' + b) + 'x ' + (c < 0 ? '− ' + -c : '+ ' + c);
      if (kind === 'delta') { ans = b * b - 4 * c; q = 'f(x) = ' + poly + '. Calcule le discriminant Δ.'; steps = ['Δ = b² − 4ac avec a = 1, b = ' + b + ', c = ' + c + '.', '(' + b + ')² − 4 × 1 × (' + c + ') = ' + b * b + ' − (' + 4 * c + ') = <b>' + ans + '</b>']; }
      if (kind === 'racine') { ans = r2; q = 'Résous ' + poly + ' = 0. Donne la <b>plus grande</b> solution.'; steps = ['Δ = ' + (b * b - 4 * c) + ' > 0 : deux solutions.', 'x = (−b ± √Δ) / 2 = (' + -b + ' ± ' + Math.sqrt(b * b - 4 * c) + ') / 2.', 'Solutions : ' + r1 + ' et ' + r2 + ' → plus grande : <b>' + r2 + '</b>']; }
      if (kind === 'sommet') { ans = -b / 2; q = 'Quelle est l\'abscisse du sommet de la parabole de f(x) = ' + poly + ' ?'; steps = ['x<sub>S</sub> = −b / (2a) = ' + -b + ' / 2 = <b>' + fr(ans) + '</b>']; }
      return { question: q, value: '', placeholder: 'Ta réponse', answer: fr(ans), steps, check: (i) => close(parseNum(String(i).replace(/[−–]/g, '-')), ans, 0.001) || (ans === 0 && parseNum(i) === 0) };
    }
  };

  /* ---------- 9. Salaire et contrat (économie-gestion) ---------- */
  const salaire = {
    id: 'salaire', title: 'Salaire, heures sup et net', icon: 'briefcase', color: '#059669', subject: 'eco-gestion',
    desc: 'Salaire brut, heures supplémentaires majorées, passage du brut au net, prime de précarité.',
    generate() {
      const kind = pick(['brut', 'hs', 'net', 'precarite']);
      const taux = pick([11.88, 12, 12.5, 13, 14, 15]);
      let q, ans, steps;
      if (kind === 'brut') { const h = pick([20, 24, 28, 35]); ans = taux * h; q = 'Taux horaire brut : ' + fr(taux) + ' €. Salaire brut pour ' + h + ' heures (en €) ?'; steps = [fr(taux) + ' × ' + h + ' = <b>' + fr(ans, 2) + ' €</b>']; }
      if (kind === 'hs') { const hs = rnd(1, 8); ans = taux * 35 + hs * taux * 1.25; q = 'Taux horaire brut : ' + fr(taux) + ' €. Le salarié travaille ' + (35 + hs) + ' heures cette semaine. Salaire brut de la semaine (en €) ?'; steps = ['35 h normales : 35 × ' + fr(taux) + ' = ' + fr(35 * taux, 2) + ' €.', hs + ' heure(s) sup majorée(s) de 25 % : ' + hs + ' × ' + fr(taux) + ' × 1,25 = ' + fr(hs * taux * 1.25, 2) + ' €.', 'Total : <b>' + fr(ans, 2) + ' €</b>']; }
      if (kind === 'net') { const brut = pick([1500, 1700, 1800, 2000, 2200, 2500]); ans = brut * 0.78; q = 'Salaire brut : ' + brut + ' €. Avec 22 % de cotisations salariales, quel est le salaire net (en €) ?'; steps = ['Net = brut × (1 − 0,22) = brut × 0,78.', brut + ' × 0,78 = <b>' + fr(ans, 2) + ' €</b>']; }
      if (kind === 'precarite') { const tot = pick([3000, 4500, 6000, 8000, 9600]); ans = tot * 0.1; q = 'À la fin d\'un CDD, le salarié a touché ' + tot + ' € brut au total. Montant de la prime de précarité (en €) ?'; steps = ['Prime de précarité = 10 % de la rémunération brute totale.', tot + ' × 0,10 = <b>' + fr(ans, 2) + ' €</b>']; }
      return { question: q, value: '', placeholder: 'Réponse en €', answer: fr(ans, 2) + ' €', steps, check: (i) => close(parseNum(i), ans, 0.005) };
    }
  };

  global.TRAINERS = [ipv4, conversions, ohm, resistances, pourcentages, verbes, elec, algebre, salaire];
})(window);
