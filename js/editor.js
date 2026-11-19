/* RéviCIEL — « Mes fiches » : créer, modifier, importer et exporter ses propres fiches */
(function () {
  'use strict';
  const { E, icon, $, $$, plural } = App;

  const TEMPLATE = [
    '## Le cours',
    '',
    'Écris ici ton cours. Tu peux mettre **du gras**, ==des mots clés surlignés== (cachés en « mode caché ») et des listes :',
    '',
    '- un point important',
    '- un autre point',
    '',
    '> [!retenir]',
    '> La phrase à connaître par cœur.',
    '',
    '=== CARTES ===',
    'Q: Ma question ?',
    'R: Ma réponse.',
    '',
    '=== QUIZ ===',
    '? Ma question à choix multiple ?',
    '- une mauvaise réponse',
    '+ la bonne réponse',
    '- une autre mauvaise réponse',
    '! Une explication affichée après la réponse (facultatif).',
    ''
  ].join('\n');

  const HELP = '<details class="card section help"><summary><b>Aide : comment écrire une fiche ?</b></summary>' +
    '<p>Le texte s\'écrit en <b>Markdown</b> simplifié :</p><pre>## Titre de partie\n### Sous-titre\n**gras**   *italique*   ==surligné==   `code`\nH~2~O (indice)   x^2^ (exposant)\n- liste à puces\n1. liste numérotée\n| Colonne 1 | Colonne 2 |\n|---|---|\n| case | case |\n\n> [!retenir]      (aussi : definition, exemple,\n> Texte encadré     attention, astuce, formule)</pre>' +
    '<p>Ensuite, les <b>cartes mémoire</b> après la ligne <code>=== CARTES ===</code> :</p><pre>Q: La question\nR: La réponse (peut faire plusieurs lignes)</pre>' +
    '<p>Et le <b>quiz</b> après <code>=== QUIZ ===</code> : une ligne <code>?</code> pour la question, <code>-</code> pour chaque mauvaise réponse, <code>+</code> pour la bonne, <code>!</code> pour l\'explication.</p>' +
    '<p>Et des <b>exercices</b> après <code>=== EXERCICES ===</code> :</p><pre># trous : Complète\nLe droit de grève date de [[1864]].\n# ordre : Remets dans l\'ordre\n- premier\n- deuxième\n- troisième\n# paires : Associe\n- 15 = SAMU\n- 18 = Pompiers\n- 112 = Urgence européenne\n# classer : Classe\nPrimaire : agriculteur, pêcheur\nTertiaire : vendeuse, infirmier\n# calcul : Calcule\n? 230 V × 2 A = ? (en W)\n= 460 W\n! P = U × I</pre></details>';

  function newId() { return 'perso-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function bodyOf(src) { return String(src || '').replace(/\r\n?/g, '\n').replace(/^---\n[\s\S]*?\n---[ \t]*(\n|$)/, '').replace(/^\n+/, ''); }
  function withId(src, id) {
    src = String(src).replace(/\r\n?/g, '\n').replace(/^﻿/, '');
    if (/^---\n[\s\S]*?\n---/.test(src)) {
      return src.replace(/^---\n([\s\S]*?)\n---/, (m, head) => {
        const lines = head.split('\n').filter((l) => !/^\s*id\s*:/i.test(l));
        return '---\nid: ' + id + '\n' + lines.join('\n') + '\n---';
      });
    }
    return '---\nid: ' + id + '\ntitre: Fiche importée\n---\n\n' + src;
  }
  function reload() { RC.load(); App.renderNav(); }

  /* ---------- Import ---------- */
  async function importFiles() {
    const files = await App.pickFiles('.md,.txt,.json,text/markdown,text/plain,application/json', true);
    if (!files.length) return 0;
    let n = 0;
    for (const file of files) {
      try {
        const text = await App.readFile(file);
        if (/\.json$/i.test(file.name)) {
          const data = JSON.parse(text);
          const list = Array.isArray(data.userFiches) ? data.userFiches : Array.isArray(data) ? data : [];
          list.forEach((u) => {
            if (!u || typeof u.src !== 'string') return;
            const id = typeof u.id === 'string' && /^perso-/.test(u.id) ? u.id : newId();
            Store.upsertUserFiche(id, withId(u.src, id)); n++;
          });
        } else {
          const parsed = RCMD.parseFiche(text);
          const id = /^perso-/.test(parsed.id) ? parsed.id : newId();
          Store.upsertUserFiche(id, withId(text, id)); n++;
        }
      } catch (err) { App.toast('« ' + file.name + ' » : ' + err.message); }
    }
    reload();
    App.toast(n ? plural(n, 'fiche importée', 'fiches importées') + ' !' : 'Aucune fiche trouvée dans ce fichier.');
    return n;
  }

  /* ---------- Liste « Mes fiches » ---------- */
  App.route(/^\/mes-fiches$/, (v) => {
    App.setTitle('Mes fiches');
    const render = () => {
      const list = Store.userFiches.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0)).map((u) => RC.fiche(u.id)).filter(Boolean);
      v.innerHTML = '<div class="page-head"><h1>Mes fiches</h1><p>Crée tes propres fiches (avec cartes et quiz) : elles s\'ajoutent à la matière choisie et à la révision du jour.</p></div>' +
        '<div class="row" style="margin-bottom:18px"><a class="btn" href="#/editeur">' + icon('plus') + ' Nouvelle fiche</a>' +
        '<button class="btn secondary" data-act="import">' + icon('upload') + ' Importer (.md / .json)</button>' +
        (list.length ? '<button class="btn ghost" data-act="export-all">' + icon('download') + ' Tout exporter</button>' : '') + '</div>' +
        (list.length ? '<div class="fiche-list">' + list.map((f) => {
          const s = RC.SUBJ[f.subject], u = Store.userFiches.find((x) => x.id === f.id);
          const date = u && u.updated ? new Date(u.updated).toLocaleDateString('fr-FR') : '';
          return '<div class="fiche-row" style="--c:' + s.color + '"><span class="num">' + icon('pen') + '</span><div class="body"><h3><a href="#/fiche/' + encodeURIComponent(f.id) + '">' + E(f.title) + '</a></h3>' +
            '<p>' + E(s.name) + (date ? ' · modifiée le ' + date : '') + ' · ' + plural(f.cards.length, 'carte') + ' · ' + plural(f.quiz.length, 'question') + '</p>' +
            (f.errors.length ? '<div class="badges"><span class="badge bad">' + plural(f.errors.length, 'erreur') + ' de format</span></div>' : '') + '</div>' +
            '<div class="row" style="flex:none"><a class="btn ghost sm" href="#/editeur/' + encodeURIComponent(f.id) + '">' + icon('pen') + ' Modifier</a>' +
            '<button class="btn ghost sm" data-act="export" data-id="' + E(f.id) + '" aria-label="Exporter">' + icon('download') + '</button>' +
            '<button class="btn ghost sm" data-act="delete" data-id="' + E(f.id) + '" aria-label="Supprimer">' + icon('trash') + '</button></div></div>';
        }).join('') + '</div>' :
          '<div class="card empty">' + icon('pen') + '<h2>Aucune fiche perso pour l\'instant</h2><p>Crée ta première fiche, importe un fichier .md, ou ouvre une fiche officielle et touche « Personnaliser » pour la copier.</p></div>') +
        HELP;
    };
    render();
    v.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act, id = b.dataset.id;
      if (act === 'import') { await importFiles(); render(); }
      else if (act === 'export-all') {
        App.download('mes-fiches-reviciel.json', JSON.stringify({ app: 'RéviCIEL', format: 1, type: 'fiches', userFiches: Store.userFiches }, null, 1), 'application/json');
      } else if (act === 'export') {
        const u = Store.userFiches.find((x) => x.id === id), f = RC.fiche(id);
        if (u) App.download(App.fileSlug(f ? f.title : id) + '.md', u.src, 'text/markdown');
      } else if (act === 'delete') {
        const f = RC.fiche(id);
        if (confirm('Supprimer définitivement la fiche « ' + (f ? f.title : id) + ' » ? (Pense à l\'exporter avant si tu veux la garder.)')) {
          Store.deleteUserFiche(id); reload(); render(); App.toast('Fiche supprimée.');
        }
      }
    });
  });

  /* ---------- Éditeur ---------- */
  App.route(/^\/editeur(?:\/([^/]+))?$/, (v, [id], params) => {
    const existing = id ? Store.userFiches.find((u) => u.id === id) : null;
    if (id && !existing) return App.notFound(v, 'Fiche perso introuvable');
    const fid = id || newId();
    const p = existing ? RCMD.parseFiche(existing.src) : null;
    let data = {
      titre: p ? p.title : '',
      matiere: p ? p.subject : (RC.SUBJ[params.get('matiere')] ? params.get('matiere') : 'perso'),
      chapitre: p ? p.chapter : '',
      resume: p ? p.summary : '',
      motscles: p ? p.tags.join(', ') : '',
      body: existing ? bodyOf(existing.src) : TEMPLATE
    };
    const draftKey = id || 'nouvelle';
    const draft = Store.getDraft();
    let restored = false;
    if (draft && draft.key === draftKey && draft.data && JSON.stringify(draft.data) !== JSON.stringify(data)) { data = Object.assign(data, draft.data); restored = true; }
    App.setTitle(existing ? 'Modifier · ' + data.titre : 'Nouvelle fiche');

    const opts = RC.SUBJECTS.map((s) => '<option value="' + s.id + '"' + (s.id === data.matiere ? ' selected' : '') + '>' + E(s.name) + '</option>').join('');
    v.innerHTML = '<div class="crumbs"><a href="#/mes-fiches">Mes fiches</a><span>›</span><span>' + (existing ? 'Modifier' : 'Nouvelle fiche') + '</span></div>' +
      '<div class="page-head row between"><h1 style="margin:0">' + (existing ? 'Modifier ma fiche' : 'Nouvelle fiche') + '</h1><div class="row">' +
      (existing ? '<button class="btn danger" id="del">' + icon('trash') + ' Supprimer</button>' : '') +
      '<a class="btn ghost" href="' + (existing ? '#/fiche/' + encodeURIComponent(fid) : '#/mes-fiches') + '" id="cancel">Annuler</a><button class="btn" id="save">' + icon('check') + ' Enregistrer</button></div></div>' +
      (restored ? '<div class="callout info" id="restored"><div class="callout-title">Brouillon restauré</div><p>Tes modifications non enregistrées ont été récupérées. <button class="btn ghost sm" id="discard">Les abandonner</button></p></div>' : '') +
      '<div class="editor-meta">' +
      '<div class="field"><label for="ed-titre">Titre *</label><input class="input" id="ed-titre" value="' + E(data.titre) + '" placeholder="Ex. : Le modèle OSI" maxlength="120"></div>' +
      '<div class="field"><label for="ed-matiere">Matière</label><select class="input" id="ed-matiere">' + opts + '</select></div>' +
      '<div class="field"><label for="ed-chapitre">Chapitre (facultatif)</label><input class="input" id="ed-chapitre" value="' + E(data.chapitre) + '" placeholder="Ex. : Réseaux — bases"></div>' +
      '<div class="field"><label for="ed-resume">Résumé (facultatif)</label><input class="input" id="ed-resume" value="' + E(data.resume) + '" placeholder="Une phrase qui résume la fiche"></div>' +
      '</div>' +
      '<div class="seg editor-tabs" id="tabs"><button class="active" data-pane="write">Écrire</button><button data-pane="preview">Aperçu</button></div>' +
      '<div class="editor-grid"><div class="pane" data-pane="write"><div class="toolbar" id="tb">' +
      [['h', 'Titre'], ['b', 'Gras'], ['m', 'Surligné'], ['ul', 'Liste'], ['tbl', 'Tableau'], ['call', 'Encadré'], ['card', '+ Carte'], ['q', '+ Question']].map((x) => '<button type="button" data-ins="' + x[0] + '">' + x[1] + '</button>').join('') +
      '</div><textarea class="editor-area" id="ed-body" spellcheck="true" aria-label="Contenu de la fiche">' + E(data.body) + '</textarea><div class="parse-info" id="info"></div></div>' +
      '<div class="pane" data-pane="preview" hidden><div class="preview-pane"><div class="md" id="preview"></div></div></div></div>' + HELP;

    const els = { titre: $('#ed-titre', v), matiere: $('#ed-matiere', v), chapitre: $('#ed-chapitre', v), resume: $('#ed-resume', v), body: $('#ed-body', v) };
    let dirty = restored;
    const collect = () => ({ titre: els.titre.value.trim(), matiere: els.matiere.value, chapitre: els.chapitre.value.trim(), resume: els.resume.value.trim(), motscles: data.motscles, body: els.body.value });
    const build = (d) => RCMD.buildSource({ id: fid, matiere: d.matiere, titre: d.titre || 'Sans titre', chapitre: d.chapitre, resume: d.resume, 'mots-cles': d.motscles }, d.body);
    function refresh() {
      const d = collect(), f = RCMD.parseFiche(build(d));
      $('#preview', v).innerHTML = '<h1 style="font-size:1.5rem">' + E(d.titre || 'Sans titre') + '</h1>' + RCMD.render(f.body).html +
        (f.cards.length ? '<h2>Cartes (' + f.cards.length + ')</h2><ol>' + f.cards.map((c) => '<li><b>' + RCMD.inline(c.q.split('\n')[0]) + '</b><br>' + RCMD.inline(c.a.split('\n')[0]) + '</li>').join('') + '</ol>' : '') +
        (f.quiz.length ? '<h2>Quiz (' + f.quiz.length + ')</h2><ol>' + f.quiz.map((q) => '<li>' + RCMD.inline(q.q.split('\n')[0]) + ' <span class="muted">→ ' + RCMD.inline(q.options[q.answer]) + '</span></li>').join('') + '</ol>' : '');
      $('#info', v).innerHTML = '<span>' + plural(f.cards.length, 'carte') + ' · ' + plural(f.quiz.length, 'question') + ' détectée(s)</span>' +
        f.errors.map((er) => '<div class="err">⚠ ' + E(er) + '</div>').join('');
    }
    const saveDraft = App.debounce(() => { if (dirty) Store.setDraft({ key: draftKey, data: collect() }); }, 400);
    const onInput = App.debounce(refresh, 250);
    v.addEventListener('input', (e) => { if (e.target.closest('.editor-meta, #ed-body')) { dirty = true; onInput(); saveDraft(); } });
    v.addEventListener('change', (e) => { if (e.target === els.matiere) { dirty = true; saveDraft(); } });

    // Barre d'outils : insertion de modèles
    const SNIP = {
      h: ['\n## ', 'Titre de partie', '\n'], b: ['**', 'texte en gras', '**'], m: ['==', 'mot clé', '=='],
      ul: ['\n- ', 'premier point', '\n- deuxième point\n'], tbl: ['\n| Colonne 1 | Colonne 2 |\n|---|---|\n| ', 'case', ' | case |\n'],
      call: ['\n> [!retenir]\n> ', 'Ce qu\'il faut retenir.', '\n'], card: ['\nQ: ', 'Ma question ?', '\nR: Ma réponse.\n'],
      q: ['\n? ', 'Ma question ?', '\n- mauvaise réponse\n+ bonne réponse\n- mauvaise réponse\n! Explication.\n']
    };
    $('#tb', v).addEventListener('click', (e) => {
      const b = e.target.closest('[data-ins]');
      if (!b) return;
      const ta = els.body, [pre, def, post] = SNIP[b.dataset.ins];
      let s = ta.selectionStart, en = ta.selectionEnd;
      const sel = ta.value.slice(s, en) || def;
      let before = pre;
      if (b.dataset.ins === 'card' && !/=== *CARTES *===/i.test(ta.value)) before = '\n=== CARTES ===' + pre;
      if (b.dataset.ins === 'q' && !/=== *(QUIZ|QCM) *===/i.test(ta.value)) { s = en = ta.value.length; before = '\n\n=== QUIZ ===' + pre; }
      ta.setRangeText(before + sel + post, s, en, 'end');
      ta.focus();
      const start = s + before.length;
      ta.setSelectionRange(start, start + sel.length);
      dirty = true; refresh(); saveDraft();
    });
    els.body.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); els.body.setRangeText('  ', els.body.selectionStart, els.body.selectionEnd, 'end'); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
    });
    $('#tabs', v).addEventListener('click', (e) => {
      const b = e.target.closest('[data-pane]');
      if (!b) return;
      $$('#tabs button', v).forEach((x) => x.classList.toggle('active', x === b));
      $$('.editor-grid .pane', v).forEach((p) => { p.hidden = p.dataset.pane !== b.dataset.pane; });
      if (b.dataset.pane === 'preview') refresh();
    });

    function save() {
      const d = collect();
      if (!d.titre) { App.toast('Donne un titre à ta fiche.'); els.titre.focus(); return; }
      const ok = Store.upsertUserFiche(fid, build(d));
      if (!ok) { App.toast('Enregistrement impossible : le stockage du navigateur est plein ou bloqué.'); return; }
      Store.clearDraft(); dirty = false;
      reload();
      App.toast('Fiche enregistrée !');
      App.go('#/fiche/' + encodeURIComponent(fid));
    }
    $('#save', v).onclick = save;
    $('#cancel', v).addEventListener('click', () => { Store.clearDraft(); dirty = false; });
    const disc = $('#discard', v);
    if (disc) disc.onclick = () => { Store.clearDraft(); dirty = false; App.navigate(); };
    const del = $('#del', v);
    if (del) del.onclick = () => {
      if (!confirm('Supprimer définitivement cette fiche ?')) return;
      Store.deleteUserFiche(fid); Store.clearDraft(); dirty = false; reload(); App.toast('Fiche supprimée.'); App.go('#/mes-fiches');
    };
    refresh();
    if (!existing) els.titre.focus();
    const beforeUnload = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  });
})();
