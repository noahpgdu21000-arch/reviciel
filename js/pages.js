/* RéviCIEL — pages : progression et paramètres */
(function () {
  'use strict';
  const { E, icon, $, $$, bar, pct, plural } = App;

  /* ---------- Progression ---------- */
  App.route(/^\/progression$/, (v) => {
    App.setTitle('Progression');
    const st = Store.state;
    const readCount = RC.fiches.filter((f) => st.read[f.id]).length;
    const seen = RC.cards.filter((c) => !Store.isNew(c.id)).length;
    const mastered = RC.cards.filter((c) => Store.isMastered(c.id)).length;
    const log = st.quizLog || [];
    const avg = log.length ? Math.round(log.slice(-30).reduce((a, x) => a + x.p, 0) / Math.min(30, log.length)) : null;

    // Calendrier d'activité (16 dernières semaines)
    const days = 16 * 7, t = Store.today();
    const start = new Date(); start.setDate(start.getDate() - days + 1);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // commence un lundi
    let heat = '';
    for (let d = new Date(start); Store.today(d) <= t; d.setDate(d.getDate() + 1)) {
      const k = Store.today(d), n = st.activity[k] || 0;
      const lvl = n === 0 ? '' : n < 5 ? 'l1' : n < 15 ? 'l2' : n < 30 ? 'l3' : 'l4';
      heat += '<i class="' + lvl + '" title="' + k.split('-').reverse().join('/') + ' : ' + n + ' activité(s)"></i>';
    }

    let html = '<div class="page-head"><h1>Ma progression</h1><p>Tout est enregistré sur cet appareil. Pense à faire une sauvegarde dans les <a href="#/parametres">paramètres</a>.</p></div>' +
      '<div class="kpis"><div class="kpi"><b>' + Store.streak() + '</b><span>jour(s) d\'affilée</span></div>' +
      '<div class="kpi"><b>' + readCount + '/' + RC.fiches.length + '</b><span>fiches lues</span></div>' +
      '<div class="kpi"><b>' + seen + '</b><span>cartes étudiées</span></div>' +
      '<div class="kpi"><b>' + mastered + '</b><span>cartes maîtrisées</span></div>' +
      '<div class="kpi"><b>' + (avg == null ? '—' : avg + ' %') + '</b><span>moyenne aux quiz</span></div></div>';

    html += '<div class="card section"><h2>Par matière</h2><p class="small muted">Maîtrise = fiches lues + cartes sues + meilleur score au quiz.</p><div class="subj-progress">' +
      RC.SUBJECTS.filter((s) => RC.subjectFiches(s.id).length).map((s) => {
        const ss = RC.subjectStats(s.id);
        return '<a class="line" href="#/matiere/' + s.id + '" style="--c:' + s.color + ';color:inherit;text-decoration:none"><span class="name"><i></i>' + E(s.name) + '</span>' + bar(ss.score, s.color) + '<span class="pct">' + pct(ss.score) + '</span></a>';
      }).join('') + '</div></div>';

    html += '<div class="card section"><h2>Activité</h2><p class="small muted">Chaque carte, quiz, exercice ou fiche lue compte.</p><div class="heat">' + heat + '</div></div>';

    // Cartes par boîte de Leitner
    const boxes = [0, 0, 0, 0, 0, 0];
    RC.cards.forEach((c) => { const i = Store.cardInfo(c.id); boxes[i ? i.box : 0]++; });
    const maxB = Math.max(1, ...boxes);
    html += '<div class="card section"><h2>Mes cartes par boîte</h2><p class="small muted">Boîte 1 : revue chaque jour… boîte 5 : revue tous les 30 jours. Une carte est « maîtrisée » à partir de la boîte 4.</p><div class="subj-progress">' +
      ['Jamais vues', 'Boîte 1', 'Boîte 2', 'Boîte 3', 'Boîte 4', 'Boîte 5'].map((lab, i) => '<div class="line" style="--c:' + ['#94a3b8', '#dc2626', '#f97316', '#eab308', '#22c55e', '#15803d'][i] + '"><span class="name"><i></i>' + lab + '</span>' + bar(boxes[i] / maxB) + '<span class="pct">' + boxes[i] + '</span></div>').join('') + '</div></div>';

    const recent = log.slice(-10).reverse();
    if (recent.length) {
      html += '<div class="card section"><h2>Derniers quiz</h2><ul class="list-plain">' + recent.map((x) => {
        let name = 'Quiz mélangé';
        if (x.k.indexOf('f:') === 0) { const f = RC.fiche(x.k.slice(2)); name = f ? f.title : 'Fiche supprimée'; }
        else if (x.k.indexOf('s:') === 0) { const s = RC.SUBJ[x.k.slice(2)]; name = 'Quiz ' + (s ? s.name : ''); }
        return '<li class="row between"><span>' + E(name) + ' <span class="small muted">· ' + x.d.split('-').reverse().join('/') + '</span></span><span class="badge ' + (x.p >= 80 ? 'ok' : x.p >= 50 ? 'warn' : 'bad') + '">' + x.p + ' %</span></li>';
      }).join('') + '</ul></div>';
    }
    const tr = window.TRAINERS.filter((x) => st.trainers[x.id]);
    if (tr.length) {
      html += '<div class="card section"><h2>Exercices</h2><ul class="list-plain">' + tr.map((x) => {
        const s = st.trainers[x.id];
        return '<li class="row between"><a href="#/entrainement/' + x.id + '">' + E(x.title) + '</a><span class="small">' + s.ok + '/' + s.total + ' réussis · record ' + s.best + '</span></li>';
      }).join('') + '</ul></div>';
    }
    v.innerHTML = html;
  });

  /* ---------- Paramètres ---------- */
  App.route(/^\/parametres$/, (v) => {
    App.setTitle('Paramètres');
    const render = () => {
      const s = Store.state.settings, P = window.PWA;
      const seg = (key, opts) => '<div class="seg" data-key="' + key + '">' + opts.map((o) => '<button data-v="' + o[0] + '" class="' + (String(s[key]) === String(o[0]) ? 'active' : '') + '">' + o[1] + '</button>').join('') + '</div>';
      let appStatus;
      if (location.protocol === 'file:') appStatus = '<span class="status-warn">Ouvert depuis un fichier</span><br><span class="small">Tout fonctionne sans connexion, mais pour l\'installer comme une appli il faut l\'ouvrir depuis une adresse web (voir le mode d\'emploi).</span>';
      else if (P && P.isStandalone()) appStatus = '<span class="status-ok">✓ Appli installée</span>' + (P.offlineReady() ? ' · <span class="status-ok">disponible hors connexion</span>' : '');
      else if (P && P.offlineReady()) appStatus = '<span class="status-ok">✓ Disponible hors connexion</span><br><span class="small">Le site est enregistré sur cet appareil.</span>';
      else appStatus = '<span class="status-warn">Préparation du mode hors connexion…</span><br><span class="small">Recharge la page une fois connecté si ce message reste affiché.</span>';
      v.innerHTML = '<div class="page-head"><h1>Paramètres</h1></div>' +
        '<div class="card"><h2>Affichage</h2>' +
        '<div class="settings-row"><div class="lbl"><b>Thème</b><span>Auto suit le réglage de ton appareil.</span></div>' + seg('theme', [['auto', 'Auto'], ['light', 'Clair'], ['dark', 'Sombre']]) + '</div>' +
        '<div class="settings-row"><div class="lbl"><b>Taille du texte</b></div>' + seg('fontSize', [['m', 'Normale'], ['l', 'Grande']]) + '</div>' +
        '<div class="settings-row"><div class="lbl"><b>Nouvelles cartes par jour</b><span>Dans la révision du jour.</span></div>' + seg('newPerDay', [[10, '10'], [20, '20'], [30, '30'], [50, '50']]) + '</div></div>' +
        '<div class="card section"><h2>Application</h2>' +
        '<div class="settings-row"><div class="lbl"><b>Mode hors connexion</b><span>' + appStatus + '</span></div></div>' +
        (P && P.canInstall() ? '<div class="settings-row"><div class="lbl"><b>Installer l\'appli</b><span>Ajoute RéviCIEL à ton écran d\'accueil ou à ton PC.</span></div><button class="btn" data-act="install">' + icon('phone') + ' Installer</button></div>' : '') +
        (P && P.isIOS() && !P.isStandalone() ? '<div class="settings-row"><div class="lbl"><b>Installer sur iPhone / iPad</b><span>Dans Safari : bouton Partager → « Sur l\'écran d\'accueil ».</span></div></div>' : '') +
        (P && P.reg ? '<div class="settings-row"><div class="lbl"><b>Mises à jour</b><span>Version du contenu : ' + E((window.REVICIEL_CONTENT || {}).version || '?') + '</span></div><button class="btn secondary" data-act="update">' + icon('refresh') + ' Vérifier</button></div>' : '') +
        '</div>' +
        '<div class="card section"><h2>Mes données</h2><p class="small muted">Ta progression et tes fiches perso sont enregistrées uniquement dans ce navigateur. Exporte une sauvegarde pour les transférer sur un autre appareil.</p>' +
        '<div class="settings-row"><div class="lbl"><b>Sauvegarder</b><span>Fichier .json (progression + fiches perso).</span></div><button class="btn secondary" data-act="export">' + icon('download') + ' Exporter</button></div>' +
        '<div class="settings-row"><div class="lbl"><b>Restaurer</b><span>Remplace la progression de cet appareil.</span></div><button class="btn secondary" data-act="import">' + icon('upload') + ' Importer</button></div>' +
        '<div class="settings-row"><div class="lbl"><b>Remettre à zéro</b><span>Efface la progression (pas tes fiches perso).</span></div><button class="btn danger" data-act="reset">' + icon('trash') + ' Réinitialiser</button></div></div>' +
        '<div class="card section"><h2>À propos</h2><p>RéviCIEL — révisions de Première Bac Pro CIEL : ' + plural(RC.fiches.length, 'fiche') + ', ' + plural(RC.cards.length, 'carte') + ', ' + plural(RC.questions.length, 'question') + ' de quiz et ' + window.TRAINERS.length + ' exercices générés.</p>' +
        '<p class="small muted">Les fiches résument le programme : en cas de doute, ton cours et ton professeur font foi. Raccourcis : <span class="kbd">Espace</span> retourne une carte, <span class="kbd">1</span> <span class="kbd">2</span> <span class="kbd">3</span> notent, <span class="kbd">A</span>–<span class="kbd">D</span> répondent au quiz.</p></div>';
    };
    render();
    v.addEventListener('click', async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const segEl = b.closest('.seg');
      if (segEl && b.dataset.v != null) {
        const key = segEl.dataset.key;
        Store.setSetting(key, key === 'newPerDay' ? +b.dataset.v : b.dataset.v);
        App.applySettings(); App.renderNav(); render();
        return;
      }
      const act = b.dataset.act;
      if (act === 'install') { await window.PWA.install(); render(); }
      else if (act === 'update') { App.toast('Recherche de mise à jour…'); window.PWA.checkUpdate().then((found) => { if (!found) App.toast('Tu as déjà la dernière version.'); }); }
      else if (act === 'export') {
        App.download('reviciel-sauvegarde-' + Store.today() + '.json', JSON.stringify(Store.exportAll(), null, 1), 'application/json');
        App.toast('Sauvegarde téléchargée.');
      } else if (act === 'import') {
        const [file] = await App.pickFiles('.json,application/json', false);
        if (!file) return;
        try {
          const data = JSON.parse(await App.readFile(file));
          if (!confirm('Restaurer cette sauvegarde ? La progression actuelle de cet appareil sera remplacée.')) return;
          Store.importAll(data);
          RC.load(); App.applySettings(); App.renderNav(); render();
          App.toast('Sauvegarde restaurée !');
        } catch (err) { App.toast('Import impossible : ' + err.message); }
      } else if (act === 'reset') {
        if (confirm('Effacer toute ta progression (fiches lues, cartes, quiz, exercices) ? Tes fiches perso sont conservées. Action irréversible.')) {
          Store.resetProgress(); App.renderNav(); render(); App.toast('Progression remise à zéro.');
        }
      }
    });
    const onPwa = () => render();
    window.addEventListener('pwa-change', onPwa);
    return () => window.removeEventListener('pwa-change', onPwa);
  });
})();
