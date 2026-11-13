(()=>{
  const style=document.createElement('style');
  style.textContent=`#devMenuToggle{position:fixed;right:14px;top:14px;z-index:99999;background:#202b38;color:#fff;border:1px solid #6d8298;border-radius:8px;padding:9px 13px;font:600 13px Arial;cursor:pointer}#devMenuPanel{position:fixed;right:14px;top:54px;z-index:99999;width:min(330px,calc(100vw - 28px));max-height:calc(100vh - 70px);overflow:auto;box-sizing:border-box;background:rgba(17,25,35,.97);color:#edf4fb;border:1px solid #647b91;border-radius:12px;padding:14px;font:13px Arial;box-shadow:0 10px 35px #0008}#devMenuPanel[hidden]{display:none}#devMenuPanel h3{margin:0 0 5px;font-size:18px}#devMenuPanel .sub{color:#9fb2c5;font-size:11px;margin-bottom:12px}#devMenuPanel label{display:block;margin:10px 0 5px;color:#dbe8f4}#devMenuPanel select,#devMenuPanel input[type=number]{box-sizing:border-box;width:100%;padding:7px;border-radius:6px;border:1px solid #52677c;background:#263646;color:#fff}#devMenuPanel input[type=range]{width:100%}#devMenuPanel button{background:#365b78;color:white;border:0;border-radius:6px;padding:8px 10px;cursor:pointer}#devMenuPanel button:hover{background:#47799e}#devMenuPanel .line{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:9px 0}#devMenuPanel .line label{margin:0}#devMenuPanel .wide{width:100%;margin-top:8px}#devMenuPanel .status{color:#a9c5dc;font-size:11px;margin-top:10px;line-height:1.5}#devMenuPanel .split{display:grid;grid-template-columns:1fr 1fr;gap:8px}`;

  style.textContent += `
  /* Mobile and touch layout */
  #devMenuToggle{min-height:44px;min-width:44px;touch-action:manipulation}
  #devMenuPanel button,#devMenuPanel select,#devMenuPanel input{min-height:42px;font-size:14px;touch-action:manipulation}
  #devMenuPanel input[type=checkbox]{width:22px;height:22px;accent-color:#72c5ff}
  #devMenuPanel input[type=range]{min-height:34px;accent-color:#72c5ff}
  #devMenuPanel select,#devMenuPanel input[type=number]{font-size:16px}
  @media (max-width:600px){
    #devMenuToggle{top:auto;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));padding:11px 14px;border-radius:999px;font-size:12px;box-shadow:0 4px 18px #0008}
    #devMenuPanel{left:10px;right:10px;top:auto;bottom:calc(66px + env(safe-area-inset-bottom));width:auto;max-height:min(72dvh,620px);overflow-y:auto;padding:14px;border-radius:16px;overscroll-behavior:contain}
    #devMenuPanel h3{font-size:19px}
    #devMenuPanel .line{min-height:42px}
    #devMenuPanel .split{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
    #devMenuPanel .split button{min-height:46px}
    #devMenuPanel .wide{min-height:46px}
  }
  @media (max-width:360px){
    #devMenuPanel{left:6px;right:6px;padding:11px}
    #devMenuPanel .split{gap:6px}
    #devMenuPanel button{padding:8px 6px;font-size:13px}
  }`;

  document.head.appendChild(style);
  const toggle=document.createElement('button');toggle.id='devMenuToggle';toggle.textContent='DEV MENU · F4';
  const panel=document.createElement('section');panel.id='devMenuPanel';panel.hidden=true;
  panel.innerHTML=`<h3>Developer menu</h3><div class='sub'>Local game controls · changes apply to this save session</div><div class='line'><label for='dmHoney'>Unlimited honey</label><input id='dmHoney' type='checkbox'></div><div class='line'><label for='dmAuto'>Auto-collect tokens</label><input id='dmAuto' type='checkbox'></div><label for='dmSpeed'>Movement speed: <b id='dmSpeedValue'>1.0×</b></label><input id='dmSpeed' type='range' min='0.25' max='8' step='0.25' value='1'><label for='dmBee'>Bee type</label><select id='dmBee'></select><div class='split'><div><label for='dmLevel'>Bee level</label><input id='dmLevel' type='number' min='1' max='20' value='1'></div><div style='display:flex;align-items:end'><button id='dmSpawn' class='wide'>Spawn bee</button></div></div><label for='dmField'>Teleport to field</label><select id='dmField'></select><button id='dmTeleport' class='wide'>Teleport</button><div class='split'><button id='dmPause'>Pause simulation</button><button id='dmClose'>Close menu</button></div><button id='dmReconnect' class='wide'>Reconnect to game</button><div id='dmStatus' class='status'>Waiting for game…</div>`;
  document.body.append(toggle,panel);
  const $=id=>panel.querySelector('#'+id);
  let api=null;
  const status=message=>{$('dmStatus').textContent=message};
  const open=()=>{panel.hidden=!panel.hidden};
  toggle.addEventListener('click',open);$('dmClose').addEventListener('click',()=>panel.hidden=true);
  document.addEventListener('keydown',e=>{if(e.key==='F4'){e.preventDefault();open()}});
  const requireAPI=()=>{if(api)return true;status('Not connected yet — start a save, then tap Reconnect.');return false};
  $('dmHoney').addEventListener('change',e=>{if(requireAPI())api.setUnlimitedHoney(e.target.checked)});
  $('dmAuto').addEventListener('change',e=>{if(requireAPI())api.setAutoCollect(e.target.checked)});
  $('dmSpeed').addEventListener('input',e=>{const v=Number(e.target.value);$('dmSpeedValue').textContent=v.toFixed(2)+'×';if(requireAPI())api.setSpeedMultiplier(v)});
  $('dmSpawn').addEventListener('click',()=>{if(!requireAPI())return;try{const n=api.spawnBee($('dmBee').value,$('dmLevel').value);status('Spawned a bee. Active bees: '+n)}catch(e){status('Could not spawn bee: '+e.message)}});
  $('dmTeleport').addEventListener('click',()=>{if(!requireAPI())return;try{status('Teleported to '+api.teleportToField($('dmField').value))}catch(e){status('Teleport failed: '+e.message)}});
  $('dmPause').addEventListener('click',()=>{if(!requireAPI())return;const paused=!api.getState().paused;api.setPaused(paused);$('dmPause').textContent=paused?'Resume simulation':'Pause simulation';status(paused?'Simulation paused':'Simulation resumed')});
  $('dmReconnect').addEventListener('click',()=>{api=null;initialize()});
  function initialize(){
    if(api)return;
    try{
      if(!window.devMenuAPI&&typeof window.exposeCheats==='function')window.exposeCheats();
      api=window.devMenuAPI||null;
      if(!api){status('Start or load a game save, then tap Reconnect.');return}
      if(!$('dmBee').options.length){
        for(const bee of api.getBeeTypes()){const o=document.createElement('option');o.value=bee;o.textContent=bee;if(bee==='basic')o.selected=true;$('dmBee').appendChild(o)}
        for(const field of api.getFields()){const o=document.createElement('option');o.value=field.name;o.textContent=field.label;$('dmField').appendChild(o)}
      }
      api.setUnlimitedHoney($('dmHoney').checked);
      api.setAutoCollect($('dmAuto').checked);
      api.setSpeedMultiplier(Number($('dmSpeed').value));
      status('Connected · '+api.getState().bees+' active bees');
    }catch(e){api=null;status('Connection error: '+e.message)}
  }
  setInterval(()=>{initialize();if(api){try{api.tick();const s=api.getState();if(!$('dmPause').matches(':active'))$('dmPause').textContent=s.paused?'Resume simulation':'Pause simulation';status('Connected · Honey: '+Math.round(s.honey).toLocaleString()+' · Bees: '+s.bees+' · Speed: '+s.speed.toFixed(2)+'×'+(s.paused?' · PAUSED':''))}catch(e){api=null;status('Game disconnected: '+e.message)}}},250);
})();