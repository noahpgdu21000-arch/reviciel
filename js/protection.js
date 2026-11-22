/* RéviCIEL — protections de confort : pas de menu clic droit, pas de sélection ni de copie du texte,
   et les raccourcis des outils de développement sont désactivés.
   Les champs de saisie (formulaires, éditeur, terminal du labo) restent utilisables normalement.
   Attention : un site web ne peut jamais être totalement protégé (le navigateur télécharge son code) ;
   la vraie sécurité des comptes repose sur les règles de la base de données (firestore.rules). */
(function () {
  'use strict';
  const editable = (el) => !!(el && el.closest && el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));

  // Menu du clic droit : seulement dans les champs de saisie (pour coller)
  document.addEventListener('contextmenu', (e) => { if (!editable(e.target)) e.preventDefault(); });

  // Copier / couper : seulement depuis un champ de saisie
  ['copy', 'cut'].forEach((type) => document.addEventListener(type, (e) => { if (!editable(document.activeElement)) e.preventDefault(); }));

  // Pas de glisser-déposer des images et du texte
  document.addEventListener('dragstart', (e) => { if (!editable(e.target)) e.preventDefault(); });

  // Pas de sélection à la souris en dehors des champs
  document.addEventListener('selectstart', (e) => { if (!editable(e.target)) e.preventDefault(); });

  // Raccourcis des outils de développement et du code source
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
    const block = e.key === 'F12' ||
      (ctrl && e.shiftKey && ['i', 'j', 'c', 'k'].indexOf(k) !== -1) ||   // inspecteur, console
      (ctrl && e.altKey && ['i', 'j', 'c'].indexOf(k) !== -1) ||           // équivalents sur Mac
      (ctrl && !e.shiftKey && k === 'u');                                   // afficher le code source
    if (block) { e.preventDefault(); e.stopPropagation(); }
    // « Enregistrer la page » : bloqué, mais Ctrl+S continue d'enregistrer une fiche dans l'éditeur
    else if (ctrl && !e.shiftKey && k === 's') e.preventDefault();
  }, true);
})();
