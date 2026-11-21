/* RéviCIEL — schémas des fiches (SVG dessinés pour l'appli, adaptés au thème clair et sombre).
   Dans une fiche :  ~~~schema   puis le nom du schéma, puis une légende facultative, puis ~~~ */
(function (global) {
  'use strict';
  const svg = (w, h, body, label) => '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  const t = (x, y, s, cls, anchor) => '<text x="' + x + '" y="' + y + '" class="' + (cls || 's-t') + '"' + (anchor ? ' text-anchor="' + anchor + '"' : ' text-anchor="middle"') + '>' + s + '</text>';
  const ln = (x1, y1, x2, y2, cls) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + (cls || 's-l') + '"/>';
  const dot = (x, y) => '<circle cx="' + x + '" cy="' + y + '" r="3.6" class="s-dot"/>';
  const arrowHead = (x, y, dir) => { // pointe de flèche : dir = r, l, u, d
    const p = { r: [[-9, -5], [0, 0], [-9, 5]], l: [[9, -5], [0, 0], [9, 5]], u: [[-5, 9], [0, 0], [5, 9]], d: [[-5, -9], [0, 0], [5, -9]] }[dir];
    return '<path d="M' + p.map((q) => (x + q[0]) + ' ' + (y + q[1])).join(' L') + '" class="s-a"/>';
  };
  const battery = (x, y) => ln(x - 22, y - 12, x + 22, y - 12) + '<line x1="' + (x - 11) + '" y1="' + (y + 12) + '" x2="' + (x + 11) + '" y2="' + (y + 12) + '" class="s-l" stroke-width="5"/>' + t(x + 30, y - 14, '+', 's-m') + t(x + 28, y + 24, '−', 's-m');
  const meter = (x, y, letter) => '<circle cx="' + x + '" cy="' + y + '" r="18" class="s-box"/>' + t(x, y + 5, letter);
  const res = (x, y, w, h) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" class="s-box"/>';

  /* sinusoïde calculée */
  let sine = '';
  for (let k = 0; k <= 470; k += 5) sine += (k ? ' L' : 'M') + (60 + k) + ' ' + (120 - 70 * Math.sin((2 * Math.PI * k) / 200)).toFixed(1);

  const S = {
    'circuit-ohm': svg(540, 262,
      ln(80, 60, 182, 60) + ln(218, 60, 440, 60) + ln(440, 60, 440, 100) + ln(440, 160, 440, 200) + ln(440, 200, 80, 200) + ln(80, 200, 80, 142) + ln(80, 118, 80, 60) +
      battery(80, 130) + t(22, 135, 'G', 's-t') + meter(200, 60, 'A') + res(428, 100, 24, 60) + t(470, 128, 'R', 's-t', 'start') +
      ln(440, 80, 505, 80) + ln(505, 80, 505, 112) + ln(505, 148, 505, 180) + ln(505, 180, 440, 180) + meter(505, 130, 'V') + dot(440, 80) + dot(440, 180) +
      ln(280, 60, 300, 60, 's-acc') + arrowHead(306, 60, 'r') + t(296, 48, 'I', 's-ta') +
      ln(412, 160, 412, 104, 's-acc') + arrowHead(412, 100, 'u') + t(398, 136, 'U', 's-ta', 'end') +
      t(270, 246, 'U = R × I', 's-big'), 'Loi d\'Ohm : générateur, ampèremètre en série, résistance et voltmètre en dérivation'),

    'serie-parallele': svg(560, 236,
      t(140, 24, 'En série', 's-t') + ln(20, 90, 60, 90) + res(60, 78, 60, 24) + ln(120, 90, 160, 90) + res(160, 78, 60, 24) + ln(220, 90, 260, 90) + dot(20, 90) + dot(260, 90) +
      t(90, 68, 'R1', 's-m') + t(190, 68, 'R2', 's-m') + ln(100, 116, 140, 116, 's-acc') + arrowHead(146, 116, 'r') + t(162, 120, 'I', 's-ta', 'start') +
      t(140, 196, 'Réq = R1 + R2', 's-big') + t(140, 220, 'le même courant traverse tout', 's-m') +
      ln(290, 30, 290, 226, 's-sep') +
      t(420, 24, 'En parallèle', 's-t') + ln(300, 100, 340, 100) + ln(340, 60, 340, 140) + ln(340, 60, 390, 60) + res(390, 48, 60, 24) + ln(450, 60, 500, 60) +
      ln(340, 140, 390, 140) + res(390, 128, 60, 24) + ln(450, 140, 500, 140) + ln(500, 60, 500, 140) + ln(500, 100, 540, 100) + dot(300, 100) + dot(540, 100) + dot(340, 100) + dot(500, 100) +
      t(420, 40, 'R1', 's-m') + t(420, 170, 'R2', 's-m') +
      t(420, 196, '1/Réq = 1/R1 + 1/R2', 's-big') + t(420, 220, 'la même tension aux bornes de chaque branche', 's-m'), 'Résistances en série et en parallèle'),

    'led-resistance': svg(520, 228,
      ln(60, 60, 170, 60) + res(170, 48, 70, 24) + ln(240, 60, 420, 60) + ln(420, 60, 420, 100) + '<path d="M404 100 L436 100 L420 126 Z" class="s-box"/>' + ln(404, 127, 436, 127) +
      ln(420, 127, 420, 180) + ln(420, 180, 60, 180) + ln(60, 180, 60, 132) + ln(60, 108, 60, 60) + battery(60, 120) +
      '<path d="M442 104 L460 92 M454 92 L460 92 L458 98 M444 116 L462 104 M456 104 L462 104 L460 110" class="s-light"/>' +
      t(205, 40, 'R', 's-t') + t(470, 122, 'LED', 's-t', 'start') + t(14, 125, 'Ug', 's-t', 'start') +
      ln(232, 88, 182, 88, 's-acc') + arrowHead(176, 88, 'l') + t(205, 106, 'UR', 's-ta') +
      ln(396, 128, 396, 104, 's-acc') + arrowHead(396, 98, 'u') + t(388, 120, 'U LED', 's-ta', 'end') +
      t(260, 214, 'R = (Ug − U LED) ÷ I', 's-big'), 'LED protégée par une résistance en série'),

    'reseau-lan': (function () {
      const pc = (x) => '<rect x="' + (x - 22) + '" y="230" width="44" height="30" rx="3" class="s-box"/>' + ln(x, 260, x, 267) + ln(x - 11, 268, x + 11, 268);
      const printer = (x) => '<rect x="' + (x - 14) + '" y="228" width="28" height="12" class="s-box"/><rect x="' + (x - 24) + '" y="238" width="48" height="24" rx="3" class="s-box"/>';
      const ap = (x) => '<rect x="' + (x - 18) + '" y="246" width="36" height="16" rx="3" class="s-box"/>' + ln(x + 10, 246, x + 14, 232) + '<path d="M' + (x - 12) + ' 236 Q' + x + ' 224 ' + (x + 12) + ' 236 M' + (x - 20) + ' 230 Q' + x + ' 214 ' + (x + 20) + ' 230" class="s-light"/>';
      return svg(560, 312,
        '<path d="M232 58 C212 58 212 32 236 32 C240 14 270 12 278 26 C290 10 322 18 318 36 C344 36 342 60 322 60 Z" class="s-box"/>' + t(278, 48, 'Internet', 's-m') +
        ln(280, 60, 280, 95) + t(292, 82, 'WAN', 's-m', 'start') +
        '<rect x="228" y="95" width="104" height="34" rx="8" class="s-box s-router"/>' + t(280, 117, 'Box / routeur', 's-t') + t(342, 117, 'passerelle', 's-m', 'start') +
        '<rect x="20" y="150" width="520" height="152" rx="14" class="s-zone"/>' + t(32, 168, 'Réseau local (LAN)', 's-ta', 'start') +
        ln(280, 129, 280, 172) + '<rect x="220" y="172" width="120" height="26" rx="6" class="s-box s-switch"/>' + t(280, 190, 'Switch', 's-t') +
        [100, 220, 340, 460].map((x) => ln(280, 198, x, 228)).join('') +
        pc(100) + pc(220) + printer(340) + ap(460) +
        t(100, 290, 'PC', 's-m') + t(220, 290, 'PC', 's-m') + t(340, 290, 'Imprimante', 's-m') + t(460, 290, 'Point d\'accès Wi-Fi', 's-m'),
        'Réseau local : box, switch, PC, imprimante et point d\'accès Wi-Fi');
    })(),

    'ipv4': svg(560, 206,
      [100, 210, 320, 430].map((x, k) => '<rect x="' + x + '" y="44" width="100" height="44" rx="8" class="' + (k < 3 ? 's-net' : 's-host') + '"/>' +
        t(x + 50, 73, ['192', '168', '1', '10'][k], 's-big') + t(x + 50, 112, ['11000000', '10101000', '00000001', '00001010'][k], 's-mono') + t(x + 50, 190, ['255', '255', '255', '0'][k], 's-t')).join('') +
      t(205, 73, '.', 's-big') + t(315, 73, '.', 's-big') + t(425, 73, '.', 's-big') +
      t(10, 72, 'Adresse', 's-m', 'start') + t(10, 112, 'Binaire', 's-m', 'start') + t(10, 190, 'Masque', 's-m', 'start') +
      t(280, 24, '192.168.1.10 / 24', 's-t') +
      ln(100, 130, 420, 130, 's-acc') + ln(100, 124, 100, 136, 's-acc') + ln(420, 124, 420, 136, 's-acc') + t(260, 154, 'Partie réseau : 24 bits → réseau 192.168.1.0', 's-ta') +
      ln(430, 130, 530, 130, 's-acc2') + ln(430, 124, 430, 136, 's-acc2') + ln(530, 124, 530, 136, 's-acc2') + t(480, 154, 'Partie hôte', 's-ta2'),
      'Adresse IPv4 192.168.1.10 avec un masque /24 : partie réseau et partie hôte'),

    'osi-tcpip': (function () {
      const osi = ['7 · Application', '6 · Présentation', '5 · Session', '4 · Transport', '3 · Réseau', '2 · Liaison de données', '1 · Physique'];
      let b = t(95, 14, 'Modèle OSI', 's-ta') + t(465, 14, 'Modèle TCP/IP', 's-ta');
      osi.forEach((name, k) => { b += '<rect x="10" y="' + (22 + k * 40) + '" width="170" height="34" rx="6" class="s-box s-l' + (7 - k) + '"/>' + t(95, 44 + k * 40, name, 's-t'); });
      [['Application', 22, 114, 'a'], ['Transport', 142, 34, 't'], ['Internet', 182, 34, 'i'], ['Accès réseau', 222, 74, 'r']].forEach(([n, y, h, c]) => { b += '<rect x="380" y="' + y + '" width="170" height="' + h + '" rx="6" class="s-box s-tcp-' + c + '"/>' + t(465, y + h / 2 + 5, n, 's-t'); });
      [['HTTP, HTTPS, DNS, DHCP, SSH', 79], ['TCP, UDP · ports', 159], ['IP, ICMP · routeur', 199], ['Ethernet, MAC · switch', 239], ['câbles, Wi-Fi, bits', 279]].forEach(([s, y]) => { b += t(280, y + 4, s, 's-m'); });
      b += t(280, 322, 'données → segments → paquets → trames → bits', 's-ta');
      return svg(560, 332, b, 'Les 7 couches du modèle OSI face aux 4 couches du modèle TCP/IP');
    })(),

    'signal-periodique': svg(560, 240,
      ln(60, 120, 540, 120) + arrowHead(546, 120, 'r') + ln(60, 220, 60, 22) + arrowHead(60, 16, 'u') + t(536, 140, 't', 's-m') + t(72, 22, 'u (V)', 's-m', 'start') +
      '<path d="' + sine + '" class="s-wave"/>' +
      ln(60, 50, 110, 50, 's-dash') + t(54, 54, 'Umax', 's-ta', 'end') + ln(60, 190, 210, 190, 's-dash') + t(54, 194, '−Umax', 's-ta', 'end') +
      ln(116, 34, 304, 34, 's-acc') + arrowHead(110, 34, 'l') + arrowHead(310, 34, 'r') + ln(110, 40, 110, 50, 's-dash') + ln(310, 40, 310, 50, 's-dash') + t(210, 26, 'T (période)', 's-ta') +
      t(300, 230, 'f = 1 / T   (f en hertz, T en secondes)', 's-t'), 'Signal sinusoïdal : valeur maximale et période'),

    'cercle-trigo': svg(360, 332,
      ln(30, 165, 310, 165) + arrowHead(316, 165, 'r') + ln(170, 305, 170, 25) + arrowHead(170, 19, 'u') +
      '<circle cx="170" cy="165" r="120" class="s-l"/>' +
      ln(170, 165, 261.9, 87.9, 's-acc') + '<circle cx="261.9" cy="87.9" r="4.5" class="s-dotacc"/>' +
      ln(261.9, 87.9, 261.9, 165, 's-dash') + ln(261.9, 87.9, 170, 87.9, 's-dash') +
      ln(170, 172, 261.9, 172, 's-acc2') + ln(162, 165, 162, 87.9, 's-acc2') +
      '<path d="M200 165 A30 30 0 0 0 193 145.7" class="s-acc"/>' + t(212, 156, 'θ', 's-ta') +
      t(216, 190, 'cos θ', 's-ta2') + t(156, 130, 'sin θ', 's-ta2', 'end') + t(270, 80, 'M', 's-t', 'start') +
      t(296, 182, '1', 's-m') + t(44, 182, '−1', 's-m') + t(180, 42, '1', 's-m', 'start') + t(156, 182, 'O', 's-m') +
      t(180, 324, 'cos²θ + sin²θ = 1', 's-t'), 'Cercle trigonométrique : cosinus et sinus d\'un angle')
  };
  global.SCHEMAS = S;
})(window);
