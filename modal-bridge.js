/* ============================================================
   modal-bridge.js v2  (estudo local)
   Substitui modais nativos por modais DOM modernos, fazendo
   apenas a LIGAÇÃO com os handlers reais do jogo:
   - Booster (Clear etc.): card com icone real, Buy/Get/X
   - Settings: card com switches BGM/SFX/(Vibrate), X
   ============================================================ */
(function () {
  "use strict";
  var TAG = "[modal-bridge]";

  /* ---------------- CSS ---------------- */
  var css = ""
  + "#mbOverlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;"
  + "background:rgba(15,18,32,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);"
  + "font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}"
  + "#mbCard{position:relative;width:min(86vw,360px);background:#fff;border-radius:24px;"
  + "box-shadow:0 24px 60px rgba(0,0,0,.35);animation:mbPop .22s cubic-bezier(.34,1.56,.64,1)}"
  + "@keyframes mbPop{from{transform:scale(.82);opacity:0}to{transform:scale(1);opacity:1}}"
  + "#mbHead{margin:-18px 18px 0;position:relative;background:linear-gradient(135deg,#7c4dff,#448aff);"
  + "border-radius:16px;padding:14px 12px;text-align:center;color:#fff;font-size:24px;font-weight:800;"
  + "letter-spacing:.5px;text-shadow:0 2px 0 rgba(0,0,0,.18);box-shadow:0 8px 18px rgba(68,138,255,.35)}"
  + "#mbX{position:absolute;top:-14px;right:-14px;width:46px;height:46px;border:none;border-radius:50%;"
  + "background:#ff5252;color:#fff;font-size:22px;font-weight:900;line-height:46px;cursor:pointer;z-index:2;"
  + "box-shadow:0 4px 10px rgba(0,0,0,.3)}#mbX:active{transform:scale(.9)}"
  + "#mbBody{padding:14px 18px 20px}"
  /* booster */
  + "#mbIconWrap{display:flex;align-items:center;justify-content:center;margin:10px auto 6px;width:150px;height:150px;"
  + "background:radial-gradient(circle at 50% 35%,#f6f9ff,#e8eefc);border-radius:28px;box-shadow:0 6px 16px rgba(30,60,120,.10)}"
  + "#mbDes{padding:6px 8px 16px;text-align:center;color:#3a3f52;font-size:16px;line-height:1.45;font-weight:600}"
  + "#mbBtns{display:flex;gap:12px}"
  + "#mbBtns button{flex:1;border:none;border-radius:16px;padding:14px 8px;font-size:18px;font-weight:800;color:#fff;"
  + "cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"
  + "box-shadow:0 5px 0 rgba(0,0,0,.18),0 8px 16px rgba(0,0,0,.15);transition:transform .06s}"
  + "#mbBtns button:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.18)}"
  + "#mbBuy{background:linear-gradient(180deg,#42c6ff,#1e88e5)}"
  + "#mbGet{background:linear-gradient(180deg,#ffd54f,#fb9e00);color:#5c3d00!important}"
  + ".mbCoin{display:inline-block;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe680,#f4b400);"
  + "box-shadow:0 0 0 2px #d18f00 inset;font-size:13px;line-height:22px;color:#8a5c00;font-weight:900;text-align:center}"
  + ".mbPlay{display:inline-block;width:0;height:0;border-left:14px solid #5c3d00;border-top:9px solid transparent;border-bottom:9px solid transparent}"
  /* settings */
  + ".mbRow{display:flex;align-items:center;gap:14px;padding:14px 6px;border-bottom:1px solid #eef1f7}"
  + ".mbRow:last-child{border-bottom:none}"
  + ".mbRowIco{font-size:26px;width:36px;text-align:center}"
  + ".mbRowLbl{flex:1;font-size:19px;font-weight:800;color:#2d3348}"
  + ".mbSw{position:relative;width:64px;height:34px;border-radius:17px;background:#cfd6e4;cursor:pointer;"
  + "transition:background .18s;box-shadow:0 2px 4px rgba(0,0,0,.15) inset}"
  + ".mbSw.on{background:linear-gradient(180deg,#6fdc4f,#3cb527)}"
  + ".mbSw i{position:absolute;top:3px;left:3px;width:28px;height:28px;border-radius:50%;background:#fff;"
  + "box-shadow:0 2px 5px rgba(0,0,0,.25);transition:left .18s}"
  + ".mbSw.on i{left:33px}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var overlay = document.createElement("div");
  overlay.id = "mbOverlay";
  overlay.innerHTML =
    '<div id="mbCard"><button id="mbX">\u2715</button><div id="mbHead"></div><div id="mbBody"></div></div>';
  function mount(){ if(!overlay.parentNode && document.body) document.body.appendChild(overlay); }
  mount(); document.addEventListener("DOMContentLoaded", mount);

  /* ---------------- util cc ---------------- */
  function fire(node) {
    try {
      if (!node || !node.isValid) return;
      var btn = node.getComponent(cc.Button);
      if (btn && btn.clickEvents && btn.clickEvents.length)
        cc.Component.EventHandler.emitEvents(btn.clickEvents, { target: node, currentTarget: node });
      else node.emit("click", btn || node);
    } catch (e) { console.warn(TAG, "fire err", e); }
  }
  function findDesc(root, name, comp) {
    var out = null;
    (function w(n){ if(out||!n) return;
      if(n.name===name && (!comp||n.getComponent(comp))){out=n;return;}
      var c=n.children||[]; for(var i=0;i<c.length;i++) w(c[i]); })(root);
    return out;
  }
  function labelText(node) {
    if (!node) return "";
    var out="";
    (function w(n){ var lb=n.getComponent&&n.getComponent(cc.Label); if(lb&&lb.string) out+=(out?" ":"")+lb.string;
      (n.children||[]).forEach(w); })(node);
    return out;
  }
  function clickable(branch){ // botao clicavel de um ramo de toggle
    if(!branch) return null;
    if(branch.getComponent && branch.getComponent(cc.Button)) return branch;
    var out=null;
    (function w(n){ if(out||!n) return;
      if(n.activeInHierarchy && n.getComponent && n.getComponent(cc.Button)){out=n;return;}
      (n.children||[]).forEach(w); })(branch);
    return out;
  }

  var current = null; // {root, kind, ...}
  function hideDom(){ overlay.style.display="none"; current=null; }
  function open(root, kind){ root.opacity=0; root._mbDom=true; overlay.style.display="flex"; current={root:root,kind:kind}; }

  /* ---------------- BOOSTER ---------------- */
  function showBooster(root) {
    var title=findDesc(root,"Title"), des=findDesc(root,"Des");
    var buy=findDesc(root,"Buy",cc.Button)||findDesc(root,"Coin",cc.Button);
    var get=findDesc(root,"Get",cc.Button)||findDesc(root,"GetItem",cc.Button);
    var back=findDesc(root,"Back",cc.Button);
    var icon=findDesc(root,"Icon");
    document.getElementById("mbHead").textContent = labelText(title)||"Booster";
    var body=document.getElementById("mbBody");
    body.innerHTML='<div id="mbIconWrap"><div id="mbIcon"></div></div><div id="mbDes"></div><div id="mbBtns">'
      +'<button id="mbBuy"><span class="mbCoin">G</span><span id="mbBuyTxt"></span></button>'
      +'<button id="mbGet"><span class="mbPlay"></span><span id="mbGetTxt"></span></button></div>';
    document.getElementById("mbDes").textContent=labelText(des)||"";
    document.getElementById("mbBuyTxt").textContent=(labelText(buy).replace(/[^\d]/g,""))||"50";
    document.getElementById("mbGetTxt").textContent=(labelText(get)||"Get").trim().split(/\s+/)[0];
    document.getElementById("mbBuy").style.display=buy?"":"none";
    document.getElementById("mbGet").style.display=get?"":"none";
    var iconDiv=document.getElementById("mbIcon");
    try {
      var sp=icon&&icon.getComponent(cc.Sprite), sf=sp&&sp.spriteFrame, tex=sf&&sf.getTexture();
      if(tex&&tex.nativeUrl){
        var r=sf.getRect(), rot=sf.isRotated();
        var w=rot?r.height:r.width, h=rot?r.width:r.height;
        var s=Math.min(120/w,120/h);
        iconDiv.style.width=w+"px"; iconDiv.style.height=h+"px";
        iconDiv.style.background="url('"+tex.nativeUrl+"') no-repeat -"+r.x+"px -"+r.y+"px";
        iconDiv.style.transform="scale("+s+")"+(rot?" rotate(-90deg)":"");
      } else { iconDiv.textContent="\uD83D\uDD28"; iconDiv.style.fontSize="84px"; }
    } catch(e){ iconDiv.textContent="\uD83D\uDD28"; iconDiv.style.fontSize="84px"; }
    open(root,"booster");
    current.buy=buy; current.get=get; current.back=back;
    document.getElementById("mbBuy").onclick=function(){fire(current.buy);};
    document.getElementById("mbGet").onclick=function(){fire(current.get);};
    console.log(TAG,"booster DOM:",labelText(title));
  }

  /* ---------------- SETTINGS ---------------- */
  var ICO={Music:"\uD83C\uDFB5",Sound:"\uD83D\uDD0A",Vibrate:"\uD83D\uDCF3"};
  function rowState(branch){ var on=findDesc(branch,"ON"); return !!(on&&on.activeInHierarchy); }
  function showSettings(root) {
    var back=findDesc(root,"Back",cc.Button);
    var title=findDesc(root,"Title");
    document.getElementById("mbHead").textContent=labelText(title)||"Settings";
    var body=document.getElementById("mbBody"); body.innerHTML="";
    var rows=[];
    ["Music","Sound","Vibrate"].forEach(function(nm){
      var br=findDesc(root,nm);
      if(!br||!br.activeInHierarchy) return;
      var lbl=labelText(findDesc(br,"Text"))||nm;
      var row=document.createElement("div"); row.className="mbRow";
      row.innerHTML='<div class="mbRowIco">'+ICO[nm]+'</div><div class="mbRowLbl">'+lbl+
        '</div><div class="mbSw"><i></i></div>';
      var sw=row.querySelector(".mbSw");
      function sync(){ sw.classList.toggle("on", rowState(br)); }
      sync();
      sw.onclick=function(){ fire(clickable(br)); setTimeout(sync,60); setTimeout(sync,250); };
      body.appendChild(row);
      rows.push(sync);
    });
    open(root,"settings");
    current.back=back; current.sync=rows;
    console.log(TAG,"settings DOM aberto");
  }

  /* fechar */
  document.addEventListener("click",function(ev){
    if(!current) return;
    if(ev.target.id==="mbX"||ev.target===overlay){ var b=current.back; hideDom(); fire(b); }
  });

  /* ---------------- varredura ---------------- */
  function isBooster(n){ return !!(findDesc(n,"Des")&&(findDesc(n,"Get",cc.Button)||findDesc(n,"GetItem",cc.Button))
    &&(findDesc(n,"Buy",cc.Button)||findDesc(n,"VideoIcon"))&&findDesc(n,"Back",cc.Button)); }
  function isSettings(n){ return !!(findDesc(n,"Music")&&findDesc(n,"Sound")&&findDesc(n,"Back",cc.Button)); }

  setInterval(function(){
    try{
      if(!window.cc||!cc.director||!cc.director.getScene) return;
      var scene=cc.director.getScene(); if(!scene) return;
      if(current){
        if(!current.root.isValid||!current.root.activeInHierarchy) hideDom();
        else if(current.kind==="settings"&&current.sync) current.sync.forEach(function(f){f();});
        return; // um modal por vez
      }
      (function walk(n){
        if(!n||!n.activeInHierarchy||current) return;
        if(!n._mbDom && hasMaskChild(n)){
          if(isSettings(n)){ showSettings(n); return; }
          if(isBooster(n)){ showBooster(n); return; }
        }
        var c=n.children||[]; for(var i=0;i<c.length;i++) walk(c[i]);
      })(scene);
    }catch(e){}
  },300);
  // modais deste jogo tem um filho direto "Mask" (overlay escuro) — deteccao barata
  function hasMaskChild(n){
    var c=n.children||[];
    for(var i=0;i<c.length;i++) if(c[i].name==="Mask") return true;
    return false;
  }
  console.log(TAG,"v2 carregado");
})();
