/* RéviCIEL — mini moteur Markdown (sans dépendance) + lecture du format des fiches.
   Tout le texte est échappé : une fiche importée ne peut pas injecter de HTML. */
(function (global) {
  'use strict';

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }

  function deaccent(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function slugify(s) {
    return deaccent(stripInline(s)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section';
  }
  function safeUrl(u) {
    u = String(u).trim();
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) && !/^(https?|mailto):/i.test(u)) return '#';
    return u;
  }

  /* ---------- Inline ---------- */
  function inline(src) {
    var codes = [];
    var s = String(src == null ? '' : src).replace(/`([^`]+)`/g, function (_, c) {
      codes.push('<code>' + esc(c) + '</code>');
      return '\u0000' + (codes.length - 1) + '\u0000';
    });
    s = esc(s);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, u) {
      var url = safeUrl(u.replace(/&amp;/g, '&'));
      var ext = /^https?:/i.test(url);
      return '<a href="' + esc(url) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + t + '</a>';
    });
    s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/==(?=\S)([\s\S]*?\S)==/g, '<mark>$1</mark>');
    s = s.replace(/(^|[\s(>«"'’])\*(?=\S)([^*]*?\S)\*(?=$|[\s).,;:!?»"'’<])/g, '$1<em>$2</em>');
    s = s.replace(/\^([^\s^]+)\^/g, '<sup>$1</sup>');
    s = s.replace(/~([^\s~]+)~/g, '<sub>$1</sub>');
    s = s.replace(/\u0000(\d+)\u0000/g, function (_, i) { return codes[+i]; });
    return s;
  }

  function stripInline(s) {
    return String(s == null ? '' : s)
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/\*\*|==|`/g, '')
      .replace(/\^([^\s^]+)\^/g, '$1')
      .replace(/~([^\s~]+)~/g, '$1')
      .replace(/(^|\s)\*(\S[^*]*?)\*/g, '$1$2')
      .replace(/\s+/g, ' ').trim();
  }

  /* ---------- Blocs ---------- */
  var RE_LIST = /^(\s*)([-*+]|\d{1,3}[.)])\s+(.*)$/;
  var RE_HR = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
  var RE_H = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
  var RE_FENCE = /^\s*(```|~~~)\s*([\w+#.-]*)\s*$/;
  var RE_TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

  var CALLOUTS = {
    retenir: 'À retenir', definition: 'Définition', exemple: 'Exemple', attention: 'Attention',
    astuce: 'Astuce', methode: 'Méthode', formule: 'Formule', info: 'Info'
  };
  var CALLOUT_ALIAS = { important: 'retenir', cle: 'retenir', def: 'definition', ex: 'exemple', warning: 'attention', danger: 'attention', tip: 'astuce', conseil: 'astuce', note: 'info', formules: 'formule', 'methode': 'methode' };
  function calloutType(t) {
    t = deaccent(t).toLowerCase();
    if (CALLOUTS[t]) return t;
    return CALLOUT_ALIAS[t] || 'info';
  }

  function isTableStart(lines, i) {
    return lines[i].indexOf('|') !== -1 && i + 1 < lines.length && lines[i + 1].indexOf('-') !== -1 && RE_TABLE_SEP.test(lines[i + 1]);
  }
  function startsBlock(lines, i) {
    var l = lines[i];
    return RE_FENCE.test(l) || RE_H.test(l) || RE_HR.test(l) || /^\s*>/.test(l) || RE_LIST.test(l) || isTableStart(lines, i);
  }
  function splitRow(line) {
    var s = line.trim().replace(/\\\|/g, '\u0001');
    if (s.charAt(0) === '|') s = s.slice(1);
    if (s.charAt(s.length - 1) === '|') s = s.slice(0, -1);
    return s.split('|').map(function (c) { return c.trim().replace(/\u0001/g, '|'); });
  }
  function alignOf(c) {
    var l = c.charAt(0) === ':', r = c.charAt(c.length - 1) === ':';
    return l && r ? 'center' : r ? 'right' : '';
  }
  function table(header, aligns, rows) {
    var n = header.length;
    function cell(tag, txt, k) {
      var a = aligns[k];
      return '<' + tag + (a ? ' style="text-align:' + a + '"' : '') + '>' + inline(txt || '') + '</' + tag + '>';
    }
    var h = '<thead><tr>' + header.map(function (c, k) { return cell('th', c, k); }).join('') + '</tr></thead>';
    var b = '<tbody>' + rows.map(function (r) {
      var cells = [];
      for (var k = 0; k < n; k++) cells.push(cell('td', r[k], k));
      return '<tr>' + cells.join('') + '</tr>';
    }).join('') + '</tbody>';
    return '<div class="table-wrap"><table>' + h + b + '</table></div>';
  }
  function list(lines, start) {
    var m0 = lines[start].match(RE_LIST);
    var indent = m0[1].length, ordered = /\d/.test(m0[2]);
    var startNum = ordered ? parseInt(m0[2], 10) : 1;
    var items = [], i = start;
    while (i < lines.length) {
      var m = lines[i].match(RE_LIST);
      if (!m || m[1].length !== indent || /\d/.test(m[2]) !== ordered) break;
      var text = [m[3]], sub = '';
      i++;
      while (i < lines.length && lines[i].trim()) {
        var mm = lines[i].match(RE_LIST);
        var ind = lines[i].match(/^\s*/)[0].length;
        if (mm && ind > indent) { var r = list(lines, i); sub += r.html; i = r.next; continue; }
        if (mm || ind <= indent) break;
        text.push(lines[i].trim()); i++;
      }
      items.push('<li>' + text.map(inline).join('<br>') + sub + '</li>');
    }
    var tag = ordered ? 'ol' : 'ul';
    return { html: '<' + tag + (ordered && startNum !== 1 ? ' start="' + startNum + '"' : '') + '>' + items.join('') + '</' + tag + '>', next: i };
  }

  function render(src, opts) {
    opts = opts || {};
    var lines = String(src == null ? '' : src).replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
    var out = [], headings = [], used = {}, i = 0, m;
    while (i < lines.length) {
      var line = lines[i];
      if (!line.trim()) { i++; continue; }
      if ((m = line.match(RE_FENCE))) {
        var fence = m[1], lang = m[2], buf = [];
        i++;
        while (i < lines.length && lines[i].trim() !== fence) { buf.push(lines[i]); i++; }
        i++;
        if (lang === 'schema') { // schéma dessiné (voir js/schemas.js) + légende
          var sname = (buf[0] || '').trim(), sv = global.SCHEMAS && global.SCHEMAS[sname], cap = buf.slice(1).join(' ').trim();
          out.push('<figure class="schema">' + (sv || '<p class="muted">[schéma « ' + esc(sname) + ' »]</p>') + (cap ? '<figcaption>' + inline(cap) + '</figcaption>' : '') + '</figure>');
          continue;
        }
        out.push('<pre><code' + (lang ? ' class="lang-' + esc(lang) + '"' : '') + '>' + esc(buf.join('\n')) + '</code></pre>');
        continue;
      }
      if ((m = line.match(RE_H))) {
        var level = Math.min(Math.max(m[1].length, 2), 4);
        var id = slugify(m[2]), base = id, n = 2;
        while (used[id]) id = base + '-' + (n++);
        used[id] = 1;
        if (level === 2) headings.push({ id: id, text: stripInline(m[2]) });
        out.push('<h' + level + ' id="' + esc(id) + '">' + inline(m[2]) + '</h' + level + '>');
        i++; continue;
      }
      if (RE_HR.test(line)) { out.push('<hr>'); i++; continue; }
      if (/^\s*>/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        var cm = q[0].match(/^\[!([\wÀ-ÿ-]+)\]\s*(.*)$/);
        if (cm) {
          var type = calloutType(cm[1]);
          var title = cm[2] ? inline(cm[2]) : esc(CALLOUTS[type]);
          out.push('<div class="callout ' + type + '"><div class="callout-title">' + title + '</div>' + render(q.slice(1).join('\n')).html + '</div>');
        } else {
          out.push('<blockquote>' + render(q.join('\n')).html + '</blockquote>');
        }
        continue;
      }
      if (isTableStart(lines, i)) {
        var header = splitRow(line), aligns = splitRow(lines[i + 1]).map(alignOf), rows = [];
        i += 2;
        while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') !== -1) { rows.push(splitRow(lines[i])); i++; }
        out.push(table(header, aligns, rows));
        continue;
      }
      if (RE_LIST.test(line)) { var res = list(lines, i); out.push(res.html); i = res.next; continue; }
      var p = [line.trim()];
      i++;
      while (i < lines.length && lines[i].trim() && !startsBlock(lines, i)) { p.push(lines[i].trim()); i++; }
      out.push('<p>' + p.map(inline).join('<br>') + '</p>');
    }
    return { html: out.join('\n'), headings: headings };
  }

  function toPlain(md) {
    return String(md || '').replace(/\r\n?/g, '\n').split('\n').map(function (l) {
      if (RE_HR.test(l) || RE_FENCE.test(l)) return '';
      if (l.indexOf('|') !== -1 && l.indexOf('-') !== -1 && RE_TABLE_SEP.test(l)) return '';
      return stripInline(l.replace(/^\s*>\s?(\[![^\]]*\]\s*)?/, '').replace(/^#{1,6}\s+/, '').replace(/^\s*([-*+]|\d+[.)])\s+/, '').replace(/\|/g, ' · '));
    }).filter(Boolean).join('\n');
  }

  /* ---------- Format des fiches ----------
     ---                      (en-tête)
     id: res-ipv4
     matiere: reseaux
     titre: L'adressage IPv4
     resume: …
     mots-cles: IP, masque
     ordre: 3
     ---
     Contenu en Markdown…
     === CARTES ===
     Q: question
     R: réponse
     === QUIZ ===
     ? Question
     - mauvaise réponse
     + bonne réponse
     ! explication
  */
  var SECTION_RE = /^\s*={3,}\s*(cartes|flashcards|quiz|qcm|exercices|exercises)\s*={3,}\s*$/i;

  function parseMeta(block) {
    var meta = {};
    block.split('\n').forEach(function (l) {
      var i = l.indexOf(':');
      if (i < 1) return;
      var k = deaccent(l.slice(0, i)).trim().toLowerCase().replace(/\s+/g, '-');
      meta[k] = l.slice(i + 1).trim();
    });
    return meta;
  }
  function short(s) { s = stripInline(s); return s.length > 50 ? s.slice(0, 50) + '…' : s; }

  function parseCards(lines) {
    var cards = [], errors = [], cur = null, mode = null;
    function push() {
      if (!cur) return;
      if (cur.q.trim() && cur.a.trim()) cards.push({ q: cur.q.trim(), a: cur.a.trim() });
      else errors.push('Carte sans réponse : « ' + short(cur.q) + ' » (ajoute une ligne R: …)');
      cur = null;
    }
    lines.forEach(function (l) {
      var m;
      if ((m = l.match(/^\s*Q\s*:\s?(.*)$/))) { push(); cur = { q: m[1], a: '' }; mode = 'q'; }
      else if ((m = l.match(/^\s*R\s*:\s?(.*)$/)) && cur) { cur.a = m[1]; mode = 'a'; }
      else if (cur && mode) cur[mode] += '\n' + l;
    });
    push();
    return { cards: cards, errors: errors };
  }

  function parseQuiz(lines) {
    var qs = [], errors = [], cur = null, last = null;
    function push() {
      if (!cur) return;
      var ok = cur.options.filter(function (o) { return o.ok; }).length;
      if (!cur.q.trim()) errors.push('Question vide');
      else if (cur.options.length < 2) errors.push('Question « ' + short(cur.q) + ' » : il faut au moins 2 réponses (lignes - ou +)');
      else if (ok !== 1) errors.push('Question « ' + short(cur.q) + ' » : il faut exactement une bonne réponse (ligne +)');
      else qs.push({
        q: cur.q.trim(),
        options: cur.options.map(function (o) { return o.text; }),
        answer: cur.options.map(function (o) { return o.ok; }).indexOf(true),
        explain: cur.explain.trim()
      });
      cur = null;
    }
    lines.forEach(function (l) {
      var m;
      if ((m = l.match(/^\s*\?\s?(.*)$/))) { push(); cur = { q: m[1], options: [], explain: '' }; last = 'q'; }
      else if (cur && (m = l.match(/^\s*([+-])\s+(.*)$/))) { cur.options.push({ text: m[2].trim(), ok: m[1] === '+' }); last = 'opt'; }
      else if (cur && (m = l.match(/^\s*!\s?(.*)$/))) { cur.explain += (cur.explain ? '\n' : '') + m[1]; last = 'exp'; }
      else if (cur && l.trim()) {
        if (last === 'q') cur.q += '\n' + l.trim();
        else if (last === 'exp') cur.explain += '\n' + l.trim();
        else if (last === 'opt') cur.options[cur.options.length - 1].text += ' ' + l.trim();
      }
    });
    push();
    return { questions: qs, errors: errors };
  }

  /* ---------- Exercices ----------
     # trous : consigne        texte avec [[réponse]] ou [[réponse|variante]]
     # ordre : consigne        - éléments dans le bon ordre (affichés mélangés)
     # paires : consigne       - gauche = droite
     # classer : consigne      Catégorie : élément, élément
     # calcul : consigne       ? question   = 8,7 A ± 0,1   ! explication
     Une ligne « ! … » donne l'explication affichée après la correction. */
  var EX_TYPES = { trous: 'trous', 'texte a trous': 'trous', ordre: 'ordre', chronologie: 'ordre', 'remettre dans l\'ordre': 'ordre', paires: 'paires', association: 'paires', associer: 'paires', classer: 'classer', classement: 'classer', tri: 'classer', calcul: 'calcul', calculs: 'calcul' };
  function num(s) { var v = parseFloat(String(s).replace(/\s+/g, '').replace(',', '.')); return isFinite(v) ? v : NaN; }
  function parseExercises(lines) {
    var list = [], errors = [], cur = null;
    function push() {
      if (!cur) return;
      var e = cur, L = e.lines, ex = { type: e.type, title: e.title, explain: '' };
      var bodyL = [];
      L.forEach(function (l) { var m = l.match(/^\s*!\s?(.*)$/); if (m && e.type !== 'calcul') ex.explain += (ex.explain ? '\n' : '') + m[1]; else bodyL.push(l); });
      var label = '« ' + short(e.title || e.type) + ' »';
      if (e.type === 'trous') {
        ex.text = bodyL.join('\n').trim();
        ex.blanks = [];
        ex.text.replace(/\[\[([^\]]+)\]\]/g, function (m, a) { ex.blanks.push(a.split('|').map(function (x) { return x.trim(); })); return m; });
        if (!ex.blanks.length) { errors.push('Exercice ' + label + ' : aucun trou [[...]]'); cur = null; return; }
      } else if (e.type === 'ordre') {
        ex.items = bodyL.map(function (l) { var m = l.match(/^\s*-\s+(.*)$/); return m ? m[1].trim() : null; }).filter(Boolean);
        if (ex.items.length < 3) { errors.push('Exercice ' + label + ' : il faut au moins 3 lignes « - »'); cur = null; return; }
      } else if (e.type === 'paires') {
        ex.pairs = bodyL.map(function (l) { var m = l.match(/^\s*-\s+(.+?)\s+=\s+(.+)$/); return m ? [m[1].trim(), m[2].trim()] : null; }).filter(Boolean);
        if (ex.pairs.length < 3) { errors.push('Exercice ' + label + ' : il faut au moins 3 lignes « - gauche = droite »'); cur = null; return; }
      } else if (e.type === 'classer') {
        ex.cats = bodyL.map(function (l) {
          var m = l.match(/^\s*([^:]+?)\s*:\s*(.+)$/);
          if (!m) return null;
          var sep = m[2].indexOf(';') !== -1 ? ';' : ',';
          return { name: m[1].replace(/^-\s*/, '').trim(), items: m[2].split(sep).map(function (x) { return x.trim(); }).filter(Boolean) };
        }).filter(Boolean);
        if (ex.cats.length < 2) { errors.push('Exercice ' + label + ' : il faut au moins 2 catégories « Catégorie : a, b »'); cur = null; return; }
      } else if (e.type === 'calcul') {
        ex.questions = [];
        var q = null;
        L.forEach(function (l) {
          var m;
          if ((m = l.match(/^\s*\?\s?(.*)$/))) { q = { q: m[1].trim(), value: NaN, unit: '', tol: null, explain: '' }; ex.questions.push(q); }
          else if (q && (m = l.match(/^\s*=\s*(.+)$/))) {
            var parts = m[1].split('±'), a = parts[0].trim().match(/^(-?[\d\s.,]*\d)\s*(.*)$/);
            if (a) { q.value = num(a[1]); q.unit = a[2].trim(); }
            if (parts[1]) q.tol = num(parts[1]);
          } else if (q && (m = l.match(/^\s*!\s?(.*)$/))) q.explain += (q.explain ? '\n' : '') + m[1];
          else if (q && l.trim() && !q.explain && isNaN(q.value)) q.q += '\n' + l.trim();
        });
        ex.questions = ex.questions.filter(function (x) { if (isNaN(x.value)) { errors.push('Calcul « ' + short(x.q) + ' » : ligne « = résultat » manquante'); return false; } if (x.tol == null || isNaN(x.tol)) x.tol = Math.max(Math.abs(x.value) * 0.01, 0.005); return true; });
        if (!ex.questions.length) { cur = null; return; }
      }
      list.push(ex);
      cur = null;
    }
    lines.forEach(function (l) {
      var m = l.match(/^\s*#\s*([^:#]+?)\s*:\s*(.*)$/);
      var t = m && EX_TYPES[deaccent(m[1]).toLowerCase().trim()];
      if (t) { push(); cur = { type: t, title: m[2].trim(), lines: [] }; }
      else if (cur) cur.lines.push(l);
    });
    push();
    return { exercises: list, errors: errors };
  }

  function parseFiche(src) {
    src = String(src || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    var meta = {}, body = src;
    var fm = src.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
    if (fm) { meta = parseMeta(fm[1]); body = src.slice(fm[0].length); }
    var parts = { content: [], cards: [], quiz: [], ex: [] }, cur = 'content';
    body.split('\n').forEach(function (l) {
      var m = l.match(SECTION_RE);
      if (m) { var k = m[1].toLowerCase(); cur = (k === 'quiz' || k === 'qcm') ? 'quiz' : /^exerci/.test(k) ? 'ex' : 'cards'; return; }
      parts[cur].push(l);
    });
    var x = parseExercises(parts.ex);
    var c = parseCards(parts.cards), q = parseQuiz(parts.quiz);
    var tags = meta['mots-cles'] || meta.tags || '';
    return {
      id: meta.id || '',
      subject: meta.matiere || meta.subject || 'perso',
      title: meta.titre || meta.title || 'Sans titre',
      chapter: meta.chapitre || '',
      summary: meta.resume || '',
      tags: tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
      order: isFinite(parseFloat(meta.ordre)) ? parseFloat(meta.ordre) : 999,
      body: parts.content.join('\n').trim(),
      cards: c.cards,
      quiz: q.questions,
      exercises: x.exercises,
      errors: c.errors.concat(q.errors, x.errors),
      src: src
    };
  }

  /* Recompose une fiche (utilisé par l'éditeur) */
  function buildSource(meta, body) {
    var head = ['---'];
    ['id', 'matiere', 'titre', 'chapitre', 'resume', 'mots-cles'].forEach(function (k) {
      if (meta[k]) head.push(k + ': ' + String(meta[k]).replace(/\n/g, ' '));
    });
    head.push('---');
    return head.join('\n') + '\n\n' + String(body || '').trim() + '\n';
  }

  global.RCMD = {
    esc: esc, inline: inline, render: render, toPlain: toPlain, stripInline: stripInline,
    slugify: slugify, deaccent: deaccent, parseFiche: parseFiche, buildSource: buildSource
  };
})(window);
