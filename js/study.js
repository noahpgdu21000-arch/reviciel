/* RéviCIEL — sessions de révision : cartes mémoire, quiz, révision du jour, exercices */
(function () {
  'use strict';
  const { E, icon, $, $$, sIcon, bar, plural } = App;
  const md = (s) => RCMD.render(s).html;

  /* ---------- Choix des cartes : en retard > nouvelles > les moins sues ---------- */
  function prioritize(cards, n) {
    const t = Store.today();
    const rank = (c) => { const s = Store.cardInfo(c.id); if (!s) return 1; if (s.due <= t) return 0; return 2 + s.box; };
    return RC.shuffle(cards).map((c) => ({ c, r: rank(c) })).sort((a, b) => a.r - b.r).slice(0, n).map((x) => x.c);
  }

  /* ---------- Session de cartes mémoire ---------- */
  function flashSession(v, cards, opts) {
    const total = cards.length, results = [0, 0, 0], seen = new Set();
    let queue = cards.slice(), cur = null, flipped = false, done = 0;
    if (!total) {
      v.innerHTML = '<div class="card empty">' + icon('cards') + '<p>Aucune carte ici.</p><a class="btn" href="' + opts.back + '">Retour</a></div>';
      return;
    }
    function show() {
      if (!queue.length) return end();
      cur = queue.shift(); flipped = false;
      const s = RC.SUBJ[cur.fiche.subject];
      const again = seen.has(cur.id);
      v.innerHTML = '<div class="session" style="--c:' + s.color + '">' +
        '<div class="session-top"><a class="icon-btn" href="' + opts.back + '" aria-label="Quitter la session">' + icon('x') + '</a>' + bar(done / total, s.color) + '<span class="count">' + done + ' / ' + total + '</span></div>' +
        '<div class="fc-stage"><div class="fc" id="fc" tabindex="0" role="button" aria-label="Retourner la carte">' +
        '<div class="fc-face fc-front"><span class="label">' + (again ? 'À revoir · ' : '') + 'Question</span><div class="txt md">' + md(cur.q) + '</div><div class="from">' + E(s.name) + ' · ' + E(cur.fiche.title) + '</div></div>' +
        '<div class="fc-face fc-back"><span class="label">Réponse</span><div class="txt md">' + md(cur.a) + '</div><div class="from"><a href="#/fiche/' + encodeURIComponent(cur.fiche.id) + '">Voir la fiche</a></div></div>' +
        '</div></div><p class="fc-hint" id="hint">Réfléchis à la réponse, puis touche la carte (ou <span class="kbd">Espace</span>).</p>' +
        '<div class="grade" id="grade" hidden><button class="btn again" data-g="0">À revoir<small>je ne savais pas · 1</small></button>' +
        '<button class="btn hard" data-g="1">Hésitant<small>à moitié · 2</small></button>' +
        '<button class="btn good" data-g="2">Je savais<small>facile · 3</small></button></div></div>';
      const fc = $('#fc', v);
      fc.addEventListener('click', (e) => { if (!e.target.closest('a')) flip(); });
      $$('#grade button', v).forEach((b) => b.addEventListener('click', () => grade(+b.dataset.g)));
      fc.focus({ preventScroll: true });
    }
    function flip() {
      flipped = !flipped;
      $('#fc', v).classList.toggle('flipped', flipped);
      if (flipped) { $('#grade', v).hidden = false; $('#hint', v).textContent = 'Sois honnête : c\'est ce qui rend la révision efficace.'; }
    }
    function grade(g) {
      if (!flipped) return;
      Store.grade(cur.id, g);
      if (!seen.has(cur.id)) { seen.add(cur.id); results[g]++; done++; }
      if (g === 0) queue.push(cur);
      show();
    }
    function end() {
      App.renderNav();
      const ok = results[2], ratio = ok / total;
      v.innerHTML = '<div class="session"><div class="card result"><h2>Session terminée !</h2>' +
        '<div class="big">' + Math.round(ratio * 100) + ' %</div><p class="muted">de cartes sues du premier coup</p>' +
        '<div class="result-stats"><div><b style="color:var(--success)">' + results[2] + '</b><span>Je savais</span></div><div><b style="color:var(--warning)">' + results[1] + '</b><span>Hésitant</span></div><div><b style="color:var(--danger)">' + results[0] + '</b><span>À revoir</span></div></div>' +
        '<p class="small muted">Les cartes reviendront au bon moment : demain si tu as hésité, dans quelques jours si tu savais (méthode des boîtes de Leitner).</p>' +
        '<div class="row" style="justify-content:center"><a class="btn" href="' + opts.back + '">' + E(opts.backLabel || 'Terminer') + '</a>' +
        (opts.restart ? '<button class="btn secondary" id="restart">' + icon('refresh') + ' Recommencer</button>' : '') + '</div></div></div>';
      const r = $('#restart', v);
      if (r) r.onclick = opts.restart;
      App.setKeys(null);
    }
    App.setKeys((e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const ae = document.activeElement;
        if (ae && /^(A|BUTTON)$/.test(ae.tagName)) return;
        e.preventDefault();
        if (cur) flip();
      }
      else if (flipped && /^[123]$/.test(e.key)) grade(+e.key - 1);
    });
    show();
  }

  /* ---------- Session de quiz ---------- */
  function quizSession(v, questions, opts) {
    const qs = questions.map((q) => ({ q, order: RC.shuffle(q.options.map((_, k) => k)) }));
    let i = 0, score = 0, answered = false;
    const answers = [];
    if (!qs.length) { v.innerHTML = '<div class="card empty">' + icon('quiz') + '<p>Aucune question ici.</p><a class="btn" href="' + opts.back + '">Retour</a></div>'; return; }
    function show() {
      if (i >= qs.length) return end();
      answered = false;
      const { q, order } = qs[i], s = RC.SUBJ[q.fiche.subject];
      v.innerHTML = '<div class="session" style="--c:' + s.color + '">' +
        '<div class="session-top"><a class="icon-btn" href="' + opts.back + '" aria-label="Quitter le quiz">' + icon('x') + '</a>' + bar(i / qs.length, s.color) + '<span class="count">' + (i + 1) + ' / ' + qs.length + '</span></div>' +
        '<div class="card"><div class="small muted" style="margin-bottom:6px">' + E(s.name) + (opts.mixed ? ' · ' + E(q.fiche.title) : '') + '</div>' +
        '<div class="q-text md">' + md(q.q) + '</div><div class="options">' +
        order.map((k, n) => '<button class="option" data-k="' + k + '"><span class="key">' + 'ABCDEF'.charAt(n) + '</span><span>' + RCMD.inline(q.options[k]) + '</span></button>').join('') +
        '</div><div id="after"></div></div></div>';
      $$('.option', v).forEach((b) => b.addEventListener('click', () => answer(+b.dataset.k)));
    }
    function answer(k) {
      if (answered) return;
      answered = true;
      const { q } = qs[i], ok = k === q.answer;
      if (ok) score++;
      answers.push({ q, chosen: k, ok });
      $$('.option', v).forEach((b) => {
        const kk = +b.dataset.k;
        b.disabled = true;
        b.classList.add(kk === q.answer ? 'correct' : kk === k ? 'wrong' : 'dim');
      });
      $('#after', v).innerHTML = '<div class="explain ' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? 'Bonne réponse !' : 'Mauvaise réponse') + '</b>' +
        (!ok ? '<div>La bonne réponse : <b>' + RCMD.inline(q.options[q.answer]) + '</b></div>' : '') +
        (q.explain ? '<div class="md" style="margin-top:6px">' + md(q.explain) + '</div>' : '') + '</div>' +
        '<div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn" id="next">' + (i + 1 < qs.length ? 'Question suivante' : 'Voir mon score') + ' ' + icon('right') + '</button></div>';
      const nx = $('#next', v);
      nx.addEventListener('click', () => { i++; show(); window.scrollTo(0, 0); });
      nx.focus({ preventScroll: true });
    }
    function end() {
      App.setKeys(null);
      const pc = Math.round((score / qs.length) * 100);
      const res = Store.saveQuiz(opts.key || 'mix', score, qs.length);
      const msg = pc === 100 ? 'Parfait, rien à redire !' : pc >= 80 ? 'Très bien, c\'est presque acquis.' : pc >= 50 ? 'Pas mal ! Revois les points ratés.' : 'Il faut relire la fiche, puis retenter.';
      const wrong = answers.filter((a) => !a.ok);
      const toReview = Array.from(new Set(wrong.map((a) => a.q.fiche)));
      v.innerHTML = '<div class="session"><div class="card result"><h2>' + E(opts.title || 'Quiz terminé') + '</h2>' +
        '<div class="big" style="color:' + (pc >= 80 ? 'var(--success)' : pc >= 50 ? 'var(--warning)' : 'var(--danger)') + '">' + pc + ' %</div>' +
        '<p>' + score + ' bonne(s) réponse(s) sur ' + qs.length + ' — ' + msg + '</p>' +
        (opts.key && res.attempts > 1 ? '<p class="small muted">Meilleur score : ' + res.best + ' %</p>' : '') +
        '<div class="row" style="justify-content:center;margin-top:10px"><button class="btn" id="again">' + icon('refresh') + ' Recommencer</button>' +
        (wrong.length ? '<button class="btn secondary" id="errors">Refaire mes erreurs (' + wrong.length + ')</button>' : '') +
        '<a class="btn ghost" href="' + opts.back + '">' + E(opts.backLabel || 'Retour') + '</a></div></div>' +
        (wrong.length ? '<div class="card section"><h3>À revoir</h3>' + wrong.map((a) => '<div class="review-item"><div class="q">' + RCMD.inline(a.q.q.split('\n')[0]) + '</div>' +
          '<div class="small a-bad">' + RCMD.inline(a.q.options[a.chosen]) + '</div><div class="small a-ok">✓ ' + RCMD.inline(a.q.options[a.q.answer]) + '</div>' +
          (a.q.explain ? '<div class="small muted">' + RCMD.inline(a.q.explain.replace(/\n/g, ' ')) + '</div>' : '') + '</div>').join('') +
          (toReview.length ? '<p class="small" style="margin-top:12px">Fiches à relire : ' + toReview.map((f) => '<a href="#/fiche/' + encodeURIComponent(f.id) + '">' + E(f.title) + '</a>').join(' · ') + '</p>' : '') + '</div>' : '') + '</div>';
      $('#again', v).onclick = () => quizSession(v, RC.shuffle(questions), opts);
      const er = $('#errors', v);
      if (er) er.onclick = () => quizSession(v, wrong.map((a) => a.q), Object.assign({}, opts, { key: null }));
      App.renderNav();
    }
    App.setKeys((e) => {
      const k = e.key.toLowerCase();
      if (!answered) {
        const n = k.length === 1 ? '1234abcd'.indexOf(k) : -1;
        if (n !== -1) { const btn = $$('.option', v)[n % 4]; if (btn) btn.click(); }
      } else if (e.key === 'Enter' || e.key === ' ') { const nx = $('#next', v); if (nx && document.activeElement !== nx) { e.preventDefault(); nx.click(); } }
    });
    show();
  }

  /* ---------- Routes : cartes et quiz d'une fiche ou d'une matière ---------- */
  App.route(/^\/fiche\/([^/]+)\/cartes$/, (v, [id]) => {
    const f = RC.fiche(id);
    if (!f) return App.notFound(v, 'Fiche introuvable');
    App.setTitle('Cartes · ' + f.title);
    const back = '#/fiche/' + encodeURIComponent(f.id);
    const start = () => flashSession(v, RC.shuffle(f.cards), { back, backLabel: 'Retour à la fiche', restart: start });
    start();
  });
  App.route(/^\/fiche\/([^/]+)\/quiz$/, (v, [id]) => {
    const f = RC.fiche(id);
    if (!f) return App.notFound(v, 'Fiche introuvable');
    App.setTitle('Quiz · ' + f.title);
    quizSession(v, RC.shuffle(f.quiz), { back: '#/fiche/' + encodeURIComponent(f.id), backLabel: 'Retour à la fiche', key: 'f:' + f.id, title: 'Quiz : ' + f.title });
  });
  App.route(/^\/matiere\/([\w-]+)\/cartes$/, (v, [sid]) => {
    const s = RC.SUBJ[sid];
    if (!s) return App.notFound(v);
    App.setTitle('Cartes · ' + s.name);
    const all = RC.subjectFiches(sid).flatMap((f) => f.cards);
    const start = () => flashSession(v, prioritize(all, 20), { back: '#/matiere/' + sid, backLabel: 'Retour à la matière', restart: start });
    start();
  });
  App.route(/^\/matiere\/([\w-]+)\/quiz$/, (v, [sid]) => {
    const s = RC.SUBJ[sid];
    if (!s) return App.notFound(v);
    App.setTitle('Quiz · ' + s.name);
    const all = RC.subjectFiches(sid).flatMap((f) => f.quiz);
    quizSession(v, RC.shuffle(all).slice(0, 15), { back: '#/matiere/' + sid, backLabel: 'Retour à la matière', key: 's:' + sid, mixed: true, title: 'Quiz : ' + s.name });
  });

  /* ---------- Révision du jour ---------- */
  App.route(/^\/reviser$/, (v) => {
    App.setTitle('Révision du jour');
    const dq = RC.dailyQueue();
    const head = '<div class="page-head"><h1>Révision du jour</h1><p>Les cartes reviennent quand tu es sur le point de les oublier : quelques minutes par jour suffisent.</p></div>';
    if (!dq.queue.length) {
      v.innerHTML = head + '<div class="card empty">' + icon('check') + '<h2>Tout est à jour !</h2><p>Plus de carte prévue aujourd\'hui' + (RC.cards.length ? '' : ' (aucune carte disponible)') + '. Tu peux quand même t\'entraîner :</p>' +
        '<div class="row" style="justify-content:center"><button class="btn" id="extra">' + icon('shuffle') + ' 20 cartes au hasard</button><a class="btn secondary" href="#/quiz">Faire un quiz</a></div></div>';
      const x = $('#extra', v);
      if (x) x.onclick = () => flashSession(v, prioritize(RC.cards, 20), { back: '#/reviser', backLabel: 'Terminer' });
      return;
    }
    const bySubj = {};
    dq.queue.forEach((c) => { bySubj[c.fiche.subject] = (bySubj[c.fiche.subject] || 0) + 1; });
    v.innerHTML = head + '<div class="card"><div class="kpis" style="margin-bottom:16px">' +
      '<div class="kpi"><b>' + dq.due.length + '</b><span>cartes à revoir</span></div><div class="kpi"><b>' + dq.news.length + '</b><span>nouvelles cartes</span></div>' +
      '<div class="kpi"><b>~' + Math.max(1, Math.round(dq.queue.length * 0.25)) + ' min</b><span>temps estimé</span></div></div>' +
      '<div class="row" style="margin-bottom:16px">' + Object.keys(bySubj).map((sid) => '<span class="badge" style="background:color-mix(in srgb,' + RC.SUBJ[sid].color + ' 14%,var(--surface));color:' + RC.SUBJ[sid].color + '">' + E(RC.SUBJ[sid].name) + ' · ' + bySubj[sid] + '</span>').join('') + '</div>' +
      '<button class="btn lg" id="go">' + icon('cards') + ' Commencer</button></div>' +
      '<p class="small muted section">Nouvelles cartes par jour : ' + Store.state.settings.newPerDay + ' (modifiable dans les <a href="#/parametres">paramètres</a>). Les cartes des fiches que tu as marquées « lues » passent en premier.</p>';
    $('#go', v).onclick = () => flashSession(v, dq.queue, { back: '#/', backLabel: 'Retour à l\'accueil' });
  });

  /* ---------- Quiz mélangé ---------- */
  App.route(/^\/quiz$/, (v) => {
    App.setTitle('Quiz');
    const saved = Store.state.settings.quizSubjects;
    const subs = RC.SUBJECTS.filter((s) => RC.subjectFiches(s.id).some((f) => f.quiz.length));
    let count = Store.state.settings.quizCount || 10;
    const chip = (s) => '<label class="chip" style="--c:' + s.color + '"><input type="checkbox" value="' + s.id + '"' + (!saved || saved.indexOf(s.id) !== -1 ? ' checked' : '') + '> ' + E(s.name) + '</label>';
    v.innerHTML = '<div class="page-head"><h1>Quiz mélangé</h1><p>Des questions tirées au hasard dans les matières de ton choix.</p></div>' +
      '<div class="card stack">' + RC.GROUPS.concat([{ id: 'perso', name: 'Perso' }]).map((g) => {
        const list = subs.filter((s) => s.group === g.id);
        return list.length ? '<div><div class="row between" style="margin-bottom:8px"><b>' + E(g.name) + '</b><button class="btn ghost sm" data-all="' + g.id + '">Tout / rien</button></div><div class="row">' + list.map(chip).join('') + '</div></div>' : '';
      }).join('') +
      '<div><b>Nombre de questions</b><div class="seg" id="count" style="margin-top:8px">' + [10, 20, 30, 50].map((n) => '<button data-n="' + n + '" class="' + (n === count ? 'active' : '') + '">' + n + '</button>').join('') + '</div></div>' +
      '<div><button class="btn lg" id="go">' + icon('quiz') + ' Lancer le quiz</button> <span class="small muted" id="avail"></span></div></div>' +
      '<div class="grid wide section"><a class="card tool-card" style="--c:#dc2626" href="#/controle"><span class="s-icon">' + icon('clock') + '</span><div><h3>Mode contrôle</h3><p>Chronométré, sans correction pendant l’épreuve, noté sur 20 avec le corrigé.</p></div></a>' +
      '<a class="card tool-card" style="--c:#0d9488" href="#/planning"><span class="s-icon">' + icon('calendar') + '</span><div><h3>Planning avant un contrôle</h3><p>Donne la date et les chapitres : l’appli te dit quoi réviser chaque jour.</p></div></a></div>';
    const selected = () => $$('input[type=checkbox]', v).filter((c) => c.checked).map((c) => c.value);
    const pool = () => { const sel = selected(); return RC.questions.filter((q) => sel.indexOf(q.fiche.subject) !== -1); };
    const upd = () => { $('#avail', v).textContent = plural(pool().length, 'question disponible', 'questions disponibles'); };
    v.addEventListener('change', upd);
    v.addEventListener('click', (e) => {
      const all = e.target.closest('[data-all]');
      if (all) { const boxes = $$('input[type=checkbox]', v).filter((c) => RC.SUBJ[c.value].group === all.dataset.all); const on = !boxes.every((c) => c.checked); boxes.forEach((c) => { c.checked = on; }); upd(); }
      const n = e.target.closest('[data-n]');
      if (n) { count = +n.dataset.n; $$('#count button', v).forEach((b) => b.classList.toggle('active', b === n)); }
    });
    $('#go', v).onclick = () => {
      const p = pool();
      if (!p.length) { App.toast('Choisis au moins une matière.'); return; }
      Store.state.settings.quizSubjects = selected(); Store.setSetting('quizCount', count);
      App.setTitle('Quiz en cours');
      quizSession(v, RC.shuffle(p).slice(0, count), { back: '#/quiz', backLabel: 'Nouveau quiz', mixed: true, title: 'Quiz mélangé' });
    };
    upd();
  });

  /* ---------- Exercices interactifs ---------- */
  App.route(/^\/entrainement$/, (v) => {
    App.setTitle('Exercices');
    v.innerHTML = '<div class="page-head"><h1>Exercices interactifs</h1><p>Des exercices générés à l\'infini, corrigés pas à pas. Parfait avant un contrôle ou une épreuve pratique.</p></div>' +
      '<div class="section-head"><h2>Exercices par matière</h2></div><div class="grid" style="margin-bottom:22px">' +
      RC.SUBJECTS.filter((s) => RC.subjectFiches(s.id).some((f) => f.exercises.length)).map((s) => {
        const n = RC.subjectFiches(s.id).reduce((a, f) => a + f.exercises.length, 0);
        return '<a class="subject-card" style="--c:' + s.color + '" href="#/matiere/' + s.id + '/exercices">' + App.sIcon(s) + '<h3>' + E(s.name) + '</h3><div class="meta"><span>' + plural(n, 'exercice') + '</span></div></a>';
      }).join('') + '</div>' +
      '<div class="section-head"><h2>Entraînements infinis et labo</h2></div>' +
      '<a class="card tool-card lab-promo" style="--c:#0284c7;margin-bottom:14px" href="#/labo"><span class="s-icon">' + icon('network') + '</span><div style="flex:1"><h3>Labo réseau Cisco (simulateur)</h3><p>13 labs avec cours : VLAN, trunk, routage, DHCP, SSH, ACL, dépannage…</p></div>' + icon('right', 'chev') + '</a>' +
      '<div class="grid wide">' +
      window.TRAINERS.map((t) => {
        const st = Store.state.trainers[t.id];
        return '<a class="card tool-card" style="--c:' + t.color + '" href="#/entrainement/' + t.id + '"><span class="s-icon">' + icon(t.icon) + '</span><div><h3>' + E(t.title) + '</h3><p>' + E(t.desc) + '</p>' +
          (st ? '<div class="row" style="margin-top:8px"><span class="badge ok">' + Math.round((st.ok / st.total) * 100) + ' % réussis</span><span class="badge violet">Record : ' + st.best + ' d\'affilée</span></div>' : '') + '</div></a>';
      }).join('') + '</div>';
  });

  const INPUTMODE = { ipv4: 'text', conversions: 'text', ohm: 'decimal', resistances: 'text', pourcentages: 'decimal', verbes: 'text', electricite: 'decimal', algebre: 'text', salaire: 'decimal' };
  App.route(/^\/entrainement\/([\w-]+)$/, (v, [tid]) => {
    const t = window.TRAINERS.find((x) => x.id === tid);
    if (!t) return App.notFound(v, 'Exercice introuvable');
    App.setTitle(t.title);
    const sess = { ok: 0, total: 0 };
    let ex = null, answered = false;
    v.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/entrainement">Exercices</a></div><div class="session" style="--c:' + t.color + ';max-width:760px;margin:0">' +
      '<div class="subject-head">' + sIcon(t) + '<div><h1>' + E(t.title) + '</h1><p class="muted" style="margin:0">' + E(t.desc) + '</p></div></div>' +
      '<div class="score-line" id="score"></div><div class="card" id="ex"></div>' +
      (RC.SUBJ[t.subject] ? '<p class="small muted section">Le cours correspondant est dans <a href="#/matiere/' + t.subject + '">' + E(RC.SUBJ[t.subject].name) + '</a>.</p>' : '') + '</div>';
    const scoreLine = () => {
      const st = Store.state.trainers[t.id] || { streak: 0, best: 0 };
      $('#score', v).innerHTML = '<span class="badge ok">Session : ' + sess.ok + ' / ' + sess.total + '</span><span class="badge info">Série en cours : ' + st.streak + '</span><span class="badge violet">Record : ' + st.best + '</span>';
    };
    function next() {
      ex = t.generate(); answered = false;
      $('#ex', v).innerHTML = '<div class="trainer-q">' + ex.question + (ex.value ? '<div class="big-val">' + E(ex.value) + '</div>' : '') + '</div>' + (ex.extra || '') +
        '<form class="answer-row" id="af" autocomplete="off"><input class="input" id="ai" inputmode="' + (INPUTMODE[t.id] || 'text') + '" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="' + E(ex.placeholder || 'Ta réponse') + '" aria-label="Ta réponse">' +
        '<button class="btn" id="ab">Valider</button></form><div class="row" style="margin-top:10px"><button class="btn ghost sm" id="skip">Je ne sais pas, montre-moi</button></div><div id="fb"></div>';
      $('#af', v).addEventListener('submit', (e) => { e.preventDefault(); if (answered) next(); else check(false); });
      $('#skip', v).onclick = () => { if (!answered) check(true); };
      scoreLine();
      $('#ai', v).focus({ preventScroll: true });
    }
    function check(skip) {
      const val = $('#ai', v).value;
      if (!skip && !val.trim()) { $('#ai', v).focus(); return; }
      const ok = !skip && ex.check(val);
      answered = true;
      sess.total++; if (ok) sess.ok++;
      Store.trainerResult(t.id, ok);
      $('#fb', v).innerHTML = '<div class="feedback ' + (ok ? 'good' : 'bad') + '"><h3>' + (ok ? 'Bravo, c\'est juste !' : skip ? 'Voici la correction' : 'Pas tout à fait…') + '</h3>' +
        '<div>Réponse attendue : <b><code>' + E(ex.answer) + '</code></b></div><ol class="steps">' + ex.steps.map((s) => '<li>' + s + '</li>').join('') + '</ol></div>';
      $('#ab', v).textContent = 'Exercice suivant';
      $('#skip', v).hidden = true;
      $('#ab', v).focus();
      scoreLine();
    }
    next();
  });

  App.flashSession = flashSession;
  App.quizSession = quizSession;
})();
