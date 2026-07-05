/* ============================================================
   STUB LOCAL DA YANDEX GAMES SDK  (apenas para teste/estudo)
   Substitui o /sdk.js remoto. NÃO mostra anúncios reais,
   NÃO envia dados — só resolve as Promises para o jogo bootar.
   ============================================================ */
(function () {
  "use strict";

  // storage PERSISTENTE: usa o localStorage real do navegador (com prefixo),
  // para o progresso sobreviver a reloads (essencial p/ avancar de fase).
  var LS = null;
  try { LS = window.localStorage; var _t="__mb_test"; LS.setItem(_t,"1"); LS.removeItem(_t); }
  catch (e) { LS = null; }
  var mem = {};
  var PFX = "ys_"; // prefixo p/ nao colidir com outras chaves
  var safeStorage = {
    getItem: function (k) {
      if (LS) { var v = LS.getItem(PFX + k); return v === null ? null : v; }
      return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
    },
    setItem: function (k, v) { if (LS) LS.setItem(PFX + k, String(v)); else mem[k] = String(v); },
    removeItem: function (k) { if (LS) LS.removeItem(PFX + k); else delete mem[k]; },
    clear: function () {
      if (LS) { for (var i = LS.length - 1; i >= 0; i--) { var kk = LS.key(i); if (kk && kk.indexOf(PFX) === 0) LS.removeItem(kk); } }
      else mem = {};
    },
    key: function (i) {
      if (LS) { var n = 0; for (var j = 0; j < LS.length; j++) { var kk = LS.key(j); if (kk && kk.indexOf(PFX) === 0) { if (n === i) return kk.slice(PFX.length); n++; } } return null; }
      return Object.keys(mem)[i] || null;
    },
    get length() {
      if (LS) { var n = 0; for (var j = 0; j < LS.length; j++) { var kk = LS.key(j); if (kk && kk.indexOf(PFX) === 0) n++; } return n; }
      return Object.keys(mem).length;
    }
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
