/* ============================================================
   STUB LOCAL DA YANDEX GAMES SDK  (apenas para teste/estudo)
   Substitui o /sdk.js remoto. NÃO mostra anúncios reais,
   NÃO envia dados — só resolve as Promises para o jogo bootar.
   ============================================================ */
(function () {
  "use strict";

  var mem = {}; // storage em memória (não usa localStorage real)
  var safeStorage = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    setItem: function (k, v) { mem[k] = String(v); },
    removeItem: function (k) { delete mem[k]; },
    clear: function () { mem = {}; },
    key: function (i) { return Object.keys(mem)[i] || null; },
    get length() { return Object.keys(mem).length; }
  };

  var player = {
    getName: function () { return "Estudante"; },
    getPhoto: function () { return ""; },
    getUniqueID: function () { return "local-test-0001"; },
    getData: function () { return Promise.resolve({}); },
    setData: function () { return Promise.resolve(); },
    getStats: function () { return Promise.resolve({}); },
    setStats: function () { return Promise.resolve(); },
    incrementStats: function () { return Promise.resolve({}); },
    getMode: function () { return "lite"; }
  };

  var ysdk = {
    adv: {
      showFullscreenAdv: function (o) {
        var cb = (o && o.callbacks) || {};
        cb.onOpen && cb.onOpen();
        setTimeout(function () { cb.onClose && cb.onClose(true); }, 50);
      },
      showRewardedVideo: function (o) {
        var cb = (o && o.callbacks) || {};
        cb.onOpen && cb.onOpen();
        cb.onRewarded && cb.onRewarded();
        setTimeout(function () { cb.onClose && cb.onClose(); }, 50);
      }
    },
    features: {
      LoadingAPI: { ready: function () {}, },
      GameplayAPI: { start: function () {}, stop: function () {} }
    },
    getStorage: function () { return Promise.resolve(safeStorage); },
    getPlayer: function () { return Promise.resolve(player); },
    getLeaderboards: function () {
      return Promise.resolve({
        setLeaderboardScore: function () { return Promise.resolve(); },
        getLeaderboardEntries: function () { return Promise.resolve({ entries: [] }); }
      });
    },
    getPayments: function () { return Promise.resolve({ getCatalog: function(){return Promise.resolve([]);} }); },
    environment: { i18n: { lang: "en" } },
    deviceInfo: { type: "mobile" },
    isAvailableMethod: function () { return Promise.resolve(false); }
  };

  window.YaGames = {
    init: function () {
      console.log("[STUB] YaGames.init() — SDK local de teste");
      return Promise.resolve(ysdk);
    }
  };
})();
