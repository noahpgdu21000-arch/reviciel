/* RéviCIEL — application installable (PWA) : hors connexion, installation, mises à jour */
(function () {
  'use strict';
  const emit = () => window.dispatchEvent(new Event('pwa-change'));
  const PWA = {
    deferred: null, reg: null, updating: false,
    isStandalone: () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
    isIOS: () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    canInstall: () => !!PWA.deferred,
    offlineReady: () => !!(navigator.serviceWorker && navigator.serviceWorker.controller),
    async install() {
      if (!PWA.deferred) return false;
      PWA.deferred.prompt();
      const choice = await PWA.deferred.userChoice;
      PWA.deferred = null;
      emit();
      return choice.outcome === 'accepted';
    },
    async checkUpdate() {
      if (!PWA.reg) return false;
      await PWA.reg.update();
      return !!(PWA.reg.installing || PWA.reg.waiting);
    }
  };
  window.PWA = PWA;

  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); PWA.deferred = e; emit(); });
  window.addEventListener('appinstalled', () => {
    PWA.deferred = null;
    App.toast('Appli installée ! Lance-la depuis ton écran d\'accueil.');
    emit();
  });

  // Indicateur « Hors ligne »
  const badge = document.getElementById('net-badge');
  const net = () => { badge.hidden = navigator.onLine; };
  window.addEventListener('online', net);
  window.addEventListener('offline', net);
  net();

  // Service worker : met tout le site en cache pour réviser sans connexion
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    const promptUpdate = (worker) => {
      App.toast('Une nouvelle version de RéviCIEL est disponible.', {
        action: 'Mettre à jour', duration: 20000,
        onAction: () => { PWA.updating = true; worker.postMessage({ type: 'SKIP_WAITING' }); }
      });
    };
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        PWA.reg = reg;
        if (reg.waiting && navigator.serviceWorker.controller) promptUpdate(reg.waiting);
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state !== 'installed') return;
            if (navigator.serviceWorker.controller) promptUpdate(nw);
            else App.toast('RéviCIEL est prêt : il fonctionne maintenant sans connexion ✓');
          });
        });
        emit();
      }).catch((err) => console.warn('Service worker non enregistré :', err));
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (PWA.updating) { PWA.updating = false; location.reload(); } else emit();
    });
  }
})();
