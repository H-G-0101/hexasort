/* ============================================================
   modal-bridge.js  (estudo local)
   1) Substitui o modal de booster nativo ("Clear" etc.) por um
      modal DOM moderno — apenas LIGAÇÃO: os botões do DOM
      disparam os handlers reais dos botões nativos (Buy/Get/Back).
   2) Nos demais modais nativos, troca o botão-seta "Back" solto
      por um X desenhado no canto do card.
   ============================================================ */
(function () {
  "use strict";
  var TAG = "[modal-bridge]";

  /* ---------- CSS do modal DOM ---------- */
  var css = ""
    + "#mbOverlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;"
    + "background:rgba(15,18,32,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}"
    + "#mbCard{position:relative;width:min(86vw,360px);background:#fff;border-radius:24px;"
    + "box-shadow:0 24px 60px rgba(0,0,0,.35),0 2px 0 rgba(255,255,255,.6) inset;overflow:visible;"
    + "animation:mbPop .22s cubic-bezier(.34,1.56,.64,1)}"
    + "@keyframes mbPop{from{transform:scale(.82);opacity:0}to{transform:scale(1);opacity:1}}"
    + "#mbHead{margin:-18px 18px 0;position:relative;background:linear-gradient(135deg,#7c4dff,#448aff);"
    + "border-radius:16px;padding:14px 12px;text-align:center;color:#fff;font-size:24px;font-weight:800;"
    + "letter-spacing:.5px;text-shadow:0 2px 0 rgba(0,0,0,.18);box-shadow:0 8px 18px rgba(68,138,255,.35)}"
    + "#mbX{position:absolute;top:-14px;right:-14px;width:44px;height:44px;border:none;border-radius:50%;"
    + "background:#ff5252;color:#fff;font-size:22px;font-weight:900;line-height:44px;cursor:pointer;"
    + "box-shadow:0 4px 10px rgba(0,0,0,.3),0 -2px 0 rgba(0,0,0,.15) inset}"
    + "#mbX:active{transform:scale(.92)}"
    + "#mbIconWrap{display:flex;align-items:center;justify-content:center;margin:22px auto 6px;width:150px;height:150px;"
    + "background:radial-gradient(circle at 50% 35%,#f6f9ff,#e8eefc);border-radius:28px;box-shadow:0 2px 0 #fff inset,0 6px 16px rgba(30,60,120,.10)}"
    + "#mbIcon{image-rendering:auto;transform-origin:center}"
    + "#mbDes{padding:6px 26px 18px;text-align:center;color:#3a3f52;font-size:16px;line-height:1.45;font-weight:600}"
    + "#mbBtns{display:flex;gap:12px;padding:0 18px 20px}"
    + "#mbBtns button{flex:1;border:none;border-radius:16px;padding:14px 8px;font-size:18px;font-weight:800;color:#fff;"
    + "cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"
    + "box-shadow:0 5px 0 rgba(0,0,0,.18),0 8px 16px rgba(0,0,0,.15);transition:transform .06s}"
    + "#mbBtns button:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.18)}"
    + "#mbBuy{background:linear-gradient(180deg,#42c6ff,#1e88e5)}"
    + "#mbGet{background:linear-gradient(180deg,#ffd54f,#fb9e00);color:#5c3d00!important;text-shadow:0 1px 0 rgba(255,255,255,.4)}"
    + "#mbBtns button:disabled{filter:grayscale(.8);opacity:.6;cursor:default}"
    + ".mbCoin{display:inline-block;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe680,#f4b400);"
    + "box-shadow:0 0 0 2px #d18f00 inset;font-size:13px;line-height:22px;color:#8a5c00;font-weight:900}"
    + ".mbPlay{display:inline-block;width:0;height:0;border-left:14px solid #5c3d00;border-top:9px solid transparent;border-bottom:9px solid transparent}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var overlay = document.createElement("div");
  overlay.id = "mbOverlay";
  overlay.innerHTML =
    '<div id="mbCard">' +
    '  <button id="mbX">\u2715</button>' +
    '  <div id="mbHead">...</div>' +
    '  <div id="mbIconWrap"><div id="mbIcon"></div></div>' +
    '  <div id="mbDes">...</div>' +
    '  <div id="mbBtns">' +
    '    <button id="mbBuy"><span class="mbCoin">G</span><span id="mbBuyTxt">50</span></button>' +
    '    <button id="mbGet"><span class="mbPlay"></span><span id="mbGetTxt">Get</span></button>' +
    '  </div>' +
    '</div>';
  document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(overlay); });
  if (document.body) document.body.appendChild(overlay);

  /* ---------- utilidades cc ---------- */
  function fire(node) { // dispara o handler real de um botão nativo
    try {
      if (!node || !node.isValid) return;
      var btn = node.getComponent(cc.Button);
      if (btn && btn.clickEvents && btn.clickEvents.length)
        cc.Component.EventHandler.emitEvents(btn.clickEvents, { target: node, currentTarget: node });
      else node.emit("click", btn);
    } catch (e) { console.warn(TAG, "fire err", e); }
  }
  function findDesc(root, name, withComp) { // busca descendente por nome
    var out = null;
    (function w(n) {
      if (out || !n) return;
      if (n.name === name && (!withComp || n.getComponent(withComp))) { out = n; return; }
      var ch = n.children || [];
      for (var i = 0; i < ch.length; i++) w(ch[i]);
    })(root);
    return out;
  }
  function labelText(node) {
    if (!node) return "";
    var l = node.getComponent && node.getComponent(cc.Label);
    if (l && l.string) return l.string;
    var out = "";
    (function w(n) { var lb = n.getComponent && n.getComponent(cc.Label); if (lb && lb.string) out += (out ? " " : "") + lb.string; (n.children || []).forEach(w); })(node);
    return out;
  }

  /* ---------- 1) modal DOM p/ booster ---------- */
  var current = null; // {root, buy, get, back}
  function showDom(root) {
    var title = findDesc(root, "Title");
    var des = findDesc(root, "Des");
    var buy = findDesc(root, "Buy", cc.Button) || findDesc(root, "Coin", cc.Button);
    var get = findDesc(root, "Get", cc.Button) || findDesc(root, "GetItem", cc.Button);
    var back = findDesc(root, "Back", cc.Button);
    var icon = findDesc(root, "Icon");

    document.getElementById("mbHead").textContent = labelText(title) || "Booster";
    document.getElementById("mbDes").textContent = labelText(des) || "";
    var buyTxt = labelText(buy).replace(/[^\d]/g, "");
    document.getElementById("mbBuyTxt").textContent = buyTxt || "50";
    document.getElementById("mbGetTxt").textContent = (labelText(get) || "Get").trim().split(/\s+/)[0];
    document.getElementById("mbBuy").style.display = buy ? "" : "none";
    document.getElementById("mbGet").style.display = get ? "" : "none";

    // ícone: recorta a textura real via CSS (nativeUrl + rect do spriteFrame)
    var iconDiv = document.getElementById("mbIcon");
    iconDiv.style.cssText = "";
    try {
      var sp = icon && icon.getComponent(cc.Sprite);
      var sf = sp && sp.spriteFrame;
      var tex = sf && sf.getTexture();
      if (tex && tex.nativeUrl) {
        var r = sf.getRect(), rot = sf.isRotated();
        var w = rot ? r.height : r.width, h = rot ? r.width : r.height;
        var s = Math.min(120 / r.width, 120 / r.height);
        iconDiv.style.width = w + "px"; iconDiv.style.height = h + "px";
        iconDiv.style.background = "url('" + tex.nativeUrl + "') no-repeat -" + r.x + "px -" + r.y + "px";
        iconDiv.style.transform = "scale(" + s + ")" + (rot ? " rotate(-90deg)" : "");
      } else { iconDiv.textContent = "\uD83D\uDD28"; iconDiv.style.fontSize = "84px"; }
    } catch (e) { iconDiv.textContent = "\uD83D\uDD28"; iconDiv.style.fontSize = "84px"; }

    // esconde o modal nativo (mantém vivo p/ lógica), mostra o DOM
    root.opacity = 0;
    root._mbDom = true;
    current = { root: root, buy: buy, get: get, back: back };
    overlay.style.display = "flex";
    console.log(TAG, "modal DOM aberto:", labelText(title));
  }
  function hideDom() { overlay.style.display = "none"; current = null; }

  document.addEventListener("click", function (ev) {
    if (!current) return;
    var id = ev.target.id || (ev.target.parentElement && ev.target.parentElement.id);
    if (id === "mbBuy" || ev.target.closest && ev.target.closest("#mbBuy")) fire(current.buy);
    else if (id === "mbGet" || ev.target.closest && ev.target.closest("#mbGet")) fire(current.get);
    else if (id === "mbX" || ev.target === overlay) { fire(current.back); hideDom(); }
  });

  /* ---------- 2) Back -> X nos demais modais ---------- */
  function patchBackToX(back) {
    if (back._xPatched) return; back._xPatched = true;
    var parent = back.parent; if (!parent) return;
    var panel = parent.getChildByName("Content") || parent.getChildByName("Background") || parent;
    try {
      var n = new cc.Node("CloseX");
      n.setContentSize(cc.size(92, 92));
      var g = n.addComponent(cc.Graphics);
      g.fillColor = new cc.Color(0, 0, 0, 110);
      g.circle(0, 0, 30); g.fill();
      g.strokeColor = cc.Color.WHITE; g.lineWidth = 7;
      g.moveTo(-11, -11); g.lineTo(11, 11); g.moveTo(-11, 11); g.lineTo(11, -11); g.stroke();
      panel.addChild(n, 9999);
      n.x = panel.width * (1 - panel.anchorX) - 26;
      n.y = panel.height * (1 - panel.anchorY) - 26;
      n.on(cc.Node.EventType.TOUCH_END, function () { fire(back); });
      back.active = false; // some com a seta solta
      console.log(TAG, "Back->X aplicado em", parent.name);
    } catch (e) { console.warn(TAG, "patch X err", e); back._xPatched = false; }
  }

  /* ---------- varredura ---------- */
  function isBoosterModal(n) { // tem Get/Buy + Des = modal de booster
    return !!(findDesc(n, "Des") && (findDesc(n, "Get", cc.Button) || findDesc(n, "GetItem", cc.Button)) &&
      (findDesc(n, "Buy", cc.Button) || findDesc(n, "VideoIcon")));
  }
  setInterval(function () {
    try {
      if (!window.cc || !cc.director || !cc.director.getScene) return;
      var scene = cc.director.getScene(); if (!scene) return;

      // fecha DOM se o modal nativo sumiu (fluxo do jogo fechou)
      if (current && (!current.root.isValid || !current.root.activeInHierarchy)) hideDom();

      (function walk(node) {
        if (!node || !node.activeInHierarchy) return;
        if (!node._mbSeen) {
          if (isBoosterModal(node) && !node._mbDom && findDesc(node, "Back", cc.Button)) {
            node._mbSeen = true; showDom(node); return;
          }
        }
        var back = null;
        if (node.name === "Back" && node.getComponent && node.getComponent(cc.Button)) {
          // pula se está dentro de um modal já substituído por DOM
          var p = node, dom = false;
          while (p) { if (p._mbDom) { dom = true; break; } p = p.parent; }
          if (!dom) patchBackToX(node);
        }
        var ch = node.children || [];
        for (var i = 0; i < ch.length; i++) walk(ch[i]);
      })(scene);
    } catch (e) { /* silencioso */ }
  }, 350);

  console.log(TAG, "carregado");
})();
