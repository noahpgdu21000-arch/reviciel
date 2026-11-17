/* RéviCIEL — démarrage de l'application */
(function () {
  'use strict';
  Store.onError = () => App.toast('Attention : ta progression ne peut pas être enregistrée (navigation privée ou stockage plein).', { duration: 8000 });
  RC.load();
  App.applySettings();
  App.renderNav();
  App.bindTopSearch();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', App.applySettings);
  window.addEventListener('hashchange', App.navigate);
  // Met à jour le compteur « Réviser » quand on revient sur l'appli le lendemain
  document.addEventListener('visibilitychange', () => { if (!document.hidden) App.renderNav(); });
  App.navigate();
})();
