/* ============================================================
   modal-bridge.js v3  (estudo local) — reescrito do zero
   O modal nativo é removido da tela (estacionado fora do canvas,
   vivo) e o NOSSO modal DOM assume. Suporta reabertura mesmo se
   o jogo cachear a instância do prefab.

   SETTINGS -> toggles 100% nossos (cc.audioEngine + prefs).
   BOOSTER  -> Buy/Get disparam toque simulado nos botões nativos.
   ============================================================ */
(function () {
  "use strict";
  var TAG = "[modal-bridge v3]";
  // >>> posicao/tamanho da pilula (ajuste livre) <<<
  var PILL_LEFT = 20;   // px da borda esquerda
  var PILL_TOP  = 16;   // px do topo

  var PARK_X = 100000;

  /* ============ preferências de áudio ============ */
  var PREF_KEY = "mb_prefs";
  var prefs = { bgm: true, sfx: true };
  try { var sv = localStorage.getItem(PREF_KEY); if (sv) prefs = JSON.parse(sv); } catch (e) {}
  function savePrefs(){ try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} }
  function applyAudio(){
    try {
      if (!window.cc || !cc.audioEngine) return;
      cc.audioEngine.setMusicVolume(prefs.bgm ? 1 : 0);
      cc.audioEngine.setEffectsVolume(prefs.sfx ? 1 : 0);
    } catch (e) {}
  }

  /* ============ CSS + DOM base ============ */
  var MB_GEM = "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";
  var css = ""
  + "#mbOverlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;"
  + "background:rgba(15,18,32,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);"
  + "font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}"
  + "#mbCard{position:relative;width:min(86vw,360px);background:#fff;border-radius:24px;"
  + "box-shadow:0 24px 60px rgba(0,0,0,.35);animation:mbPop .22s cubic-bezier(.34,1.56,.64,1)}"
  + "@keyframes mbPop{from{transform:scale(.82);opacity:0}to{transform:scale(1);opacity:1}}"
  + "#mbHead{margin:-18px 18px 0;background:linear-gradient(135deg,#7c4dff,#448aff);border-radius:16px;"
  + "padding:14px 12px;text-align:center;color:#fff;font-size:24px;font-weight:800;letter-spacing:.5px;"
  + "text-shadow:0 2px 0 rgba(0,0,0,.18);box-shadow:0 8px 18px rgba(68,138,255,.35)}"
  + "#mbX{position:absolute;top:-14px;right:-14px;width:46px;height:46px;border:none;border-radius:50%;"
  + "background:#ff5252;color:#fff;font-size:22px;font-weight:900;line-height:46px;cursor:pointer;z-index:2;"
  + "box-shadow:0 4px 10px rgba(0,0,0,.3)}#mbX:active{transform:scale(.9)}"
  + "#mbBody{padding:14px 18px 20px}"
  + "#mbIconWrap{display:flex;align-items:center;justify-content:center;margin:10px auto 6px;width:150px;height:150px;"
  + "background:radial-gradient(circle at 50% 35%,#f6f9ff,#e8eefc);border-radius:28px;box-shadow:0 6px 16px rgba(30,60,120,.10);overflow:hidden}"
  + "#mbDes{padding:6px 8px 16px;text-align:center;color:#3a3f52;font-size:16px;line-height:1.45;font-weight:600}"
  + "#mbBtns{display:flex;gap:12px}"
  + "#mbBtns button{flex:1;border:none;border-radius:16px;padding:14px 8px;font-size:18px;font-weight:800;color:#fff;"
  + "cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"
  + "box-shadow:0 5px 0 rgba(0,0,0,.18),0 8px 16px rgba(0,0,0,.15);transition:transform .06s}"
  + "#mbBtns button:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.18)}"
  + "#mbBuy{background:linear-gradient(180deg,#42c6ff,#1e88e5)}"
  + "#mbGet{background:linear-gradient(180deg,#ffd54f,#fb9e00);color:#5c3d00!important}"
  + ".mbCoin{display:inline-block;width:22px;height:20px;"
  + "clip-path:polygon(28% 0,72% 0,100% 34%,50% 100%,0 34%);"
  + "background:linear-gradient(180deg,#aaf2ff 0%,#41d6ff 38%,#1e88e5 75%,#1556 9e 100%);"
  + "background:linear-gradient(180deg,#aaf2ff 0%,#41d6ff 38%,#1e88e5 100%)}"
  + ".mbPlay{display:inline-block;width:0;height:0;border-left:14px solid #5c3d00;border-top:9px solid transparent;border-bottom:9px solid transparent}"
  + ".mbRow{display:flex;align-items:center;gap:14px;padding:14px 6px;border-bottom:1px solid #eef1f7}"
  + ".mbRow:last-child{border-bottom:none}"
  + ".mbRowIco{font-size:26px;width:36px;text-align:center}"
  + ".mbRowLbl{flex:1;font-size:19px;font-weight:800;color:#2d3348}"
  + ".mbSw{position:relative;width:64px;height:34px;border-radius:17px;background:#cfd6e4;cursor:pointer;"
  + "transition:background .18s;box-shadow:0 2px 4px rgba(0,0,0,.15) inset}"
  + ".mbSw.on{background:linear-gradient(180deg,#6fdc4f,#3cb527)}"
  + ".mbSw i{position:absolute;top:3px;left:3px;width:28px;height:28px;border-radius:50%;background:#fff;"
  + "box-shadow:0 2px 5px rgba(0,0,0,.25);transition:left .18s}"
  + ".mbSw.on i{left:33px}"
  /* shop */
  + ".mbShopRow{display:flex;align-items:center;gap:12px;padding:12px 10px;margin-bottom:12px;"
  + "background:linear-gradient(180deg,#f8faff,#eef2fb);border:2px solid #e3e9f6;border-radius:18px;"
  + "box-shadow:0 3px 8px rgba(30,60,120,.08)}"
  + ".mbShopRow:last-child{margin-bottom:0}"
  + ".mbShopIco{width:64px;height:64px;display:flex;align-items:center;justify-content:center;flex:none;"
  + "background:radial-gradient(circle at 50% 35%,#fff,#e8eefc);border-radius:14px;overflow:hidden}"
  + ".mbShopTxt{flex:1;font-size:17px;font-weight:800;color:#2d3348;line-height:1.25}"
  + ".mbShopTxt small{display:block;font-size:13px;color:#8b93ab;font-weight:700}"
  + ".mbShopBtn{border:none;border-radius:14px;padding:12px 16px;font-size:16px;font-weight:800;color:#5c3d00;"
  + "cursor:pointer;display:flex;align-items:center;gap:7px;background:linear-gradient(180deg,#ffd54f,#fb9e00);"
  + "box-shadow:0 4px 0 rgba(0,0,0,.18),0 6px 12px rgba(0,0,0,.12);transition:transform .06s}"
  + ".mbShopBtn:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.18)}"
  + ".mbShopBtn.free{background:linear-gradient(180deg,#6fdc4f,#3cb527);color:#fff}"
  + ".mbShopBtn .mbPlay{border-left-color:#5c3d00;border-top-width:7px;border-bottom-width:7px;border-left-width:11px}"
  + ".mbShopBtn.free .mbPlay{border-left-color:#fff}"
  /* badges de contagem de booster */
  + "#mbBar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);display:none;gap:13px;z-index:9997;"
  + "font-family:system-ui,Arial,sans-serif}"
  + ".mbBoost{position:relative;width:58px;height:60px;border:none;border-radius:17px;cursor:pointer;"
  + "background:linear-gradient(180deg,#7c4dff,#448aff);box-shadow:0 4px 0 #30267a,0 6px 12px rgba(0,0,0,.25);"
  + "display:flex;align-items:center;justify-content:center;transition:transform .06s}"
  + ".mbBoost:active{transform:translateY(2px);box-shadow:0 1px 0 #30267a}"
  + ".mbBoost img{width:38px;height:38px;object-fit:contain;pointer-events:none}"
  + ".mbBoost .mbBadge{position:absolute;top:-8px;right:-8px;min-width:22px;height:22px;padding:0 6px;"
  + "border-radius:11px;background:linear-gradient(180deg,#ff6b6b,#e53935);color:#fff;font-size:13px;"
  + "font-weight:900;line-height:22px;text-align:center;border:2px solid #fff;"
  + "box-shadow:0 2px 6px rgba(0,0,0,.35);pointer-events:none}"
  + ".mbBoost .mbBadge.zero{background:linear-gradient(180deg,#b6bdcf,#8b93ab)}"
  + "#mbPill{position:fixed;z-index:9996;display:none;align-items:center;height:34px;padding:0 6px 0 20px;"
  + "border-radius:22px;background:linear-gradient(90deg,#7c4dff,#448aff);"
  + "box-shadow:0 3px 8px rgba(0,0,0,.3);font-family:system-ui,Arial,sans-serif;pointer-events:auto}"
  + "#mbPill .cpInner{display:flex;align-items:center;height:26px;padding:0 6px 0 24px;border-radius:13px;"
  + "background:linear-gradient(180deg,#fff,#e6ecfc);position:relative}"
  + "#mbPill .cpGem{position:absolute;left:-14px;top:50%;transform:translateY(-50%);width:40px;height:40px;background-repeat:no-repeat;background-position:center;background-size:contain}"
  + "#mbPill .cpAmt{min-width:40px;text-align:center;font-size:16px;font-weight:900;color:#2d3348;padding:0 6px}"
  + "#mbPill .cpAdd{width:30px;height:30px;margin-left:1px;border:none;border-radius:50%;cursor:pointer;"
  + "background:radial-gradient(circle at 40% 35%,#7dea5a,#3cb527);box-shadow:0 3px 0 #237a15;"
  + "color:#fff;font-size:20px;font-weight:900;line-height:30px;text-align:center}"
  + "#mbPill .cpAdd:active{transform:translateY(-50%) scale(.92)}";
  /* stepper de quantidade */
  + "#mbQty{display:flex;align-items:center;justify-content:center;gap:14px;margin:0 0 14px}"
  + "#mbQty button{width:44px;height:44px;border:none;border-radius:50%;font-size:24px;font-weight:900;color:#fff;"
  + "background:linear-gradient(180deg,#7c4dff,#448aff);cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.2)}"
  + "#mbQty button:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.2)}"
  + "#mbQty span{min-width:56px;text-align:center;font-size:26px;font-weight:900;color:#2d3348}"
  + "#mbQty small{display:block;font-size:12px;color:#8b93ab;font-weight:700}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var overlay = document.createElement("div");
  overlay.id = "mbOverlay";
  overlay.innerHTML = '<div id="mbCard"><button id="mbX">\u2715</button><div id="mbHead"></div><div id="mbBody"></div></div>';
  function mount(){ if(!overlay.parentNode && document.body) document.body.appendChild(overlay); }
  mount(); document.addEventListener("DOMContentLoaded", mount);

  /* ============ helpers cc ============ */
  function findDesc(root, name, comp) {
    var out = null;
    (function w(n){ if(out||!n) return;
      if(n.name===name && (!comp||(n.getComponent&&n.getComponent(comp)))){ out=n; return; }
      var c=n.children||[]; for(var i=0;i<c.length;i++) w(c[i]); })(root);
    return out;
  }
  function labelText(node) {
    if (!node) return "";
    var out = "";
    (function w(n){ var lb=n.getComponent&&n.getComponent(cc.Label);
      if(lb&&lb.string) out+=(out?" ":"")+lb.string;
      (n.children||[]).forEach(w); })(node);
    return out;
  }
  function simTouch(node) {
    if (!node || !node.isValid) return false;
    try {
      var wp = node.convertToWorldSpaceAR ? node.convertToWorldSpaceAR(cc.v2(0,0)) : cc.v2(0,0);
      var t = new cc.Touch(wp.x, wp.y, 0);
      var e1 = new cc.Event.EventTouch([t], false);
      e1.type = cc.Node.EventType.TOUCH_START; e1.touch = t;
      node.dispatchEvent(e1);
      var e2 = new cc.Event.EventTouch([t], false);
      e2.type = cc.Node.EventType.TOUCH_END; e2.touch = t;
      node.dispatchEvent(e2);
      return true;
    } catch (e) { return false; }
  }
  function fireBtn(node) {
    if (simTouch(node)) return;
    try {
      var btn = node && node.isValid && node.getComponent(cc.Button);
      if (btn && btn.clickEvents && btn.clickEvents.length)
        cc.Component.EventHandler.emitEvents(btn.clickEvents, { target: node, currentTarget: node });
      else if (node && node.isValid) node.emit("click", btn || node);
    } catch (e) {}
  }

  /* ============ estado ============ */
  var current = null;        // { kind, root }
  var parked = [];           // instancias nativas estacionadas [{node,kind}]
  function hideDom(){
    if (current && current.root && current.root.isValid) current.root._mbShowing = false;
    overlay.style.display = "none"; current = null;
  }
  function park(node, kind){
    node._mbKind = kind;
    if (node.x < PARK_X/2) node.x += PARK_X;
    parked.push({ node: node, kind: kind });
  }

  /* ============ SETTINGS (100% nosso) ============ */
  function renderSettings(root) {
    var title = labelText(findDesc(root, "Title")) || "Settings";
    var labels = { Music: "BGM", Sound: "SFX" };
    ["Music","Sound"].forEach(function(nm){
      var br = findDesc(root, nm);
      var tx = br && labelText(findDesc(br, "Text"));
      if (tx) labels[nm] = tx.trim();
    });
    document.getElementById("mbHead").textContent = title;
    var body = document.getElementById("mbBody"); body.innerHTML = "";
    [["Music","bgm","\uD83C\uDFB5"],["Sound","sfx","\uD83D\uDD0A"]].forEach(function(cfg){
      var nm=cfg[0], key=cfg[1], ico=cfg[2];
      var row = document.createElement("div"); row.className = "mbRow";
      row.innerHTML = '<div class="mbRowIco">'+ico+'</div><div class="mbRowLbl">'+labels[nm]+
        '</div><div class="mbSw'+(prefs[key]?" on":"")+'"><i></i></div>';
      var sw = row.querySelector(".mbSw");
      sw.onclick = function(){
        prefs[key] = !prefs[key];
        sw.classList.toggle("on", prefs[key]);
        savePrefs(); applyAudio();
      };
      body.appendChild(row);
    });
  }

  /* ============ BOOSTER ============ */
  function renderBooster(root) {
    var title=findDesc(root,"Title"), des=findDesc(root,"Des");
    var buy=findDesc(root,"Buy",cc.Button)||findDesc(root,"Coin",cc.Button);
    var get=findDesc(root,"Get",cc.Button)||findDesc(root,"GetItem",cc.Button);
    // o icone REAL e Content/Icon (filho direto); "Frames" guarda os 3 frames e confundia o findDesc
    var content=findDesc(root,"Content");
    var icon=null;
    if(content){ var cs=content.children||[]; for(var ci=0;ci<cs.length;ci++) if(cs[ci].name==="Icon"){icon=cs[ci];break;} }
    if(!icon) icon=findDesc(root,"Icon");

    document.getElementById("mbHead").textContent = labelText(title) || "Booster";
    var body=document.getElementById("mbBody");
    body.innerHTML='<div id="mbIconWrap"><div id="mbIcon"></div></div><div id="mbDes"></div><div id="mbBtns">'
      +'<button id="mbBuy"><span class="mbCoin"></span><span id="mbBuyTxt"></span></button>'
      +'<button id="mbGet"><span class="mbPlay"></span><span id="mbGetTxt"></span></button></div>';
    document.getElementById("mbDes").textContent = labelText(des) || "";
    document.getElementById("mbBuyTxt").textContent = (labelText(buy).replace(/[^\d]/g,"")) || "50";
    document.getElementById("mbGetTxt").textContent = (labelText(get)||"Get").trim().split(/\s+/)[0];
    document.getElementById("mbBuy").style.display = buy ? "" : "none";
    document.getElementById("mbGet").style.display = get ? "" : "none";

    // tipo do booster e componente do modal (chamada direta, imune ao hide)
    var comp = getItemComp(root);
    var itype = comp && comp._data ? comp._data.type : null;

    // icone por TIPO com nossos PNGs (deterministico; corrige bomba aparecendo em mao/setas)
    var iconDiv=document.getElementById("mbIcon");
    var slotByType = { clear: 0, move: 1, refresh: 2 };
    if (itype != null && slotByType[itype] !== undefined) {
      iconDiv.innerHTML = '<img src="' + ICON_IMGS[slotByType[itype]] + '" style="width:120px;height:120px;object-fit:contain">';
    } else {
      try {
        var sp=icon&&icon.getComponent(cc.Sprite), sf=sp&&sp.spriteFrame, tex=sf&&sf.getTexture();
        if(tex&&tex.nativeUrl){
          var r=sf.getRect(), rot=sf.isRotated();
          var w=rot?r.height:r.width, h=rot?r.width:r.height;
          var sc=Math.min(120/w,120/h);
          iconDiv.style.width=w+"px"; iconDiv.style.height=h+"px";
          iconDiv.style.background="url('"+tex.nativeUrl+"') no-repeat -"+r.x+"px -"+r.y+"px";
          iconDiv.style.transform="scale("+sc+")"+(rot?" rotate(-90deg)":"");
        } else { iconDiv.textContent="\uD83D\uDCA3"; iconDiv.style.fontSize="84px"; }
      } catch(e){ iconDiv.textContent="\uD83D\uDCA3"; iconDiv.style.fontSize="84px"; }
    }

    var canStock = itype === "clear" || itype === "move"; // refresh nao estoca (executa na hora)

    var qty = 1, PRICE = 50;
    if (canStock) {
      var qtyDiv = document.createElement("div");
      qtyDiv.id = "mbQty";
      qtyDiv.innerHTML = '<button id="mbQm">\u2212</button><span><b id="mbQn">1</b><small id="mbQp">50</small></span><button id="mbQp2">+</button>';
      body.insertBefore(qtyDiv, document.getElementById("mbBtns"));
      var syncQty = function(){
        document.getElementById("mbQn").textContent = qty;
        document.getElementById("mbQp").textContent = (qty*PRICE) + " \uD83D\uDC8E";
        document.getElementById("mbBuyTxt").textContent = String(qty*PRICE);
      };
      document.getElementById("mbQm").onclick = function(){ if(qty>1){qty--; syncQty();} };
      document.getElementById("mbQp2").onclick = function(){ if(qty<9){qty++; syncQty();} };
      syncQty();
    }

    document.getElementById("mbBuy").onclick=function(){
      for (var i=0;i<qty;i++) {
        if (comp && comp.clickBuyHandle) { try { comp.clickBuyHandle(); } catch(e){ fireBtn(buy); } }
        else fireBtn(buy);
      }
      if (canStock) {
        setTimeout(function(){cancelChoicePanel(itype); purgeTouchOrphans();},150);
        setTimeout(function(){cancelChoicePanel(itype); purgeTouchOrphans();},450);
      }
    };
    document.getElementById("mbGet").onclick=function(){
      if (comp && comp.clickGetHandle) { try { comp.clickGetHandle(); } catch(e){ fireBtn(get); } }
      else fireBtn(get);
      if (canStock) {
        setTimeout(function(){cancelChoicePanel(itype); purgeTouchOrphans();},300);
        setTimeout(function(){cancelChoicePanel(itype); purgeTouchOrphans();},900);
      }
    };
  }

  /* ============ SHOP (GetCoin) ============ */
  function cssSpriteInto(div, node, box) { // recorta sprite real p/ CSS
    try {
      var sp = node && node.getComponent(cc.Sprite), sf = sp && sp.spriteFrame, tex = sf && sf.getTexture();
      if (tex && tex.nativeUrl) {
        var r = sf.getRect(), rot = sf.isRotated();
        var w = rot ? r.height : r.width, h = rot ? r.width : r.height;
        var sc = Math.min(box / w, box / h);
        div.style.width = w + "px"; div.style.height = h + "px";
        div.style.background = "url('" + tex.nativeUrl + "') no-repeat -" + r.x + "px -" + r.y + "px";
        div.style.transform = "scale(" + sc + ")" + (rot ? " rotate(-90deg)" : "");
        div.style.transformOrigin = "center";
        return true;
      }
    } catch (e) {}
    return false;
  }
  function renderShop(root) {
    document.getElementById("mbHead").textContent = labelText(findDesc(root, "Title")) || "Shop";
    var body = document.getElementById("mbBody"); body.innerHTML = "";
    [["FreeContent", true], ["FirstContent", false], ["SecondContent", false]].forEach(function (cfg) {
      var row = findDesc(root, cfg[0]); if (!row || !row.activeInHierarchy) return;
      var buy = findDesc(row, "Buy", cc.Button);
      var icon = findDesc(row, "Icon");
      var texts = [];
      (function w(n){ var lb=n.getComponent&&n.getComponent(cc.Label);
        if(lb&&lb.string&&(!buy||!isDescOf(n,buy))) texts.push(lb.string.trim());
        (n.children||[]).forEach(w); })(row);
      var btnTxt = buy ? (labelText(buy).trim() || "Get") : "Get";
      var main = texts.length ? texts[0] : "Coins";
      var sub  = texts.slice(1).join(" \u00b7 ");

      var el = document.createElement("div"); el.className = "mbShopRow";
      el.innerHTML = '<div class="mbShopIco"><div></div></div>' +
        '<div class="mbShopTxt">' + main + (sub ? '<small>' + sub + '</small>' : '') + '</div>' +
        '<button class="mbShopBtn' + (cfg[1] ? ' free' : '') + '"><span class="mbPlay"></span><span>' + btnTxt + '</span></button>';
      if (!cssSpriteInto(el.querySelector(".mbShopIco div"), icon, 52)) {
        var d = el.querySelector(".mbShopIco div"); d.textContent = "\uD83D\uDC8E"; d.style.fontSize = "38px";
      }
      el.querySelector(".mbShopBtn").onclick = function () { fireBtn(buy); };
      body.appendChild(el);
    });
  }
  function isDescOf(n, anc) { var p = n; while (p) { if (p === anc) return true; p = p.parent; } return false; }

  /* ============ mostrar/fechar ============ */
  function show(root, kind) {
    if (kind === "settings") renderSettings(root);
    else if (kind === "shop") renderShop(root);
    else renderBooster(root);
    root._mbShowing = true;
    if (root.x < PARK_X/2) root.x += PARK_X; // garante estacionado
    overlay.style.display = "flex";
    current = { kind: kind, root: root };
    console.log(TAG, kind, "aberto (DOM)");
  }
  function closeCurrent() {
    if (!current) return;
    var kind = current.kind, root = current.root;
    var back = root && root.isValid && findDesc(root, "Back", cc.Button);
    hideDom();
    fireBtn(back); // deixa o jogo fechar/limpar pelo fluxo normal
    setTimeout(function(){
      if (root && root.isValid && root.activeInHierarchy) {
        console.warn(TAG, kind, "back nativo nao fechou; forcando active=false");
        try { root.active = false; } catch (e) {}
      }
    }, 800);
  }
  document.addEventListener("click", function (ev) {
    if (!current) return;
    if (ev.target.id === "mbX" || ev.target === overlay) closeCurrent();
  });

  /* ============ detecção ============ */
  function hasMaskChild(n){
    var c=n.children||[];
    for(var i=0;i<c.length;i++) if(c[i].name==="Mask") return true;
    return false;
  }
  function classify(n){
    if (findDesc(n,"Music") && findDesc(n,"Sound")) return "settings";
    if (findDesc(n,"FreeContent") || (findDesc(n,"FirstContent") && findDesc(n,"SecondContent"))) return "shop";
    if (findDesc(n,"Des") && (findDesc(n,"Get",cc.Button)||findDesc(n,"GetItem",cc.Button))) return "booster";
    return null;
  }

  /* ============ preload: elimina o "%" no 1o clique ============ */
  // Os prefabs dos modais carregam sob demanda (o jogo mostra % durante o load).
  // Pre-carregamos o bundle 'local' em background: no clique, ja esta em cache.
  var preloadState = 0; // 0=pendente 1=rodando 2=feito
  var bootSeenAt = 0;
  function preloadAll() {
    if (preloadState || !cc.assetManager || !cc.assetManager.getBundle) return;
    var b = cc.assetManager.getBundle("local");
    if (!b) return;
    preloadState = 1;
    console.log(TAG, "pre-carregando bundle local em background...");
    b.loadDir("", function (err) {
      preloadState = 2;
      console.log(TAG, err ? "preload com erros (ok, parcial)" : "preload completo — modais abrem sem loading");
    });
  }
  /* ============ barra de boosters DOM (icones proprios + badges) ============ */
  var saveKey = null;
  function storages() {
    var list = [];
    try { if (window.localStorage) list.push(window.localStorage); } catch (e) {}
    try { if (window.cc && cc.sys && cc.sys.localStorage && cc.sys.localStorage !== window.localStorage) list.push(cc.sys.localStorage); } catch (e) {}
    return list;
  }
  function readItems() {
    var sts = storages();
    for (var s = 0; s < sts.length; s++) {
      var st = sts[s];
      try {
        if (saveKey) {
          var v = st.getItem(saveKey);
          if (v) { var o = JSON.parse(v); if (Array.isArray(o)) return o; }
        }
        var n = st.length | 0;
        for (var i = 0; i < n; i++) {
          var k = st.key(i); if (!k || k.indexOf("items") < 0) continue;
          try {
            var o2 = JSON.parse(st.getItem(k));
            if (Array.isArray(o2)) { saveKey = k; return o2; }
          } catch (e) {}
        }
      } catch (e) {}
    }
    return null;
  }
  var ITEM_TYPES = ["clear", "move", "refresh"];
  function itemCount(items, idx) {
    if (!items || !Array.isArray(items)) return 0;
    var t = ITEM_TYPES[idx], n = 0;
    for (var i = 0; i < items.length; i++) if (items[i] && items[i].type === t) n++;
    return n;
  }

  // icones: os PNGs redesenhados do proprio projeto (a prova de falha de render)
  var ICON_IMGS = [
    "assets/local/native/0f/0f5d5f39-5d1c-4510-9446-c0d6068e9079.84b5f.png",   // bomba (clear)
    "assets/local/native/66/6633f875-0ee2-4015-aaad-5a46d36c9956.0377a.png",   // mao (move)
    "assets/local/native/23/23ec48d8-ac69-4ad3-a835-09429843f849.9d9c7.png"    // ciclo (refresh)
  ];

  function findGameComp() {
    try {
      var start = boosterNatives[0] && boosterNatives[0].isValid ? boosterNatives[0].parent : null;
      var p = start;
      while (p) {
        var cs = p._components || [];
        for (var i = 0; i < cs.length; i++)
          if (cs[i] && typeof cs[i].hideChoisePanel === "function") return cs[i];
        p = p.parent;
      }
      var scene = cc.director.getScene(); var out = null;
      (function w(n) {
        if (out || !n) return;
        var cs2 = n._components || [];
        for (var i = 0; i < cs2.length; i++)
          if (cs2[i] && typeof cs2[i].hideChoisePanel === "function") { out = cs2[i]; return; }
        var c = n.children || [];
        for (var j = 0; j < c.length; j++) w(c[j]);
      })(scene);
      return out;
    } catch (e) { return null; }
  }
  function cancelChoicePanel(type) {
    try {
      var g = findGameComp();
      if (!g) { console.warn(TAG, "Game comp nao achado p/ cancelar"); return; }
      g.hideChoisePanel(type);
      console.log(TAG, "uso automatico cancelado (", type, ")");
    } catch (e) { console.warn(TAG, "cancel err", e); }
  }
  /* ============ suprimir popups que travam o loader (assets ausentes) ============ */
  // Popups bloqueados: abrem prefab sob demanda que nao existe na reconstrucao,
  // travando o loader em 99%. Bloqueando, o fluxo segue direto pra fase.
  /* ============ bypass SUCCESS ausente: pula a tela de vitoria ============ */
  function forceLoadingEnd() {
    try {
      var ld = cc.find && cc.find("Canvas/loading");
      if (ld) ld.active = false;
      (function w(n){ var cs=n._components||[];
        for(var i=0;i<cs.length;i++){var k=cs[i]&&cs[i].constructor; if(k&&("isShow" in k)) k.isShow=false;}
        (n.children||[]).forEach(w); })(cc.director.getScene());
    } catch (e) {}
  }
  function findLevelMgr() { // o scene-manager: tem container + showLevel + addContentToContainer
    try {
      var scene=cc.director.getScene(), out=null;
      (function w(n){ if(out||!n) return; var cs=n._components||[];
        for(var i=0;i<cs.length;i++){ var c=cs[i];
          if(c && typeof c.showLevel==="function" && typeof c.addContentToContainer==="function" && c.container){ out=c; return; } }
        (n.children||[]).forEach(w); })(scene);
      return out;
    } catch (e) { return null; }
  }
  function advanceToNextLevel() {
    // Storage agora PERSISTE (sdk.js). O jogo ja fez levels.order+=1 e salvou
    // antes do SUCCESS. Um reload reexecuta o boot -> le o progresso salvo ->
    // monta a proxima fase pelo caminho que comprovadamente funciona.
    try {
      forceLoadingEnd();
      console.log(TAG, "SUCCESS: recarregando para a proxima fase (progresso persistido)");
      setTimeout(function () { try { location.reload(); } catch (e) {} }, 250);
    } catch (e) { console.warn(TAG, "advance err", e); location.reload(); }
  }

  var BLOCK_POPUPS = { COIN_PIG: 1, GROWUP: 1 };
  var popupHooked = false;
  function hookPopup() {
    if (popupHooked) return;
    try {
      // acha a instancia do Popup manager (tem .show, .paths, .container)
      var mgr = null;
      var scene = cc.director.getScene();
      (function w(n){
        if (mgr || !n) return;
        var cs = n._components || [];
        for (var i=0;i<cs.length;i++){
          var c=cs[i];
          if (c && typeof c.show==="function" && c.paths && c.container && typeof c.hideAll==="function"){ mgr=c; return; }
        }
        (n.children||[]).forEach(w);
      })(scene);
      if (!mgr) return; // tenta de novo no proximo tick
      var proto = Object.getPrototypeOf(mgr);
      if (proto._mbHooked) { popupHooked = true; return; }
      var orig = proto.show;
      proto.show = function(name, data){
        if (name === "SUCCESS") {                  // tela de vitoria ausente -> pula direto
          console.log(TAG, "SUCCESS ausente -> avancando de fase");
          advanceToNextLevel();
          return Promise.resolve();
        }
        if (BLOCK_POPUPS[name]) {
          console.log(TAG, "popup bloqueado:", name, "(asset ausente) -> seguindo fluxo");
          forceLoadingEnd();
          return Promise.resolve();
        }
        return orig.apply(this, arguments);
      };
      proto._mbHooked = true;
      popupHooked = true;
      console.log(TAG, "Popup.show hookado; bloqueando", Object.keys(BLOCK_POPUPS).join("/"));
    } catch (e) { console.warn(TAG, "hookPopup err", e); }
  }

  /* ============ watchdog: loading travado em 99% (asset de fase ausente) ============ */
  var loadingSince = 0;
  function findLoadingMainClass() { // classe estatica LoadingMain (tem .end() e .isShow)
    try {
      var ld = cc.find && cc.find("Canvas/loading");
      var comp = ld && ld._components && ld._components[0];
      // o botao/loader nativo guarda ref; melhor: procurar por qualquer classe com end+isShow
    } catch (e) {}
    return null;
  }
  function loadingWatchdog() {
    try {
      var ld = cc.find && cc.find("Canvas/loading");
      if (ld && ld.activeInHierarchy) {
        if (!loadingSince) loadingSince = Date.now();
        else if (Date.now() - loadingSince > 6000) {
          console.warn(TAG, "loader travado >6s em 99% (asset de transicao ausente); forcando fim");
          // 1) tenta o end() oficial: a classe LoadingMain e estatica no componente 'loading'
          try {
            var comp = ld.getComponent && ld.getComponent(cc.Component);
            var cls = comp && comp.constructor;
            // varre modulos conhecidos: acha qualquer classe com isShow+end
          } catch (e) {}
          // 2) fallback direto: esconde o node e zera o flag estatico via qualquer componente que o tenha
          try { ld.active = false; } catch (e) {}
          try {
            (function w(n){
              var cs=n._components||[];
              for(var i=0;i<cs.length;i++){var k=cs[i]&&cs[i].constructor;
                if(k && ("isShow" in k)){ k.isShow=false; }}
              (n.children||[]).forEach(w);
            })(cc.director.getScene());
          } catch (e) {}
          loadingSince = 0;
        }
      } else loadingSince = 0;
    } catch (e) {}
  }
  function findBoardComp() { // componente do TABULEIRO (func_move/_readyMove/area vivem aqui)
    try {
      var g = findGameComp();
      var cand = g && g.content && g.content.children && g.content.children[0];
      var cs = cand ? (cand._components || []) : [];
      for (var i = 0; i < cs.length; i++)
        if (cs[i] && typeof cs[i].func_cancelMove === "function") return cs[i];
    } catch (e) {}
    // fallback: varredura da cena
    try {
      var scene = cc.director.getScene(); var out = null;
      (function w(n) {
        if (out || !n) return;
        var cs2 = n._components || [];
        for (var i = 0; i < cs2.length; i++)
          if (cs2[i] && typeof cs2[i].func_cancelMove === "function") { out = cs2[i]; return; }
        var c = n.children || [];
        for (var j = 0; j < c.length; j++) w(c[j]);
      })(scene);
      return out;
    } catch (e) { return null; }
  }
  function purgeTouchOrphans() { // remove TODOS os "Touch" orfaos (a multi-compra deixava N-1)
    try {
      var b = findBoardComp();
      if (!b || b._readyMove) return 0;        // nunca durante o modo move ativo
      var cells = (b.area && b.area.children) || [];
      var removed = 0;
      for (var i = 0; i < cells.length; i++) {
        var t;
        while ((t = cells[i].getChildByName && cells[i].getChildByName("Touch"))) {
          t.removeFromParent(true); removed++;
        }
      }
      if (removed) console.log(TAG, "purge: removidos", removed, "Touch orfaos");
      return removed;
    } catch (e) { return 0; }
  }
  function getItemComp(root) {
    var cs = (root && root._components) || [];
    for (var i = 0; i < cs.length; i++)
      if (cs[i] && cs[i]._data && typeof cs[i].clickBuyHandle === "function") return cs[i];
    return null;
  }

  var bar = document.createElement("div");
  bar.id = "mbBar";
  ICON_IMGS.forEach(function (src, i) {
    var b = document.createElement("button");
    b.className = "mbBoost";
    b.innerHTML = '<img src="' + src + '" alt=""><span class="mbBadge zero">0</span>';
    b.onclick = function () { if (boosterNatives[i]) fireBtn(boosterNatives[i]); };
    bar.appendChild(b);
  });
  function mountBar(){ if(!bar.parentNode && document.body) document.body.appendChild(bar); }
  mountBar(); document.addEventListener("DOMContentLoaded", mountBar);


  /* ============ pilula de moedas DOM (arte do HTML do usuario) ============ */
  function nodeToCssAt(node, ax, ay) { // ax/ay: 0..1 no retangulo do node -> px CSS
    try {
      var wp = node.convertToWorldSpaceAR(cc.v2(node.width * (ax - node.anchorX), node.height * (ay - node.anchorY)));
      var vis = cc.view.getVisibleSize(), org = cc.view.getVisibleOrigin();
      var rect = cc.game.canvas.getBoundingClientRect();
      var nx = (wp.x - org.x) / vis.width, ny = (wp.y - org.y) / vis.height;
      if (nx < -0.3 || nx > 1.3 || ny < -0.3 || ny > 1.3) return null;
      return { x: rect.left + nx * rect.width, y: rect.top + (1 - ny) * rect.height };
    } catch (e) { return null; }
  }
  var pill = document.createElement("div");
  pill.id = "mbPill";
  pill.innerHTML = '<div class="cpInner"><span class="cpGem"></span><span class="cpAmt">0</span>' +
                   '<button class="cpAdd">+</button></div>';
  function mountPill(){ if(!pill.parentNode && document.body) document.body.appendChild(pill); }
  mountPill(); document.addEventListener("DOMContentLoaded", mountPill);
  pill.querySelector(".cpGem").style.backgroundImage = "url('data:image/png;base64," + MB_GEM + "')";
  var coinNative = null;          // nó btnCoin nativo (tem lbCount + clickCoinHandle)
  function findCoinPill(scene) {
    if (coinNative && coinNative.isValid && coinNative.activeInHierarchy) return coinNative;
    coinNative = null;
    (function w(n) {
      if (coinNative || !n || !n.activeInHierarchy || n.x > PARK_X / 2) return;
      // pilula = no "Coin" com um filho label (contagem) e irmao "Add"
      if (n.name === "Coin" && n.parent && n.parent.getChildByName && n.parent.getChildByName("Add")) {
        coinNative = n; return;
      }
      var c = n.children || [];
      for (var i = 0; i < c.length; i++) w(c[i]);
    })(scene);
    return coinNative;
  }
  function coinText(node) { // le o lbCount (label de contagem) do no
    var out = "";
    (function w(n){ var lb=n.getComponent&&n.getComponent(cc.Label);
      if(lb&&lb.string!=null&&lb.string!=="") out=lb.string;
      (n.children||[]).forEach(w); })(node);
    return out;
  }
  pill.querySelector(".cpAdd").onclick = function(){
    if (coinNative && coinNative.parent) {
      var add = coinNative.parent.getChildByName("Add");
      fireBtn(add && add.getComponent(cc.Button) ? add : coinNative); // Add abre GET_COIN; senao o proprio Coin
    }
  };
  pill.querySelector(".cpInner").onclick = function(ev){
    if (ev.target.classList.contains("cpAdd")) return;
    if (coinNative) fireBtn(coinNative); // toque no corpo tambem abre a loja de moedas
  };
  function hasNumLabel(n){
    var ok=false;
    (function w(x){ if(ok||!x) return; var lb=x.getComponent&&x.getComponent(cc.Label);
      if(lb&&lb.string!=null&&/^[0-9]/.test(String(lb.string).trim())) ok=true;
      (x.children||[]).forEach(w); })(n);
    return ok;
  }
  function hideAllNativePills(scene) { // esconde TODAS as pilulas nativas (com ou sem "Add")
    var withAdd = [];
    (function w(n){
      if(!n||!n.activeInHierarchy||n.x>PARK_X/2) return;
      if(n.name==="Coin" && hasNumLabel(n)){
        var hasAdd = n.parent && n.parent.getChildByName && n.parent.getChildByName("Add");
        try{ n.opacity=0; if(hasAdd){ var a=n.parent.getChildByName("Add"); if(a) a.opacity=0; } }catch(e){}
        if(hasAdd) withAdd.push(n); else if(!withAdd.length) withAdd.push(n);
      }
      var c=n.children||[]; for(var i=0;i<c.length;i++) w(c[i]);
    })(scene);
    // prioriza a pilula que tem Add (gameplay) como ancora do nosso DOM
    withAdd.sort(function(a,b){ var pa=a.parent&&a.parent.getChildByName("Add")?0:1, pb=b.parent&&b.parent.getChildByName("Add")?0:1; return pa-pb; });
    return withAdd;
  }
  function updatePill(scene) {
    var list = hideAllNativePills(scene);              // esconde todas as nativas
    var n = (coinNative && coinNative.isValid && coinNative.activeInHierarchy) ? coinNative : (list[0]||null);
    coinNative = n;
    if (!n || overlay.style.display === "flex") { pill.style.display = "none"; return; }
    // posicao FIXA no canto (a pilula nativa vive sempre nesse canto) -> nao persegue o no
    pill.style.display = "flex";
    pill.style.left = PILL_LEFT + "px";
    pill.style.top = PILL_TOP + "px";
    pill.style.transform = "none";
    var t = coinText(n);
    pill.querySelector(".cpAmt").textContent = t || "0";
  }

  // botoes nativos: capturados uma vez por cena (ordenados por x ANTES de estacionar)
  var boosterNatives = [null, null, null];
  function captureNatives(scene) {
    if (boosterNatives[0] && boosterNatives[0].isValid) return true;
    var NAME2SLOT = { Clear: 0, Move: 1, Refresh: 2 };
    var found = [null, null, null];
    (function w(n) {
      if (!n || !n.activeInHierarchy || n.x > PARK_X / 2) return;
      var slot = NAME2SLOT[n.name];
      if (slot !== undefined && n.getChildByName && n.getChildByName("Total") && !found[slot]) found[slot] = n;
      var c = n.children || [];
      for (var i = 0; i < c.length; i++) w(c[i]);
    })(scene);
    if (!found[0] || !found[1] || !found[2]) return false;
    boosterNatives = found;
    for (var i = 0; i < 3; i++) if (boosterNatives[i].x < PARK_X/2) boosterNatives[i].x += PARK_X;
    console.log(TAG, "barra DOM ativa; nativos Clear/Move/Refresh estacionados");
    return true;
  }
  var barState = "";
  function barLog(s) { if (s !== barState) { barState = s; console.log(TAG, "barra:", s); } }
  function updateBar(scene) {
    var b0 = boosterNatives[0];
    if (!b0 || !b0.isValid) {
      boosterNatives = [null, null, null];
      if (!captureNatives(scene)) { bar.style.display = "none"; barLog("oculta (botoes nativos nao encontrados na cena)"); return; }
      b0 = boosterNatives[0];
    }
    if (!b0.activeInHierarchy) {
      bar.style.display = "none";
      var why = !b0.active ? "botao .active=false (modo de uso/painel do jogo)" : "ancestral inativo";
      barLog("oculta (" + why + ")");
      return;
    }
    bar.style.display = "flex";
    barLog("visivel");
    var items = readItems();
    var els = bar.querySelectorAll(".mbBadge");
    for (var i = 0; i < 3; i++) {
      var c = itemCount(items, i);
      els[i].textContent = String(c);
      els[i].classList.toggle("zero", c === 0);
    }
  }

  var hooksDone = false;
  function inspectNew(child) {
    try {
      if (!child || child._mbKind || !hasMaskChild(child)) return;
      var kind = classify(child);
      if (!kind) return;
      park(child, kind);            // nasce/entra ja estacionado
      setTimeout(function () {      // espera o controller preencher labels
        if (child.isValid && child.activeInHierarchy && !current) show(child, kind);
      }, 60);
    } catch (e) {}
  }
  function installHooks() {
    if (hooksDone || !window.cc || !cc.Node || !cc.director) return;
    hooksDone = true;

    // 1) cc.instantiate: o ponto mais cedo possivel — antes de entrar na cena
    if (cc.instantiate) {
      var oInst = cc.instantiate;
      var wrapped = function (o) {
        var r = oInst.apply(this, arguments);
        try { if (r instanceof cc.Node) inspectNew(r); } catch (e) {}
        return r;
      };
      for (var k in oInst) wrapped[k] = oInst[k]; // preserva ._clone etc.
      cc.instantiate = wrapped;
    }
    // 2) setParent: cobre addChild E node.parent = x
    var oSetParent = cc.Node.prototype.setParent;
    cc.Node.prototype.setParent = function (p) {
      var r = oSetParent.apply(this, arguments);
      if (p) {
        if (!this._mbKind) inspectNew(this);
        else if (!this._mbShowing) {
          var n = this, kind = this._mbKind;
          if (n.x < PARK_X / 2) n.x += PARK_X;
          setTimeout(function () {
            if (n.isValid && n.activeInHierarchy && !current) show(n, kind);
          }, 60);
        }
      }
      return r;
    };
    // 3) active=true: reabertura de cacheado OU modal embutido na cena
    var d = Object.getOwnPropertyDescriptor(cc.Node.prototype, "active");
    if (d && d.set) {
      Object.defineProperty(cc.Node.prototype, "active", {
        configurable: true,
        get: d.get,
        set: function (v) {
          d.set.call(this, v);
          if (!v) return;
          if (!this._mbKind) { inspectNew(this); return; }
          if (!this._mbShowing) {
            var n = this, kind = this._mbKind;
            if (n.x < PARK_X / 2) n.x += PARK_X;
            setTimeout(function () {
              if (n.isValid && n.activeInHierarchy && !current) show(n, kind);
            }, 60);
          }
        }
      });
    }
    // 4) enforcement POR FRAME: antes de cada draw, forca estacionamento.
    //    Mesmo que o tween de abertura reposicione, nenhum frame vai a tela.
    cc.director.on(cc.Director.EVENT_BEFORE_DRAW, function () {
      for (var i = parked.length - 1; i >= 0; i--) {
        var n = parked[i].node;
        if (!n || !n.isValid) { parked.splice(i, 1); continue; }
        if (n.x < PARK_X / 2) n.x += PARK_X;
      }
      for (var b = 0; b < 3; b++) {
        var bn = boosterNatives[b];
        if (bn && bn.isValid && bn.x < PARK_X / 2) bn.x += PARK_X;
      }
    });
    console.log(TAG, "hooks instalados (instantiate/setParent/active/beforeDraw)");
  }

  setInterval(function () {
    try {
      if (!window.cc || !cc.director || !cc.director.getScene) return;
      installHooks();
      applyAudio();
      var scene = cc.director.getScene(); if (!scene) return;
      updateBar(scene);
      updatePill(scene);
      purgeTouchOrphans();
      hookPopup();
      loadingWatchdog();
      // dispara o preload ~2.5s depois do jogo subir (nao concorre com o boot)
      if (!bootSeenAt) bootSeenAt = Date.now();
      else if (preloadState === 0 && Date.now() - bootSeenAt > 2500) preloadAll();

      // modal DOM aberto: fecha se o nativo sumiu; mantem estacionado
      if (current) {
        var r = current.root;
        if (!r || !r.isValid || !r.activeInHierarchy) { hideDom(); return; }
        if (r.x < PARK_X / 2) r.x += PARK_X; // reancora se o jogo reposicionar
        return;
      }
      // fallback (caso os hooks percam algo)
      for (var i = parked.length - 1; i >= 0; i--) {
        var p = parked[i];
        if (!p.node || !p.node.isValid) { parked.splice(i,1); continue; }
        if (p.node.activeInHierarchy && !p.node._mbShowing) { show(p.node, p.kind); return; }
      }
      (function walk(n) {
        if (!n || !n.activeInHierarchy || current) return;
        if (!n._mbKind && hasMaskChild(n)) {
          var kind = classify(n);
          if (kind) { park(n, kind); show(n, kind); return; }
        }
        var c = n.children || [];
        for (var i = 0; i < c.length; i++) walk(c[i]);
      })(scene);
    } catch (e) {}
  }, 250);

  console.log(TAG, "carregado");
})();
