/* RéviCIEL — pages : accueil, matière, fiche, recherche, favoris */
(function () {
  'use strict';
  const { E, icon, $, $$, sIcon, pct, bar, plural } = App;

  /* ---------- Ligne de fiche (réutilisée partout) ---------- */
  function ficheRow(f, n) {
    const s = RC.SUBJ[f.subject], st = RC.ficheStats(f), b = [];
    if (f.origin === 'user') b.push('<span class="badge violet">Perso</span>');
    if (st.read) b.push('<span class="badge ok">' + icon('check') + ' Lue</span>');
    if (st.cards) b.push('<span class="badge">' + st.mastered + '/' + st.cards + ' cartes sues</span>');
    if (st.quizBest != null) b.push('<span class="badge ' + (st.quizBest >= 80 ? 'ok' : st.quizBest >= 50 ? 'warn' : 'bad') + '">Quiz ' + st.quizBest + ' %</span>');
    if (st.due) b.push('<span class="badge info">' + st.due + ' à revoir</span>');
    if (Store.state.fav[f.id]) b.push('<span class="badge warn">' + icon('star') + ' Favori</span>');
    return '<a class="fiche-row" style="--c:' + s.color + '" href="#/fiche/' + encodeURIComponent(f.id) + '">' +
      '<span class="num' + (st.read ? ' done' : '') + '">' + (st.read ? icon('check') : n) + '</span>' +
      '<div class="body"><h3>' + E(f.title) + '</h3><p>' + E(f.summary || f.chapter || RC.SUBJ[f.subject].name) + '</p>' +
      (b.length ? '<div class="badges">' + b.join('') + '</div>' : '') + '</div>' + icon('right', 'chev') + '</a>';
  }
  App.ficheRow = ficheRow;

  /* ---------- Bandeau d'installation ---------- */
  function installSlot() {
    const P = window.PWA;
    if (!P || P.isStandalone() || Store.state.settings.installHidden) return '';
    let txt = '';
    if (P.canInstall()) txt = 'Installe RéviCIEL comme une vraie appli : icône sur l\'écran d\'accueil et révisions <b>sans connexion</b>.';
    else if (P.isIOS()) txt = 'Sur iPhone : touche <b>Partager</b> puis <b>« Sur l\'écran d\'accueil »</b> pour installer l\'appli et réviser sans connexion.';
    else return '';
    return '<div class="card install-banner section">' + '<span class="s-icon">' + icon('phone') + '</span><div style="flex:1"><b>Réviser hors ligne</b><br><span class="small">' + txt + '</span></div>' +
      (P.canInstall() ? '<button class="btn" data-act="install">Installer</button>' : '') +
      '<button class="icon-btn" data-act="hide-install" aria-label="Masquer">' + icon('x') + '</button></div>';
  }

  /* ---------- Accueil ---------- */
  App.route(/^\/$/, (v) => {
    App.setTitle('Accueil');
    const render = () => {
      const st = Store.state, dq = RC.dailyQueue();
      const readCount = RC.fiches.filter((f) => st.read[f.id]).length;
      const mastered = RC.cards.filter((c) => Store.isMastered(c.id)).length;
      const last = st.last && RC.fiche(st.last);
      const h = new Date().getHours();
      const hello = h >= 5 && h < 18 ? 'Bonjour' : 'Bonsoir';
      const todo = dq.due.length + dq.news.length;
      let html = '<section class="hero"><h1>' + hello + ' !</h1><p>' +
        (todo ? 'Au programme : <b>' + plural(dq.due.length, 'carte') + '</b> à revoir et <b>' + plural(dq.news.length, 'nouvelle carte', 'nouvelles cartes') + '</b>.' : 'Tes cartes du jour sont à jour. Bravo ! Lis une nouvelle fiche ou fais un quiz.') +
        '</p><div class="stats"><div class="stat"><b>' + Store.streak() + '</b><span>jour(s) d\'affilée</span></div>' +
        '<div class="stat"><b>' + readCount + '/' + RC.fiches.length + '</b><span>fiches lues</span></div>' +
        '<div class="stat"><b>' + mastered + '/' + RC.cards.length + '</b><span>cartes maîtrisées</span></div></div>' +
        '<div class="row"><a class="btn lg" href="#/reviser">' + icon('cards') + ' Révision du jour' + (todo ? ' (' + todo + ')' : '') + '</a>' +
        '<a class="btn lg glass" href="#/quiz">' + icon('quiz') + ' Quiz mélangé</a></div></section>';
      if (/github\.io$/.test(location.hostname)) {
        html += '<div class="card moved-banner section"><span class="s-icon">' + icon('globe') + '</span><div style="flex:1"><b>RéviCIEL déménage : <a href="https://reviciel.web.app/">reviciel.web.app</a></b>' +
          '<ol class="small"><li>Ici, crée ton compte dans <a href="#/compte">Mon compte</a> : ta progression et tes fiches sont sauvegardées en ligne.</li>' +
          '<li>Ouvre <b>reviciel.web.app</b> et connecte-toi avec le même compte : tout revient.</li><li>Réinstalle l’appli depuis le nouveau lien (et supprime l’ancienne icône).</li></ol></div></div>';
      }
      html += '<div id="install-slot">' + installSlot() + '</div>';
      if (App.planHomeCard) html += App.planHomeCard();
      if (last) {
        const s = RC.SUBJ[last.subject];
        html += '<a class="card resume-card section" style="--c:' + s.color + ';display:flex;color:inherit;text-decoration:none" href="#/fiche/' + encodeURIComponent(last.id) + '">' + sIcon(s) +
          '<div style="flex:1;min-width:0"><div class="small muted">Reprendre là où tu t\'es arrêté</div><b>' + E(last.title) + '</b><div class="small muted">' + E(s.name) + '</div></div>' + icon('right', 'chev') + '</a>';
      }
      RC.GROUPS.forEach((g) => {
        html += '<section class="section"><div class="section-head"><h2>' + E(g.name) + '</h2></div><div class="grid">';
        RC.SUBJECTS.filter((s) => s.group === g.id).forEach((s) => {
          const ss = RC.subjectStats(s.id);
          html += '<a class="subject-card" style="--c:' + s.color + '" href="#/matiere/' + s.id + '">' + sIcon(s) + '<h3>' + E(s.name) + '</h3>' +
            bar(ss.score, s.color) + '<div class="meta"><span>' + plural(ss.count, 'fiche') + '</span><span>' + pct(ss.score) + '</span></div></a>';
        });
        html += '</div></section>';
      });
      const labsDone = (window.LABS || []).filter((l) => (st.labs[l.id] || {}).done).length;
      html += '<section class="section"><a class="card tool-card lab-promo" style="--c:#0284c7" href="#/labo"><span class="s-icon">' + icon('network') + '</span><div style="flex:1"><h3>Labo réseau : switchs et routeurs Cisco</h3>' +
        '<p>Pose et câble des routeurs, des switchs et des PC, configure-les en Cisco IOS comme dans Packet Tracer : ' + (window.LABS || []).length + ' labs avec cours, ' + (window.DEFIS || []).length + ' défis et un mode libre.</p>' +
        '<div class="row" style="margin-top:8px"><span class="badge ok">' + labsDone + ' / ' + (window.LABS || []).length + ' labs réussis</span></div></div>' + icon('right', 'chev') + '</a></section>';
      html += '<section class="section"><div class="section-head"><h2>Exercices interactifs</h2><a href="#/entrainement" class="small">Tout voir</a></div><div class="grid wide">' +
        window.TRAINERS.map((t) => '<a class="card tool-card" style="--c:' + t.color + '" href="#/entrainement/' + t.id + '"><span class="s-icon">' + icon(t.icon) + '</span><div><h3>' + E(t.title) + '</h3><p>' + E(t.desc) + '</p></div></a>').join('') +
        '</div></section>';
      html += '<section class="section"><div class="grid wide">' +
        '<a class="card tool-card" style="--c:#7c3aed" href="#/mes-fiches"><span class="s-icon">' + icon('pen') + '</span><div><h3>Mes fiches</h3><p>Crée tes propres fiches avec cartes et quiz.</p></div></a>' +
        '<a class="card tool-card" style="--c:#d97706" href="#/favoris"><span class="s-icon">' + icon('star') + '</span><div><h3>Favoris</h3><p>' + plural(Object.keys(st.fav).length, 'fiche mise', 'fiches mises') + ' de côté.</p></div></a>' +
        '<a class="card tool-card" style="--c:#0d9488" href="#/progression"><span class="s-icon">' + icon('chart') + '</span><div><h3>Progression</h3><p>Ton avancement par matière.</p></div></a>' +
        '</div></section>';
      v.innerHTML = html;
    };
    render();
    v.addEventListener('click', async (e) => {
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'install') { await window.PWA.install(); render(); }
      if (a.dataset.act === 'hide-install') { Store.setSetting('installHidden', true); $('#install-slot', v).innerHTML = ''; }
    });
    const onPwa = () => { const slot = $('#install-slot', v); if (slot) slot.innerHTML = installSlot(); };
    window.addEventListener('pwa-change', onPwa);
    return () => window.removeEventListener('pwa-change', onPwa);
  });

  /* ---------- Page d'une matière ---------- */
  App.route(/^\/matiere\/([\w-]+)$/, (v, [sid]) => {
    const s = RC.SUBJ[sid];
    if (!s) return App.notFound(v, 'Matière introuvable');
    App.setTitle(s.name);
    const list = RC.subjectFiches(sid), st = RC.subjectStats(sid);
    const nCards = list.reduce((a, f) => a + f.cards.length, 0), nQ = list.reduce((a, f) => a + f.quiz.length, 0);
    const g = RC.GROUPS.find((x) => x.id === s.group);
    let html = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><span>' + E(g ? g.name : 'Perso') + '</span></div>' +
      '<div class="subject-head" style="--c:' + s.color + '">' + sIcon(s) + '<div><h1>' + E(s.name) + '</h1><p class="muted" style="margin:0">' + E(s.desc) + '</p></div></div>';
    if (list.length) {
      html += '<div class="card" style="--c:' + s.color + '">' + bar(st.score, s.color) +
        '<div class="row between small" style="margin:8px 0 14px"><span>' + st.read + '/' + st.count + ' fiches lues · ' + st.mastered + '/' + st.cards + ' cartes maîtrisées</span><b>' + pct(st.score) + ' maîtrisé</b></div><div class="row">' +
        (nCards ? '<a class="btn" href="#/matiere/' + sid + '/cartes">' + icon('cards') + ' Réviser les cartes</a>' : '') +
        (nQ ? '<a class="btn secondary" href="#/matiere/' + sid + '/quiz">' + icon('quiz') + ' Quiz de la matière</a>' : '') +
        (list.some((f) => f.exercises.length) ? '<a class="btn secondary" href="#/matiere/' + sid + '/exercices">' + icon('pen') + ' Exercices</a>' : '') + '</div></div>';
      html += '<div class="fiche-list section">' + list.map((f, i) => ficheRow(f, i + 1)).join('') + '</div>';
    } else {
      html += '<div class="card empty">' + icon('pen') + '<p>Aucune fiche ici pour l\'instant.</p><a class="btn" href="#/editeur">' + icon('plus') + ' Créer une fiche</a></div>';
    }
    if (sid !== 'perso' && list.length) html += '<p class="small muted section">Il manque un chapitre ? <a href="#/editeur?matiere=' + sid + '">Crée ta propre fiche</a> : elle apparaîtra dans cette matière.</p>';
    v.innerHTML = html;
  });

  /* ---------- Lecture d'une fiche ---------- */
  function speak(f, btn) {
    const synth = window.speechSynthesis;
    if (synth.speaking) { synth.cancel(); btn.innerHTML = icon('volume') + ' Écouter'; return; }
    const text = [f.title, f.summary, f.plain].join('.\n');
    const parts = text.replace(/([.!?:])\s+/g, '$1\n').split(/\n+/).map((t) => t.trim()).filter(Boolean);
    const voice = synth.getVoices().find((x) => /^fr/i.test(x.lang));
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p);
      u.lang = 'fr-FR'; if (voice) u.voice = voice; u.rate = 1;
      if (i === parts.length - 1) u.onend = () => { btn.innerHTML = icon('volume') + ' Écouter'; };
      synth.speak(u);
    });
    btn.innerHTML = icon('stop') + ' Arrêter';
  }
  function duplicate(f) {
    const id = 'perso-' + Date.now().toString(36);
    const src = f.src.replace(/^---\n([\s\S]*?)\n---/, (m, head) => '---\n' + head.split('\n').map((l) => {
      if (/^\s*id\s*:/i.test(l)) return 'id: ' + id;
      if (/^\s*titre\s*:/i.test(l)) return 'titre: ' + f.title + ' (ma version)';
      return l;
    }).join('\n') + '\n---');
    Store.upsertUserFiche(id, src);
    RC.load(); App.renderNav();
    App.toast('Copie créée dans « Mes fiches ». Modifie-la comme tu veux !');
    App.go('#/editeur/' + id);
  }

  App.route(/^\/fiche\/([^/]+)$/, (v, [id]) => {
    const f = RC.fiche(id);
    if (!f) return App.notFound(v, 'Fiche introuvable');
    const s = RC.SUBJ[f.subject];
    App.setTitle(f.title);
    Store.setLast(f.id);
    const r = RCMD.render(f.body), st = RC.ficheStats(f), fav = !!Store.state.fav[f.id];
    const minutes = Math.max(1, Math.round(f.words / 170));
    const list = RC.subjectFiches(f.subject), idx = list.indexOf(f);
    const prev = list[idx - 1], next = list[idx + 1];
    const hasToc = r.headings.length >= 3;
    const tocLinks = r.headings.map((h) => '<a href="#/fiche/' + encodeURIComponent(f.id) + '" data-goto="' + E(h.id) + '">' + E(h.text) + '</a>').join('');
    const enc = encodeURIComponent(f.id);
    v.innerHTML = '<div class="crumbs"><a href="#/">Accueil</a><span>›</span><a href="#/matiere/' + s.id + '">' + E(s.name) + '</a></div>' +
      '<div class="fiche-layout' + (hasToc ? ' has-toc' : '') + '"><article id="fiche">' +
      '<header class="fiche-header" style="--c:' + s.color + '"><div class="kicker">' + E(f.chapter || s.name) + '</div><h1>' + E(f.title) + '</h1>' +
      (f.summary ? '<p>' + E(f.summary) + '</p>' : '') + '<div class="fiche-meta"><span class="badge">' + icon('clock') + ' ' + minutes + ' min de lecture</span>' +
      (f.cards.length ? '<span class="badge">' + icon('cards') + ' ' + plural(f.cards.length, 'carte') + '</span>' : '') +
      (f.quiz.length ? '<span class="badge">' + icon('quiz') + ' ' + plural(f.quiz.length, 'question') + '</span>' : '') +
      (f.origin === 'user' ? '<span class="badge violet">Fiche perso</span>' : '') + '</div></header>' +
      '<div class="fiche-actions">' +
      (f.cards.length ? '<a class="btn" href="#/fiche/' + enc + '/cartes">' + icon('cards') + ' Cartes mémoire</a>' : '') +
      (f.quiz.length ? '<a class="btn secondary" href="#/fiche/' + enc + '/quiz">' + icon('quiz') + ' Quiz</a>' : '') +
      (f.exercises.length ? '<a class="btn secondary" href="#/fiche/' + enc + '/exercices">' + icon('pen') + ' Exercices (' + f.exercises.length + ')</a>' : '') +
      '<button class="btn ghost' + (fav ? ' on' : '') + '" data-act="fav" aria-pressed="' + fav + '">' + icon('star') + ' <span>' + (fav ? 'Favori' : 'Favori ?') + '</span></button>' +
      '<button class="btn ghost" data-act="hide" aria-pressed="false" title="Cache les mots surlignés : touche-les pour vérifier">' + icon('eyeoff') + ' Mode caché</button>' +
      ('speechSynthesis' in window ? '<button class="btn ghost" data-act="speak">' + icon('volume') + ' Écouter</button>' : '') +
      '<button class="btn ghost" data-act="print">' + icon('printer') + ' Imprimer</button>' +
      (f.origin === 'user' ? '<a class="btn ghost" href="#/editeur/' + enc + '">' + icon('pen') + ' Modifier</a>' : '<button class="btn ghost" data-act="dup" title="Copier cette fiche dans « Mes fiches » pour la modifier">' + icon('copy') + ' Personnaliser</button>') +
      '</div>' +
      (hasToc ? '<details class="toc-mobile card"><summary>Sommaire</summary>' + tocLinks + '</details>' : '') +
      '<div class="md" id="fiche-body">' + (r.html || '<p class="muted">Cette fiche n\'a pas encore de contenu.</p>') + '</div>' +
      '<div class="fiche-end"><div class="row">' +
      '<button class="btn lg ' + (st.read ? 'success' : 'soft') + '" data-act="read">' + icon('check') + ' ' + (st.read ? 'Fiche lue' : 'J\'ai lu et compris cette fiche') + '</button>' +
      (f.cards.length ? '<a class="btn lg secondary" href="#/fiche/' + enc + '/cartes">' + icon('cards') + ' Tester avec les cartes</a>' : '') +
      (f.exercises.length ? '<a class="btn lg secondary" href="#/fiche/' + enc + '/exercices">' + icon('pen') + ' Faire les exercices</a>' : '') + '</div>' +
      '<div class="pager">' + (prev ? '<a class="prev" href="#/fiche/' + encodeURIComponent(prev.id) + '"><span>‹ Précédente</span>' + E(prev.title) + '</a>' : '') +
      (next ? '<a class="next" href="#/fiche/' + encodeURIComponent(next.id) + '"><span>Suivante ›</span>' + E(next.title) + '</a>' : '') + '</div></div>' +
      '</article>' + (hasToc ? '<aside class="toc"><h4>Sommaire</h4>' + tocLinks + '</aside>' : '') + '</div>';

    const art = $('#fiche', v);
    v.addEventListener('click', (e) => {
      const go = e.target.closest('[data-goto]');
      if (go) { e.preventDefault(); const t = document.getElementById(go.dataset.goto); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const mk = e.target.closest('mark');
      if (mk && art.classList.contains('hide-marks')) { mk.classList.toggle('revealed'); return; }
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'fav') {
        const on = Store.toggleFav(f.id);
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.querySelector('span').textContent = on ? 'Favori' : 'Favori ?';
        App.toast(on ? 'Ajoutée aux favoris' : 'Retirée des favoris');
      } else if (act === 'hide') {
        const on = art.classList.toggle('hide-marks');
        b.setAttribute('aria-pressed', on); b.classList.toggle('on', on);
        if (on) { $$('mark', art).forEach((m) => m.classList.remove('revealed')); App.toast($$('mark', art).length ? 'Mots clés cachés : touche-les pour vérifier ta réponse.' : 'Cette fiche n\'a pas de mots surlignés.'); }
      } else if (act === 'speak') speak(f, b);
      else if (act === 'print') window.print();
      else if (act === 'dup') duplicate(f);
      else if (act === 'read') {
        const now = !Store.state.read[f.id];
        Store.setRead(f.id, now);
        b.className = 'btn lg ' + (now ? 'success' : 'soft');
        b.innerHTML = icon('check') + ' ' + (now ? 'Fiche lue' : 'J\'ai lu et compris cette fiche');
        if (now) App.toast(f.cards.length ? 'Bien joué ! Teste-toi maintenant avec les cartes.' : 'Fiche marquée comme lue.');
        App.renderNav();
      }
    });

    // Barre de progression de lecture
    const barEl = document.createElement('div');
    barEl.className = 'reading-bar';
    document.body.appendChild(barEl);
    const onScroll = () => {
      const rect = art.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      barEl.style.width = Math.max(0, Math.min(100, (-rect.top / Math.max(1, total)) * 100)) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); barEl.remove(); };
  });

  /* ---------- Recherche ---------- */
  App.route(/^\/recherche$/, (v, _, params) => {
    App.setTitle('Recherche');
    const q0 = params.get('q') || '';
    v.innerHTML = '<div class="page-head"><h1>Recherche</h1><p>Cherche une notion dans toutes les fiches (titres, cours et cartes).</p></div>' +
      '<div class="search-big"><input class="input" id="sq" type="search" placeholder="Ex. : masque, Ohm, Verdun, présent perfect…" value="' + E(q0) + '" autocomplete="off"></div><div id="sr" class="fiche-list"></div>';
    const inp = $('#sq', v), out = $('#sr', v);
    const run = () => {
      const q = inp.value.trim();
      if (q.length < 2) { out.innerHTML = '<p class="muted">Tape au moins 2 lettres.</p>'; return; }
      const res = RC.search(q);
      out.innerHTML = res.length ? '<p class="muted small">' + plural(res.length, 'fiche trouvée', 'fiches trouvées') + '</p>' + res.slice(0, 40).map((r) => {
        const s = RC.SUBJ[r.f.subject];
        return '<a class="result-row" style="--c:' + s.color + '" href="#/fiche/' + encodeURIComponent(r.f.id) + '"><div class="kicker">' + E(s.name) + '</div><h3>' + E(r.f.title) + '</h3><p>' + r.snippet + '</p></a>';
      }).join('') : '<div class="empty">' + icon('search') + '<p>Aucun résultat pour « ' + E(q) + ' ».</p></div>';
      history.replaceState(null, '', '#/recherche?q=' + encodeURIComponent(q));
    };
    inp.addEventListener('input', App.debounce(run, 120));
    run();
    const top = document.getElementById('search-input');
    if (document.activeElement !== top) inp.focus();
  });

  /* ---------- Favoris ---------- */
  App.route(/^\/favoris$/, (v) => {
    App.setTitle('Favoris');
    const list = RC.fiches.filter((f) => Store.state.fav[f.id]);
    v.innerHTML = '<div class="page-head"><h1>Favoris</h1><p>Les fiches que tu as mises de côté (bouton « Favori » sur une fiche).</p></div>' +
      (list.length ? '<div class="fiche-list">' + list.map((f, i) => ficheRow(f, i + 1)).join('') + '</div>' :
        '<div class="card empty">' + icon('star') + '<p>Pas encore de favori. Ouvre une fiche et touche « Favori ? ».</p><a class="btn" href="#/">Parcourir les matières</a></div>');
  });
})();
