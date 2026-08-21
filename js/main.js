import {AudioController} from './audio.js?v=20260821-MOBILE-RENDER-FIX-01';
import {MenuController} from './menu.js?v=20260821-MOBILE-RENDER-FIX-01';
import {SettingsController} from './settings.js?v=20260821-MOBILE-RENDER-FIX-01';
import {LobbyGame} from '../src/core/LobbyGame.js?v=20260821-MOBILE-RENDER-FIX-01';

const FEANK_BUILD = '20260821-MOBILE-RENDER-FIX-01';
window.FEANK_BUILD = FEANK_BUILD;
console.info('[FEANK] BUILD', FEANK_BUILD);

const GameState=Object.freeze({MENU:'MENU',LOADING_LOBBY:'LOADING_LOBBY',LOBBY:'LOBBY',LOBBY_PANEL:'LOBBY_PANEL'});
const app={state:GameState.MENU,sessionMode:null,lobby:null};
window.FEANK=app;

const audio=new AudioController();
const menuScene=document.querySelector('#menu-scene');
const overlay=document.querySelector('#overlay');
const shell=document.querySelector('#game-shell');
const transition=document.querySelector('#scene-transition');
const canvas=document.querySelector('#game-canvas');
const menu=new MenuController({scene:menuScene,overlay,audio});
menu.init();
new SettingsController(document.querySelector('[data-panel-id="settings"]'),audio).init();
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
const transitionText=transition.querySelector('span');
const setLoadingStage=stage=>{transitionText.textContent=stage;console.info(`[FEANK] Startup stage: ${stage}`)};
const initializationTimeout=(lastStage)=>new Promise((_,reject)=>setTimeout(()=>reject(new Error(`Lobby initialization exceeded 8 seconds. Last completed stage: ${lastStage()}`)),8000));

document.querySelectorAll('[data-tab]').forEach(tab=>tab.addEventListener('click',()=>{
  const panel=tab.closest('.settings-panel');panel.querySelectorAll('[data-tab]').forEach(item=>item.setAttribute('aria-selected',String(item===tab)));panel.querySelectorAll('[data-tab-page]').forEach(page=>page.classList.toggle('active',page.dataset.tabPage===tab.dataset.tab));
}));

const fullscreenButton=document.querySelector('#fullscreen-button');
const fullscreenNote=document.querySelector('#fullscreen-note');
if(!document.documentElement.requestFullscreen){fullscreenButton.disabled=true;fullscreenButton.textContent='UNAVAILABLE';fullscreenNote.textContent='Fullscreen is not supported by this browser.'}
fullscreenButton.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{fullscreenNote.textContent='Fullscreen could not be enabled.'}});
document.addEventListener('fullscreenchange',()=>fullscreenButton.textContent=document.fullscreenElement?'EXIT':'ENTER');

document.querySelector('#quit-yes').addEventListener('click',()=>{window.close();setTimeout(()=>{menu.close();document.querySelector('#farewell').classList.add('open');document.querySelector('#farewell').setAttribute('aria-hidden','false');document.querySelector('#return-menu').focus()},120)});
document.querySelector('#return-menu').addEventListener('click',()=>{const farewell=document.querySelector('#farewell');farewell.classList.remove('open');farewell.setAttribute('aria-hidden','true');document.querySelector('[data-panel="quit"]').focus()});

export async function startLobby(mode){
  if(app.state!==GameState.MENU||!['host','offline'].includes(mode))return;
  if(!window.BABYLON){
    const error=new Error('The local vendor/babylon.js script did not initialize window.BABYLON.');
    console.error('[FEANK] BABYLON FAILED TO INITIALIZE',error);
    transitionText.textContent='BABYLON FAILED TO INITIALIZE';transition.classList.add('active','loading','failed');
    setTimeout(()=>{transition.classList.remove('active','loading','failed');transitionText.textContent='OPENING THE TERMINAL…'},3000);return;
  }
  console.info('[FEANK] Starting lobby',mode);
  app.state=GameState.LOADING_LOBBY;app.sessionMode=mode;
  document.body.dataset.gameMode=mode;
  document.querySelectorAll('[data-start-lobby]').forEach(button=>button.disabled=true);
  menu.close({restoreFocus:false});
  document.activeElement?.blur();
  transition.classList.add('active');menuScene.classList.add('leaving');overlay.classList.add('leaving');
  await wait(560);transition.classList.add('loading');
  // Initialize WebGL at its real viewport size while the fade still covers it.
  shell.classList.add('active');shell.setAttribute('aria-hidden','false');
  let lastStage='LOCAL BABYLON READY';
  try{
    const reportStage=stage=>{lastStage=stage;setLoadingStage(stage)};
    app.lobby=new LobbyGame(canvas,{onStage:reportStage,onPanelChange:open=>{if(app.state===GameState.LOBBY||app.state===GameState.LOBBY_PANEL)app.state=open?GameState.LOBBY_PANEL:GameState.LOBBY}});
    await Promise.race([app.lobby.init(),initializationTimeout(()=>lastStage)]);
    menuScene.classList.add('inactive');menuScene.setAttribute('aria-hidden','true');
    document.querySelector('#mobile-controls').setAttribute('aria-hidden','false');
    document.body.classList.add('in-lobby');app.state=GameState.LOBBY;
    canvas.focus({preventScroll:true});
    console.info('[FEANK] 10 - Hiding loading screen');transition.classList.remove('active','loading');transitionText.textContent='OPENING THE TERMINAL…';
  }catch(error){
    console.error('[FEANK] LOBBY FAILED TO LOAD',error);shell.classList.remove('active');shell.setAttribute('aria-hidden','true');app.lobby?.dispose();app.lobby=null;app.sessionMode=null;delete document.body.dataset.gameMode;
    menuScene.classList.remove('leaving','inactive');menuScene.setAttribute('aria-hidden','false');overlay.classList.remove('leaving');transition.classList.remove('loading');transition.classList.add('failed');transitionText.textContent=`LOBBY INITIALIZATION ERROR · BUILD 20260821-MOBILE-RENDER-FIX-01 · LAST STEP: ${lastStage}`;app.state=GameState.MENU;
    document.querySelectorAll('[data-start-lobby]').forEach(button=>button.disabled=false);
    document.querySelector('#lobby-toast').textContent='The 3D lobby could not be loaded. Please check your connection.';
    setTimeout(()=>{transition.classList.remove('active','failed');transitionText.textContent='OPENING THE TERMINAL…'},3500);
  }
}

async function leaveLobby(){
  if(![GameState.LOBBY,GameState.LOBBY_PANEL].includes(app.state))return;
  app.state=GameState.LOADING_LOBBY;transition.classList.add('active');await wait(560);
  if(document.pointerLockElement)await document.exitPointerLock?.();
  shell.classList.remove('active');shell.setAttribute('aria-hidden','true');app.lobby?.dispose();app.lobby=null;
  document.querySelector('#mobile-controls').setAttribute('aria-hidden','true');
  document.body.classList.remove('in-lobby');delete document.body.dataset.gameMode;app.sessionMode=null;
  menuScene.classList.remove('leaving','inactive','obscured');menuScene.setAttribute('aria-hidden','false');overlay.classList.remove('leaving','open');
  document.querySelectorAll('[data-start-lobby]').forEach(button=>button.disabled=false);
  app.state=GameState.MENU;await wait(100);transition.classList.remove('active','loading');document.querySelector('[data-start-lobby="offline"]').focus();
}

document.querySelectorAll('[data-start-lobby]').forEach(button=>button.addEventListener('click',()=>startLobby(button.dataset.startLobby)));
document.querySelector('#lobby-menu-button').addEventListener('click',leaveLobby);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&app.state===GameState.LOBBY)leaveLobby()});
document.addEventListener('pointerlockchange',()=>document.querySelector('#game-hint').classList.toggle('hidden',!!document.pointerLockElement));
