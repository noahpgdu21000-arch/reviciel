/* RéviCIEL — mode Contrôle (noté sur 20, chronométré, corrigé à la fin) et planning de révision avant un contrôle */
(function () {
  'use strict';
  const { E, icon, $, $$, bar, plural } = App;
  const md = (s) => RCMD.render(s).html;
  const noteOf = (score, total) => (total ? Math.round((score / total) * 40) / 2 : 0);
  const fmt = (n) => String(n).replace('.', ',');
  const mention = (n) => (n >= 16 ? 'Très bien !' : n >= 14 ? 'Bien' : n >= 12 ? 'Assez bien' : n >= 10 ? 'Moyenne atteinte' : 'À retravailler');
  const noteColor = (n) => (n >= 14 ? 'var(--success)' : n >= 10 ? 'var(--warning)' : 'var(--danger)');
  const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const parse = (d) => { const p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  const dateFr = (d) => d.split('-').reverse().join('/');
  const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const dayLabel = (d) => { const t = Store.today(); if (d === t) return 'Aujourd\'hui'; if (d === Store.addDays(t, 1)) return 'Demain'; const s = JOURS[parse(d).getDay()]; return s.charAt(0).toUpperCase() + s.slice(1) + ' ' + dateFr(d).slice(0, 5); };
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const quizFiches = (sid) => RC.subjectFiches(sid).filter((f) => f.quiz.length);

  /* nom lisible d'un résultat de contrôle (clé « c:… » du journal des quiz) */
  App.ctrlLabel = (k) => {
    if (k.indexOf('c:p:') === 0) { const p = Store.state.plans.find((x) => x.id === k.slice(4)); return 'Contrôle blanc' + (p ? ' : ' + p.title : ''); }
    if (k.indexOf('c:s:') === 0) { const s = RC.SUBJ[k.slice(4)]; return 'Contrôle' + (s ? ' de ' + s.name : ''); }
    return 'Contrôle toutes matières';
  };

  /* ================= MODE CONTRÔLE ================= */
  App.route(/^\/controle$/, (v, _, params) => {
    App.setTitle('Mode contrôle');
    const plan = params.get('plan') ? Store.state.plans.find((p) => p.id === params.get('plan')) : null;
    const subs = RC.SUBJECTS.filter((s) => quizFiches(s.id).length);
    let sid = plan ? plan.subject : params.get('s') || '';
    let picked = plan ? plan.fiches.slice() : null;
    let count = Store.state.settings.ctrlCount || 20;
    let timed = Store.state.settings.ctrlTimed !== false;
    let iv = null;

    function history() {
      const log = (Store.state.quizLog || []).filter((x) => x.k.indexOf('c:') === 0).slice(-8).reverse();
      if (!log.length) return '';
      return '<div class="card section"><h2>Mes derniers contrôles</h2><ul class="list-plain">' + log.map((x) => {
        const n = noteOf(x.p, 100);
        return '<li class="row between"><span>' + E(App.ctrlLabel(x.k)) + ' <span class="small muted">· ' + dateFr(x.d) + ' · ' + x.n + ' questions</span></span><span class="badge ' + (n >= 14 ? 'ok' : n >= 10 ? 'warn' : 'bad') + '">' + fmt(n) + ' / 20</span></li>';
      }).join('') + '</ul></div>';
    }
    function pool() {
      if (!sid) return RC.questions;
      const ids = picked || quizFiches(sid).map((f) => f.id);
      return quizFiches(sid).filter((f) => ids.indexOf(f.id) !== -1).flatMap((f) => f.quiz);
    }
    function setup() {
      clearInterval(iv); App.setKeys(null);
      const fiches = sid ? quizFiches(sid) : [];
      v.innerHTML = '<div class="page-head"><h1>Mode contrôle</h1><p>Comme un vrai contrôle : pas de correction pendant l\'épreuve, un chrono, puis une <b>note sur 20</b> et le corrigé détaillé.</p></div>' +
        (plan ? '<div class="callout retenir"><div class="callout-title">' + icon('clock') + ' Contrôle blanc</div><p>Pour ton contrôle « ' + E(plan.title) + ' » du ' + dateFr(plan.date) + '.</p></div>' : '') +
        '<div class="card stack"><label class="field"><span><b>Matière</b></span><select class="input" id="c-sid"><option value="">Toutes les matières (mélange)</option>' +
        subs.map((s) => '<option value="' + s.id + '"' + (s.id === sid ? ' selected' : '') + '>' + E(s.name) + '</option>').join('') + '</select></label>' +
        (fiches.length ? '<div><div class="row between" style="margin-bottom:8px"><b>Chapitres</b><button class="btn ghost sm" id="c-all">Tout / rien</button></div><div class="check-list">' +
          fiches.map((f) => '<label class="check"><input type="checkbox" value="' + E(f.id) + '"' + (!picked || picked.indexOf(f.id) !== -1 ? ' checked' : '') + '> ' + E(f.title) + ' <span class="small muted">(' + f.quiz.length + ' q.)</span></label>').join('') + '</div></div>' : '') +
        '<div class="row" style="gap:24px"><div><b>Questions</b><div class="seg" id="c-count" style="margin-top:8px">' + [10, 20, 30].map((n) => '<button data-n="' + n + '" class="' + (n === count ? 'active' : '') + '">' + n + '</button>').join('') + '</div></div>' +
        '<div><b>Chrono</b><div class="seg" id="c-timed" style="margin-top:8px"><button data-t="1" class="' + (timed ? 'active' : '') + '">1 min par question</button><button data-t="0" class="' + (timed ? '' : 'active') + '">Sans chrono</button></div></div></div>' +
        '<div><button class="btn lg" id="c-go">' + icon('clock') + ' Commencer le contrôle</button> <span class="small muted" id="c-avail"></span></div></div>' + history();
      const upd = () => { const n = pool().length; $('#c-avail', v).textContent = plural(n, 'question disponible', 'questions disponibles') + (n && n < count ? ' : le contrôle en aura ' + n + '.' : ''); };
      $('#c-sid', v).onchange = (e) => { sid = e.target.value; picked = null; setup(); };
      const all = $('#c-all', v);
      if (all) all.onclick = () => { const boxes = $$('.check-list input', v); const on = !boxes.every((c) => c.checked); boxes.forEach((c) => { c.checked = on; }); picked = on ? null : []; upd(); };
      $$('.check-list input', v).forEach((c) => { c.onchange = () => { picked = $$('.check-list input', v).filter((x) => x.checked).map((x) => x.value); upd(); }; });
      $$('#c-count button', v).forEach((b) => { b.onclick = () => { count = +b.dataset.n; Store.setSetting('ctrlCount', count); $$('#c-count button', v).forEach((x) => x.classList.toggle('active', x === b)); upd(); }; });
      $$('#c-timed button', v).forEach((b) => { b.onclick = () => { timed = b.dataset.t === '1'; Store.setSetting('ctrlTimed', timed); $$('#c-timed button', v).forEach((x) => x.classList.toggle('active', x === b)); }; });
      $('#c-go', v).onclick = () => {
        const p = pool();
        if (p.length < 4) { App.toast('Pas assez de questions : choisis plus de chapitres.'); return; }
        const title = plan ? 'Contrôle blanc : ' + plan.title : sid ? 'Contrôle de ' + RC.SUBJ[sid].name : 'Contrôle toutes matières';
        run(RC.shuffle(p).slice(0, count), { title, key: plan ? 'c:p:' + plan.id : sid ? 'c:s:' + sid : 'c:mix', timed });
      };
      upd();
    }

    function run(questions, meta) {
      const qs = questions.map((q) => ({ q, order: RC.shuffle(q.options.map((_, k) => k)) }));
      const ans = qs.map(() => null);
      const total = meta.timed ? qs.length * 60 : null;
      const t0 = Date.now();
      let i = 0, over = false;
      App.setTitle('Contrôle en cours');
      const left = () => Math.max(0, total - Math.floor((Date.now() - t0) / 1000));
      function paint() {
        const { q, order } = qs[i], s = RC.SUBJ[q.fiche.subject];
        const nAns = ans.filter((a) => a != null).length;
        v.innerHTML = '<div class="session ctrl" style="--c:' + s.color + '">' +
          '<div class="ctrl-top card"><div style="flex:1;min-width:0"><b>' + E(meta.title) + '</b><div class="small muted">' + nAns + ' / ' + qs.length + ' réponses</div></div>' +
          (total != null ? '<span class="ctrl-timer" id="timer">' + icon('clock') + '<b>' + mmss(left()) + '</b></span>' : '') +
          '<button class="btn sm" data-finish>Rendre ma copie</button></div>' +
          '<div class="ctrl-grid" aria-label="Aller à une question">' + qs.map((x, k) => '<button data-go="' + k + '" class="' + (k === i ? 'cur ' : '') + (ans[k] != null ? 'done' : '') + '">' + (k + 1) + '</button>').join('') + '</div>' +
          '<div class="card"><div class="small muted" style="margin-bottom:6px">Question ' + (i + 1) + ' · ' + E(s.name) + '</div><div class="q-text md">' + md(q.q) + '</div><div class="options">' +
          order.map((k, n) => '<button class="option' + (ans[i] === k ? ' chosen' : '') + '" data-k="' + k + '" aria-pressed="' + (ans[i] === k) + '"><span class="key">' + 'ABCDEF'.charAt(n) + '</span><span>' + RCMD.inline(q.options[k]) + '</span></button>').join('') + '</div>' +
          '<div class="row between" style="margin-top:16px"><button class="btn secondary" data-prev' + (i ? '' : ' disabled') + '>' + icon('left') + ' Précédente</button>' +
          (i + 1 < qs.length ? '<button class="btn" data-next>Suivante ' + icon('right') + '</button>' : '<button class="btn" data-finish>Rendre ma copie</button>') + '</div></div></div>';
      }
      function go(k) { i = Math.max(0, Math.min(qs.length - 1, k)); paint(); window.scrollTo(0, 0); }
      v.onclick = (e) => {
        if (over) return;
        const b = e.target.closest('button');
        if (!b || !v.contains(b)) return;
        if (b.dataset.k != null) { ans[i] = +b.dataset.k; paint(); }
        else if (b.dataset.go != null) go(+b.dataset.go);
        else if (b.hasAttribute('data-prev')) go(i - 1);
        else if (b.hasAttribute('data-next')) go(i + 1);
        else if (b.hasAttribute('data-finish')) {
          const miss = ans.filter((a) => a == null).length;
          if (miss && !confirm('Il reste ' + plural(miss, 'question') + ' sans réponse. Rendre quand même ta copie ?')) return;
          finish(false);
        }
      };
      App.setKeys((e) => {
        const k = e.key.toLowerCase();
        const n = k.length === 1 ? 'abcd1234'.indexOf(k) : -1;
        if (n !== -1) { const btn = $$('.option', v)[n % 4]; if (btn) btn.click(); }
        else if (e.key === 'ArrowRight') go(i + 1);
        else if (e.key === 'ArrowLeft') go(i - 1);
      });
      if (total != null) {
        iv = setInterval(() => {
          const l = left(), el = $('#timer', v);
          if (el) { el.querySelector('b').textContent = mmss(l); el.classList.toggle('low', l <= 60); }
          if (l <= 0) finish(true);
        }, 1000);
      }
      function finish(timeout) {
        if (over) return;
        over = true; clearInterval(iv); App.setKeys(null); v.onclick = null;
        const score = qs.reduce((a, x, k) => a + (ans[k] === x.q.answer ? 1 : 0), 0);
        const note = noteOf(score, qs.length);
        Store.saveQuiz(meta.key, score, qs.length);
        const secs = Math.round((Date.now() - t0) / 1000);
        const byF = {};
        qs.forEach((x, k) => { const id = x.q.fiche.id; byF[id] = byF[id] || { f: x.q.fiche, ok: 0, n: 0 }; byF[id].n++; if (ans[k] === x.q.answer) byF[id].ok++; });
        const weak = Object.values(byF).filter((x) => x.ok / x.n < 0.7).sort((a, b) => a.ok / a.n - b.ok / b.n);
        App.setTitle('Résultat du contrôle');
        v.innerHTML = '<div class="session"><div class="card result">' + (timeout ? '<p class="badge warn">Temps écoulé : copie ramassée !</p>' : '') + '<h2>' + E(meta.title) + '</h2>' +
          '<div class="big" style="color:' + noteColor(note) + '">' + fmt(note) + '<span class="sur20"> / 20</span></div><p><b>' + mention(note) + '</b></p>' +
          '<div class="result-stats"><div><b>' + score + '/' + qs.length + '</b><span>bonnes réponses</span></div><div><b>' + mmss(secs) + '</b><span>temps passé</span></div><div><b>' + ans.filter((a) => a == null).length + '</b><span>sans réponse</span></div></div>' +
          '<div class="row" style="justify-content:center"><button class="btn" data-again>' + icon('refresh') + ' Nouveau contrôle</button>' + (plan ? '<a class="btn secondary" href="#/planning/' + plan.id + '">Mon planning</a>' : '') + '</div></div>' +
          (weak.length ? '<div class="card section"><h3>Chapitres à retravailler</h3><ul class="list-plain">' + weak.map((x) => '<li class="row between"><a href="#/fiche/' + encodeURIComponent(x.f.id) + '">' + E(x.f.title) + '</a><span class="badge bad">' + x.ok + '/' + x.n + '</span></li>').join('') + '</ul></div>' : '') +
          '<div class="card section"><h3>Corrigé</h3>' + qs.map((x, k) => {
            const a = ans[k], ok = a === x.q.answer;
            return '<div class="review-item"><div class="q"><b>' + (k + 1) + '.</b> ' + RCMD.inline(x.q.q.split('\n')[0]) + '</div>' +
              (a == null ? '<div class="small a-bad">Pas de réponse</div>' : '<div class="small ' + (ok ? 'a-ok' : 'a-bad') + '">' + (ok ? '✓ ' : '✗ ') + RCMD.inline(x.q.options[a]) + '</div>') +
              (ok ? '' : '<div class="small a-ok">✓ ' + RCMD.inline(x.q.options[x.q.answer]) + '</div>') +
              (x.q.explain ? '<div class="small muted">' + RCMD.inline(x.q.explain.replace(/\n/g, ' ')) + '</div>' : '') + '</div>';
          }).join('') + '</div></div>';
        $('[data-again]', v).onclick = setup;
        App.renderNav();
        window.scrollTo(0, 0);
      }
      paint();
    }

    setup();
    return () => { clearInterval(iv); };
  });

  /* ================= PLANNING AVANT UN CONTRÔLE ================= */
  function tasksOf(p) {
    const fiches = p.fiches.map((id) => RC.fiche(id)).filter(Boolean);
    const learn = [];
    fiches.forEach((f) => {
      learn.push({ key: 'lire:' + f.id, label: 'Lire la fiche « ' + f.title + ' »', href: '#/fiche/' + encodeURIComponent(f.id), auto: () => !!Store.state.read[f.id] });
      if (f.cards.length) learn.push({ key: 'cartes:' + f.id, label: 'Apprendre les cartes de « ' + f.title + ' »', href: '#/fiche/' + encodeURIComponent(f.id) + '/cartes', auto: () => f.cards.every((c) => !Store.isNew(c.id)) });
      if (f.quiz.length) learn.push({ key: 'quiz:' + f.id, label: 'Quiz de « ' + f.title + ' »', href: '#/fiche/' + encodeURIComponent(f.id) + '/quiz', auto: () => { const q = Store.state.quiz['f:' + f.id]; return !!q && q.date >= p.created; } });
      if (f.exercises && f.exercises.length) learn.push({ key: 'exos:' + f.id, label: 'Exercices de « ' + f.title + ' »', href: '#/fiche/' + encodeURIComponent(f.id) + '/exercices', auto: () => { const q = Store.state.quiz['x:' + f.id]; return !!q && q.date >= p.created; } });
    });
    const finalT = [
      { key: 'revoir', label: 'Revoir les cartes du jour', href: '#/reviser', auto: () => false },
      { key: 'controle', label: 'Contrôle blanc noté sur 20', href: '#/controle?plan=' + p.id, auto: () => (Store.state.quizLog || []).some((x) => x.k === 'c:p:' + p.id) }
    ];
    // jours de révision : de la création du planning à la veille du contrôle
    const start = p.created < p.date ? p.created : p.date;
    const nDays = Math.max(1, daysBetween(start, p.date));
    const days = [];
    for (let k = 0; k < nDays; k++) days.push({ date: Store.addDays(start, k), items: [] });
    if (nDays === 1) days[0].items = learn.concat(finalT);
    else {
      learn.forEach((t, k) => { days[Math.floor((k * (nDays - 1)) / learn.length)].items.push(t); });
      days[nDays - 1].items = days[nDays - 1].items.concat(finalT);
    }
    days.forEach((d) => d.items.forEach((t) => { t.done = !!(p.done && p.done[t.key]) || t.auto(); }));
    return days.filter((d) => d.items.length);
  }
  function planStatus(p) {
    const days = tasksOf(p), t = Store.today();
    const all = days.flatMap((d) => d.items);
    const done = all.filter((x) => x.done).length;
    const late = days.filter((d) => d.date < t).flatMap((d) => d.items).filter((x) => !x.done);
    const today = (days.find((d) => d.date === t) || { items: [] }).items;
    return { days, all, done, late, today, left: daysBetween(t, p.date) };
  }
  const whenTxt = (n) => (n < 0 ? 'passé' : n === 0 ? 'aujourd\'hui' : n === 1 ? 'demain' : 'dans ' + n + ' jours');
  function taskLi(p, t) {
    return '<li class="task' + (t.done ? ' done' : '') + '"><button class="tick" data-tick="' + E(t.key) + '" aria-label="' + (t.done ? 'Marquer à faire' : 'Marquer comme fait') + '">' + (t.done ? icon('check') : '') + '</button><a href="' + t.href + '">' + E(t.label) + '</a></li>';
  }

  /* carte « mon prochain contrôle » pour l'accueil */
  App.planHomeCard = () => {
    const t = Store.today();
    const next = Store.state.plans.filter((p) => p.date >= t).sort((a, b) => (a.date < b.date ? -1 : 1))[0];
    if (!next) return '';
    const st = planStatus(next), s = RC.SUBJ[next.subject] || RC.SUBJ.perso;
    const todo = st.late.concat(st.today).filter((x) => !x.done);
    return '<a class="card plan-card section" style="--c:' + s.color + '" href="#/planning/' + next.id + '"><span class="s-icon">' + icon('calendar') + '</span><div style="flex:1;min-width:0">' +
      '<div class="small muted">Contrôle ' + whenTxt(st.left) + ' · ' + E(s.name) + '</div><b>' + E(next.title) + '</b>' + bar(st.all.length ? st.done / st.all.length : 0, s.color) +
      '<div class="small" style="margin-top:6px">' + (todo.length ? 'Aujourd\'hui : ' + E(todo[0].label) + (todo.length > 1 ? ' (+' + (todo.length - 1) + ')' : '') : '✓ Rien d\'autre à faire aujourd\'hui') + '</div></div>' + icon('right', 'chev') + '</a>';
  };

  App.route(/^\/planning$/, (v) => {
    App.setTitle('Planning de révision');
    const t = Store.today();
    const subs = RC.SUBJECTS.filter((s) => RC.subjectFiches(s.id).length);
    let sid = subs[0] ? subs[0].id : '';
    function render() {
      const plans = Store.state.plans.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
      const coming = plans.filter((p) => p.date >= t), past = plans.filter((p) => p.date < t);
      const row = (p) => {
        const st = planStatus(p), s = RC.SUBJ[p.subject] || RC.SUBJ.perso;
        return '<a class="fiche-row" style="--c:' + s.color + '" href="#/planning/' + p.id + '"><span class="num">' + icon('calendar') + '</span><div class="body"><h3>' + E(p.title) + '</h3><p>' + E(s.name) + ' · ' + dateFr(p.date) + ' (' + whenTxt(st.left) + ')</p>' +
          '<div class="badges"><span class="badge ' + (st.done === st.all.length ? 'ok' : '') + '">' + st.done + ' / ' + st.all.length + ' tâches</span>' + (st.late.length && st.left >= 0 ? '<span class="badge warn">' + st.late.length + ' en retard</span>' : '') + '</div></div>' + icon('right', 'chev') + '</a>';
      };
      const fiches = RC.subjectFiches(sid);
      v.innerHTML = '<div class="page-head"><h1>Planning de révision</h1><p>Indique la date de ton contrôle et les chapitres : RéviCIEL te dit quoi réviser chaque jour, en petites étapes, jusqu\'au contrôle blanc la veille.</p></div>' +
        (coming.length ? '<section class="section"><div class="section-head"><h2>Mes prochains contrôles</h2></div><div class="fiche-list">' + coming.map(row).join('') + '</div></section>' : '') +
        '<section class="section"><div class="card stack" id="new-plan"><h2 style="margin:0">' + icon('plus') + ' Ajouter un contrôle</h2>' +
        '<div class="pc-grid" style="margin:0"><label class="field"><span>Matière</span><select class="input" id="p-sid">' + subs.map((s) => '<option value="' + s.id + '"' + (s.id === sid ? ' selected' : '') + '>' + E(s.name) + '</option>').join('') + '</select></label>' +
        '<label class="field"><span>Date du contrôle</span><input class="input" type="date" id="p-date" min="' + t + '" value="' + Store.addDays(t, 7) + '"></label>' +
        '<label class="field"><span>Nom (facultatif)</span><input class="input" id="p-title" maxlength="60" placeholder="Contrôle de ' + E((RC.SUBJ[sid] || {}).name || '') + '"></label></div>' +
        '<div><b>Chapitres au programme du contrôle</b><div class="check-list" style="margin-top:8px">' + fiches.map((f) => '<label class="check"><input type="checkbox" value="' + E(f.id) + '"> ' + E(f.title) + '</label>').join('') + '</div></div>' +
        '<div><button class="btn" id="p-add">' + icon('calendar') + ' Créer mon planning</button></div></div></section>' +
        (past.length ? '<section class="section"><div class="section-head"><h2>Contrôles passés</h2></div><div class="fiche-list">' + past.reverse().map(row).join('') + '</div></section>' : '');
      $('#p-sid', v).onchange = (e) => { sid = e.target.value; render(); };
      $('#p-add', v).onclick = () => {
        const ids = $$('.check-list input', v).filter((c) => c.checked).map((c) => c.value);
        const date = $('#p-date', v).value;
        if (!ids.length) { App.toast('Coche au moins un chapitre.'); return; }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < t) { App.toast('Choisis une date à partir d\'aujourd\'hui.'); return; }
        const title = $('#p-title', v).value.trim() || 'Contrôle de ' + RC.SUBJ[sid].name;
        const p = Store.addPlan({ id: 'pl' + Date.now().toString(36), title, subject: sid, fiches: ids, date, created: t, done: {} });
        App.toast('Planning créé !');
        location.hash = '#/planning/' + p.id;
      };
    }
    render();
  });

  App.route(/^\/planning\/([\w-]+)$/, (v, [id]) => {
    const p = Store.state.plans.find((x) => x.id === id);
    if (!p) return App.notFound(v, 'Planning introuvable');
    App.setTitle(p.title);
    function render() {
      const st = planStatus(p), s = RC.SUBJ[p.subject] || RC.SUBJ.perso, t = Store.today();
      v.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/planning">Planning</a><span>›</span><span>' + E(p.title) + '</span></div>' +
        '<div class="page-head"><h1>' + E(p.title) + '</h1><p>' + E(s.name) + ' · le ' + JOURS[parse(p.date).getDay()] + ' ' + dateFr(p.date) + ' (' + whenTxt(st.left) + ')</p></div>' +
        '<div class="card">' + bar(st.all.length ? st.done / st.all.length : 0, s.color) + '<div class="row between small" style="margin-top:8px"><span>' + st.done + ' / ' + st.all.length + ' tâches faites</span><span>Les tâches se cochent toutes seules quand tu les fais dans l\'appli.</span></div></div>' +
        (st.late.length && st.left >= 0 ? '<div class="card section plan-day late"><h3>' + icon('clock') + ' En retard</h3><ul class="tasks">' + st.late.map((x) => taskLi(p, x)).join('') + '</ul></div>' : '') +
        st.days.map((d) => '<div class="card section plan-day' + (d.date === t ? ' today' : d.date < t ? ' past' : '') + '"><h3>' + dayLabel(d.date) + '</h3><ul class="tasks">' + d.items.map((x) => taskLi(p, x)).join('') + '</ul></div>').join('') +
        '<div class="card section plan-day exam"><h3>' + icon('star') + ' ' + dayLabel(p.date) + ' : le contrôle !</h3><p class="small muted">Dors bien la veille et relis seulement tes cartes le matin.</p></div>' +
        '<div class="row section"><a class="btn secondary" href="#/controle?plan=' + p.id + '">' + icon('clock') + ' Contrôle blanc</a><button class="btn ghost" data-del>' + icon('trash') + ' Supprimer ce planning</button></div>';
    }
    v.addEventListener('click', (e) => {
      const tk = e.target.closest('[data-tick]');
      if (tk) { Store.togglePlanTask(p.id, tk.dataset.tick); render(); return; }
      if (e.target.closest('[data-del]') && confirm('Supprimer le planning « ' + p.title + ' » ?')) { Store.removePlan(p.id); location.hash = '#/planning'; }
    });
    render();
  });
})();
