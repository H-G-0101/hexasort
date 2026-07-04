/* ============================================================
   SETTINGS bridge (Color Block Jam - estudo)
   Substitui a janela nativa de settings (home e gameplay).
   Home: toggles de Musica/Som. Gameplay (pause): idem + Continuar.
   API do jogo: scene.soundMngr.{soundMuteToogle,musicMuteToogle,
                isSoundMute,isMusicMute}
   ============================================================ */
(function () {
  "use strict";
  (function(){var st=document.createElement('style');st.textContent='#stOverlay,#stOverlay *{overflow:visible !important}#stOverlay button{overflow:hidden !important}';document.head.appendChild(st);})();

  var overlay = null, sceneRef = null, mode = 'home';

  function css() {
    if (document.getElementById('stCss')) return;
    var st = document.createElement('style');
    st.id = 'stCss';
    st.textContent =
      '@keyframes stPop{0%{transform:scale(.7);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}' +
      '.st-row{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,#eaf6ff,#cfe9ff);border-radius:14px;padding:12px 14px;box-shadow:0 3px 0 rgba(90,140,190,.35), inset 0 1px 0 rgba(255,255,255,.8);}' +
      '.st-lbl{font:800 18px/1 "Trebuchet MS",Arial,sans-serif;color:#1b5e9e;display:flex;align-items:center;gap:9px;}' +
      '.st-sw{position:relative;width:64px;height:34px;border-radius:999px;border:none;cursor:pointer;transition:background .18s;box-shadow:inset 0 2px 4px rgba(20,60,110,.35);}' +
      '.st-sw .knob{position:absolute;top:3px;left:3px;width:28px;height:28px;border-radius:50%;background:linear-gradient(180deg,#fff,#dfeeff);box-shadow:0 2px 4px rgba(20,60,110,.4);transition:left .18s;}' +
      '.st-sw.on{background:linear-gradient(180deg,#79d92c,#3fae00);}' +
      '.st-sw.off{background:linear-gradient(180deg,#b9c7d8,#93a5bb);}' +
      '.st-sw.on .knob{left:33px;}' +
      '.st-cont{border:none;cursor:pointer;border-radius:14px;padding:13px 0;width:100%;font:800 18px/1 "Trebuchet MS",Arial,sans-serif;color:#fff;background:linear-gradient(180deg,#79d92c,#3fae00);box-shadow:0 4px 0 #2d7d00, inset 0 1px 0 rgba(255,255,255,.5);text-shadow:0 1px 2px rgba(30,80,0,.5);}' +
      '.st-cont:active{transform:translateY(2px);box-shadow:0 2px 0 #2d7d00;}';
    document.head.appendChild(st);
  }

  function gearSVG() {
    return '<svg width="26" height="26" viewBox="0 0 24 24" fill="#1b5e9e"><path d="M19.4 13a7.6 7.6 0 0 0 .1-1l2-1.5a.6.6 0 0 0 .1-.8l-1.9-3.2a.6.6 0 0 0-.7-.3l-2.3 1a7.5 7.5 0 0 0-1.7-1l-.3-2.5a.6.6 0 0 0-.6-.5h-3.8a.6.6 0 0 0-.6.5l-.3 2.5c-.6.3-1.2.6-1.7 1l-2.3-1a.6.6 0 0 0-.7.3L2.8 9.7a.6.6 0 0 0 .1.8l2 1.5a7.6 7.6 0 0 0 0 2l-2 1.5a.6.6 0 0 0-.1.8l1.9 3.2c.2.3.5.4.7.3l2.3-1c.5.4 1.1.8 1.7 1l.3 2.5c0 .3.3.5.6.5h3.8c.3 0 .6-.2.6-.5l.3-2.5c.6-.3 1.2-.6 1.7-1l2.3 1c.3.1.6 0 .7-.3l1.9-3.2a.6.6 0 0 0-.1-.8l-2-1.5ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"/></svg>';
  }

  function modalHTML() {
    var isGame = (mode === 'game');
    return '' +
    '<div style="position:relative;max-width:320px;width:90%;">' +
      '<div id="stModal" style="animation:stPop .35s ease-out;position:relative;background:linear-gradient(180deg,#5db8f7,#3f9ef0);border-radius:22px;padding:14px 12px;box-shadow:0 10px 26px rgba(10,40,90,.45), inset 0 2px 0 rgba(255,255,255,.5);border:3px solid #2f7fd0;">' +
        '<button id="stCloseBtn" style="position:absolute;top:-16px;right:-10px;width:44px;height:44px;border-radius:50%;border:3px solid #fff;background:linear-gradient(180deg,#ff6a5e,#e23a2c);color:#fff;font:800 20px/1 Arial;cursor:pointer;box-shadow:0 4px 8px rgba(120,20,10,.4);">&#10005;</button>' +
        '<div style="background:linear-gradient(180deg,#4aa9f5,#2f8fe8);border-radius:14px;padding:12px 8px;margin:4px 4px 14px;box-shadow:inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 0 rgba(20,70,140,.35);">' +
          '<div style="text-align:center;font:800 24px/1.1 \'Trebuchet MS\',Arial,sans-serif;color:#fff;text-shadow:0 2px 0 rgba(20,70,140,.5);">' + (isGame ? 'Pause' : 'Settings') + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;padding:0 4px;">' +
          '<div class="st-row"><span class="st-lbl">&#127925; Music</span><button class="st-sw" id="stMusic"><span class="knob"></span></button></div>' +
          '<div class="st-row"><span class="st-lbl">&#128266; Sound</span><button class="st-sw" id="stSound"><span class="knob"></span></button></div>' +
          (isGame ? '<button class="st-cont" id="stContinue" style="margin-top:4px;">&#9654; Continue</button>' +'<button class="st-cont st-home" id="stHome" style="background:linear-gradient(180deg,#ffb340,#f28c00);box-shadow:0 4px 0 #b56400, inset 0 1px 0 rgba(255,255,255,.5);text-shadow:0 1px 2px rgba(120,60,0,.5);">&#127968; Home</button>' : '') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function sm() { return sceneRef && sceneRef.soundMngr; }

  function paint(btn, on) {
    btn.classList.toggle('on', !!on);
    btn.classList.toggle('off', !on);
  }

  function refresh() {
    var m = sm(); if (!m) return;
    paint(document.getElementById('stMusic'), !m.isMusicMute());
    paint(document.getElementById('stSound'), !m.isSoundMute());
  }

  function click() { try { sceneRef.sounds.play('click'); } catch (e) {} }

  function ensureOverlay() {
    css();
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'stOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99998;display:none;align-items:center;justify-content:center;background:rgba(8,25,55,0.55);';
    document.body.appendChild(overlay);
  }

  function fitModal(){
    var m=document.getElementById('stModal');
    if(!m||!overlay||overlay.style.display==='none')return;
    m.style.transform='none';
    var vw=window.innerWidth,vh=window.innerHeight,w=m.offsetWidth,h=m.offsetHeight;
    var over=40,margin=14;
    var sc=Math.min(1,(vw-2*margin)/w,(vh-2*margin)/(h+2*over));
    m.style.transformOrigin='center center';
    m.style.transform='scale('+sc+')';
    try{
      var r=m.getBoundingClientRect(),top=r.top,bot=r.bottom,els=m.querySelectorAll('*');
      for(var i=0;i<els.length;i++){var b=els[i].getBoundingClientRect();if(b.height>0){if(b.top<top)top=b.top;if(b.bottom>bot)bot=b.bottom;}}
      var dy=0;
      if(top<margin)dy=margin-top;else if(bot>vh-margin)dy=(vh-margin)-bot;
      if(bot-top>vh-2*margin)dy=margin-top;
      if(dy)m.style.transform='translateY('+dy+'px) scale('+sc+')';
    }catch(e){}
  }
  window.addEventListener('resize', fitModal);

  function open(scene, m) {
    sceneRef = scene || sceneRef;
    mode = m || 'home';
    ensureOverlay();
    overlay.innerHTML = modalHTML();
    document.getElementById('stCloseBtn').addEventListener('click', close);
    document.getElementById('stMusic').addEventListener('click', function () {
      var s = sm(); if (!s) return;
      s.musicMuteToogle(); click(); refresh();
    });
    document.getElementById('stSound').addEventListener('click', function () {
      var s = sm(); if (!s) return;
      s.soundMuteToogle(); click(); refresh();
    });
    var c = document.getElementById('stContinue');
    if (c) c.addEventListener('click', function(){ click(); close(); });
    var hbtn = document.getElementById('stHome');
    if (hbtn) hbtn.addEventListener('click', function(){
      click(); close();
      try { if (sceneRef && sceneRef.closeLevel) sceneRef.closeLevel(false, false, true); } catch (e) {}
    });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    refresh();
    overlay.style.display = 'flex';
    fitModal(); setTimeout(fitModal, 60); setTimeout(fitModal, 250);
  }

  function close() {
    if (overlay) overlay.style.display = 'none';
    click();
  }

  window.__settingsBridge = { open: open, close: close };
})();
