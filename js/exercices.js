/* RéviCIEL — exercices des fiches : texte à trous, remise en ordre, association, classement, calcul. */
(function () {
  'use strict';
  const { E, icon, $, $$, plural, bar } = App;
  const TYPES = {
    trous: { name: 'Texte à trous', icon: 'pen' },
    ordre: { name: 'Remettre dans l\'ordre', icon: 'layers' },
    paires: { name: 'Associer', icon: 'shuffle' },
    classer: { name: 'Classer', icon: 'cards' },
    calcul: { name: 'Calcul', icon: 'sigma' }
  };
  const norm = (s) => RCMD.deaccent(String(s)).toLowerCase().replace(/[’`]/g, '\'').replace(/\s+/g, ' ').replace(/[.!;]+$/, '').trim();
  const normNum = (s) => (/^[\d\s]+$/.test(String(s).trim()) ? String(s).replace(/\s+/g, '') : norm(s));
  const parseNum = (s) => { const v = parseFloat(String(s).replace(/[−–]/g, '-').replace(/\s+/g, '').replace(',', '.').replace(/[^\d.eE+-]/g, '')); return isFinite(v) ? v : NaN; };
  const fmt = (v) => String(Math.round(v * 1000) / 1000).replace('.', ',');
  function shuffled(arr) {
    if (arr.length < 2) return arr.slice();
    let s;
    do { s = RC.shuffle(arr); } while (s.every((x, i) => x === arr[i]));
    return s;
  }
  const opts = (list, ph) => '<option value="">' + E(ph) + '</option>' + list.map((x) => '<option value="' + E(x) + '">' + E(x) + '</option>').join('');

  /* Crée la carte d'un exercice. onCheck(points, total) est appelé à chaque vérification. */
  function exerciseCard(ex, n, onCheck) {
    const card = document.createElement('section');
    card.className = 'card exo';
    const T = TYPES[ex.type];
    let total = 0, body = '', state = {};
    if (ex.type === 'trous') {
      let k = 0;
      const html = RCMD.render(ex.text.replace(/\[\[[^\]]+\]\]/g, () => '⟦' + k++ + '⟧')).html;
      body = '<div class="md exo-text">' + html.replace(/⟦(\d+)⟧/g, (m, i) => '<input class="blank input" data-b="' + i + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Trou ' + (+i + 1) + '" style="width:' + Math.min(16, Math.max(4, ex.blanks[i][0].length + 2)) + 'ch">') + '</div>';
      total = ex.blanks.length;
    } else if (ex.type === 'ordre') {
      state.order = shuffled(ex.items);
      total = ex.items.length;
    } else if (ex.type === 'paires') {
      state.rights = shuffled(ex.pairs.map((p) => p[1]));
      body = '<div class="pairs">' + ex.pairs.map((p, i) => '<div class="pair" data-i="' + i + '"><span class="pl">' + RCMD.inline(p[0]) + '</span><select class="input" aria-label="Associer à">' + opts(state.rights, '— choisir —') + '</select></div>').join('') + '</div>';
      total = ex.pairs.length;
    } else if (ex.type === 'classer') {
      const items = [];
      ex.cats.forEach((c) => c.items.forEach((it) => items.push({ it, cat: c.name })));
      state.items = shuffled(items);
      body = '<div class="pairs">' + state.items.map((x, i) => '<div class="pair" data-i="' + i + '"><span class="pl">' + RCMD.inline(x.it) + '</span><select class="input" aria-label="Catégorie">' + opts(ex.cats.map((c) => c.name), '— catégorie —') + '</select></div>').join('') + '</div>';
      total = items.length;
    } else if (ex.type === 'calcul') {
      body = '<div class="calc">' + ex.questions.map((q, i) => '<div class="calc-q" data-i="' + i + '"><div class="md">' + RCMD.render(q.q).html + '</div><div class="row"><input class="input calc-in" inputmode="decimal" autocomplete="off" aria-label="Résultat"><span class="unit">' + E(q.unit) + '</span></div><div class="calc-fb"></div></div>').join('') + '</div>';
      total = ex.questions.length;
    }
    card.innerHTML = '<div class="exo-head"><span class="s-icon">' + icon(T.icon) + '</span><div><div class="kicker">Exercice ' + n + ' · ' + T.name + '</div><h3>' + E(ex.title || T.name) + '</h3></div></div>' +
      '<div class="exo-body">' + body + '</div><div class="exo-fb" hidden></div>' +
      '<div class="row exo-actions"><button class="btn" data-a="check">' + icon('check') + ' Vérifier</button><button class="btn ghost sm" data-a="show">Voir la correction</button><button class="btn ghost sm" data-a="reset">' + icon('refresh') + ' Recommencer</button></div>';
    const bodyEl = $('.exo-body', card), fb = $('.exo-fb', card);

    function drawOrder(marks) {
      bodyEl.innerHTML = '<ol class="order">' + state.order.map((it, i) => '<li class="' + (marks ? (marks[i] ? 'ok' : 'ko') : '') + '"><span class="ord-n">' + (i + 1) + '</span><span class="ord-t">' + RCMD.inline(it) + '</span>' +
        '<span class="ord-b"><button class="icon-btn" data-mv="' + i + '" data-d="-1" aria-label="Monter"' + (i === 0 ? ' disabled' : '') + '>▲</button><button class="icon-btn" data-mv="' + i + '" data-d="1" aria-label="Descendre"' + (i === state.order.length - 1 ? ' disabled' : '') + '>▼</button></span></li>').join('') + '</ol>';
    }
    if (ex.type === 'ordre') drawOrder();

    function result(pts, details) {
      const okAll = pts === total;
      fb.hidden = false;
      fb.className = 'exo-fb ' + (okAll ? 'good' : 'bad');
      fb.innerHTML = '<b>' + (okAll ? 'Parfait ! ' : '') + pts + ' / ' + total + ' ' + (total > 1 ? 'bonnes réponses' : 'bonne réponse') + '</b>' + (details || '') + (ex.explain ? '<div class="md small" style="margin-top:6px">' + RCMD.render(ex.explain).html + '</div>' : '');
      onCheck(pts, total);
    }
    function check() {
      let pts = 0;
      if (ex.type === 'trous') {
        $$('.blank', card).forEach((inp) => {
          const ok = ex.blanks[+inp.dataset.b].some((a) => normNum(a) === normNum(inp.value));
          inp.classList.toggle('ok', ok); inp.classList.toggle('ko', !ok);
          if (ok) pts++;
        });
      } else if (ex.type === 'ordre') {
        const marks = state.order.map((it, i) => it === ex.items[i]);
        pts = marks.filter(Boolean).length;
        drawOrder(marks);
      } else if (ex.type === 'paires' || ex.type === 'classer') {
        $$('.pair', card).forEach((row) => {
          const i = +row.dataset.i, val = $('select', row).value;
          const ok = ex.type === 'paires' ? val === ex.pairs[i][1] : val === state.items[i].cat;
          row.classList.toggle('ok', ok); row.classList.toggle('ko', !ok);
          if (ok) pts++;
        });
      } else if (ex.type === 'calcul') {
        $$('.calc-q', card).forEach((row) => {
          const q = ex.questions[+row.dataset.i], v = parseNum($('.calc-in', row).value);
          const ok = isFinite(v) && Math.abs(v - q.value) <= q.tol + 1e-9;
          row.classList.toggle('ok', ok); row.classList.toggle('ko', !ok);
          $('.calc-fb', row).innerHTML = ok ? '<span class="status-ok">Juste !</span>' + (q.explain ? ' <span class="small">' + RCMD.inline(q.explain) + '</span>' : '') :
            '<span class="status-warn">Réponse attendue : ' + fmt(q.value) + ' ' + E(q.unit) + '</span>' + (q.explain ? '<div class="small">' + RCMD.inline(q.explain) + '</div>' : '');
          if (ok) pts++;
        });
      }
      result(pts);
    }
    function show() {
      if (ex.type === 'trous') $$('.blank', card).forEach((inp) => { inp.value = ex.blanks[+inp.dataset.b][0]; inp.classList.remove('ko'); inp.classList.add('ok'); });
      else if (ex.type === 'ordre') { state.order = ex.items.slice(); drawOrder(state.order.map(() => true)); }
      else if (ex.type === 'paires') $$('.pair', card).forEach((row) => { $('select', row).value = ex.pairs[+row.dataset.i][1]; row.classList.remove('ko'); row.classList.add('ok'); });
      else if (ex.type === 'classer') $$('.pair', card).forEach((row) => { $('select', row).value = state.items[+row.dataset.i].cat; row.classList.remove('ko'); row.classList.add('ok'); });
      else if (ex.type === 'calcul') $$('.calc-q', card).forEach((row) => { const q = ex.questions[+row.dataset.i]; $('.calc-in', row).value = fmt(q.value); $('.calc-fb', row).innerHTML = q.explain ? '<span class="small">' + RCMD.inline(q.explain) + '</span>' : ''; });
      fb.hidden = false; fb.className = 'exo-fb';
      fb.innerHTML = '<b>Correction affichée.</b> Relis-la, puis clique sur « Recommencer » pour t\'entraîner sans aide.' + (ex.explain ? '<div class="md small" style="margin-top:6px">' + RCMD.render(ex.explain).html + '</div>' : '');
    }
    function reset() {
      const fresh = exerciseCard(ex, n, onCheck);
      card.replaceWith(fresh);
    }
    card.addEventListener('click', (e) => {
      const mv = e.target.closest('[data-mv]');
      if (mv) {
        const i = +mv.dataset.mv, j = i + +mv.dataset.d;
        [state.order[i], state.order[j]] = [state.order[j], state.order[i]];
        drawOrder();
        const again = $('[data-mv="' + j + '"][data-d="' + mv.dataset.d + '"]', card) || $('[data-mv="' + j + '"]', card);
        if (again) again.focus();
        return;
      }
      const b = e.target.closest('[data-a]');
      if (!b) return;
      if (b.dataset.a === 'check') check();
      else if (b.dataset.a === 'show') show();
      else reset();
    });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input.blank, input.calc-in')) { e.preventDefault(); check(); } });
    return card;
  }

  /* ---------- Page d'exercices d'une fiche ---------- */
  App.route(/^\/fiche\/([^/]+)\/exercices$/, (v, [id]) => {
    const f = RC.fiche(id);
    if (!f) return App.notFound(v, 'Fiche introuvable');
    const s = RC.SUBJ[f.subject];
    App.setTitle('Exercices · ' + f.title);
    if (!f.exercises.length) {
      v.innerHTML = '<div class="card empty">' + icon('pen') + '<p>Pas encore d\'exercice pour cette fiche.</p><a class="btn" href="#/fiche/' + encodeURIComponent(f.id) + '">Retour à la fiche</a></div>';
      return;
    }
    const scores = {};
    let saved = false;
    v.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/matiere/' + s.id + '">' + E(s.name) + '</a><span>›</span><a href="#/fiche/' + encodeURIComponent(f.id) + '">' + E(f.title) + '</a></div>' +
      '<div class="page-head" style="--c:' + s.color + '"><h1>Exercices</h1><p>' + E(f.title) + ' · ' + plural(f.exercises.length, 'exercice') + '</p></div>' +
      '<div class="callout astuce"><div class="callout-title">Comment ça marche</div><p>Réponds, puis clique sur <b>Vérifier</b> : les erreurs s\'affichent en rouge. Pas d\'idée ? Relis la fiche, ou affiche la correction puis recommence sans aide.</p></div>' +
      '<div id="exos" class="exo-list"></div><div class="card section" id="exo-total"></div>';
    const list = $('#exos', v);
    const total = () => {
      const keys = Object.keys(scores), pts = keys.reduce((a, k) => a + scores[k][0], 0), max = keys.reduce((a, k) => a + scores[k][1], 0);
      $('#exo-total', v).innerHTML = '<div class="row between"><b>' + keys.length + ' / ' + f.exercises.length + ' exercices vérifiés</b><span>' + (max ? Math.round((pts / max) * 100) + ' % de réussite' : '') + '</span></div>' + bar(max ? pts / max : 0, s.color) +
        '<div class="row" style="margin-top:12px"><a class="btn secondary" href="#/fiche/' + encodeURIComponent(f.id) + '">Relire la fiche</a>' + (f.quiz.length ? '<a class="btn ghost" href="#/fiche/' + encodeURIComponent(f.id) + '/quiz">Faire le quiz</a>' : '') + '</div>';
      if (!saved && keys.length === f.exercises.length) {
        saved = true;
        const r = Store.saveQuiz('x:' + f.id, pts, max);
        App.toast('Exercices terminés : ' + Math.round((pts / max) * 100) + ' %' + (r.attempts > 1 ? ' (meilleur : ' + r.best + ' %)' : ''));
      }
    };
    f.exercises.forEach((ex, i) => list.appendChild(exerciseCard(ex, i + 1, (pts, max) => { scores[i] = [pts, max]; total(); })));
    total();
  });

  /* ---------- Exercices d'une matière ---------- */
  App.route(/^\/matiere\/([\w-]+)\/exercices$/, (v, [sid]) => {
    const s = RC.SUBJ[sid];
    if (!s) return App.notFound(v);
    App.setTitle('Exercices · ' + s.name);
    const list = RC.subjectFiches(sid).filter((f) => f.exercises.length);
    const trainers = (window.TRAINERS || []).filter((t) => t.subject === sid);
    v.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/entrainement">Exercices</a></div>' +
      '<div class="subject-head" style="--c:' + s.color + '">' + App.sIcon(s) + '<div><h1>Exercices · ' + E(s.name) + '</h1><p class="muted" style="margin:0">Textes à trous, remises en ordre, associations, classements et calculs.</p></div></div>' +
      (trainers.length ? '<div class="grid wide" style="margin-bottom:16px">' + trainers.map((t) => '<a class="card tool-card" style="--c:' + t.color + '" href="#/entrainement/' + t.id + '"><span class="s-icon">' + icon(t.icon) + '</span><div><h3>' + E(t.title) + ' <span class="badge info">infini</span></h3><p>' + E(t.desc) + '</p></div></a>').join('') + '</div>' : '') +
      (list.length ? '<div class="fiche-list">' + list.map((f, i) => {
        const q = Store.state.quiz['x:' + f.id];
        return '<a class="fiche-row" style="--c:' + s.color + '" href="#/fiche/' + encodeURIComponent(f.id) + '/exercices"><span class="num' + (q && q.best >= 80 ? ' done' : '') + '">' + (i + 1) + '</span><div class="body"><h3>' + E(f.title) + '</h3><p>' + f.exercises.map((x) => TYPES[x.type].name).join(' · ') + '</p>' +
          '<div class="badges"><span class="badge">' + plural(f.exercises.length, 'exercice') + '</span>' + (q ? '<span class="badge ' + (q.best >= 80 ? 'ok' : q.best >= 50 ? 'warn' : 'bad') + '">Meilleur : ' + q.best + ' %</span>' : '') + '</div></div>' + icon('right', 'chev') + '</a>';
      }).join('') + '</div>' : '<div class="card empty"><p>Pas encore d\'exercice dans cette matière.</p></div>');
  });

  App.exerciseTypes = TYPES;
})();
