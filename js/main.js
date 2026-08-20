import {AudioController} from './audio.js';
import {MenuController} from './menu.js';
import {SettingsController} from './settings.js';
import {LobbyGame} from '../src/core/LobbyGame.js';

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
  app.state=GameState.LOADING_LOBBY;app.sessionMode=mode;
  document.body.dataset.gameMode=mode;
  document.querySelectorAll('[data-start-lobby]').forEach(button=>button.disabled=true);
  menu.close({restoreFocus:false});
  document.activeElement?.blur();
  transition.classList.add('active');menuScene.classList.add('leaving');overlay.classList.add('leaving');
  await wait(560);transition.classList.add('loading');
  // Initialize WebGL at its real viewport size while the fade still covers it.
  shell.classList.add('active');shell.setAttribute('aria-hidden','false');
  try{
    app.lobby=new LobbyGame(canvas,{onPanelChange:open=>{if(app.state===GameState.LOBBY||app.state===GameState.LOBBY_PANEL)app.state=open?GameState.LOBBY_PANEL:GameState.LOBBY}});
    await app.lobby.init();
    menuScene.classList.add('inactive');menuScene.setAttribute('aria-hidden','true');
    document.querySelector('#mobile-controls').setAttribute('aria-hidden','false');
    document.body.classList.add('in-lobby');app.state=GameState.LOBBY;
    canvas.focus({preventScroll:true});
    await wait(100);transition.classList.remove('active','loading');
  }catch(error){
    console.error('Unable to initialize the lobby:',error);shell.classList.remove('active');shell.setAttribute('aria-hidden','true');app.lobby?.dispose();app.lobby=null;app.sessionMode=null;delete document.body.dataset.gameMode;
    menuScene.classList.remove('leaving','inactive');menuScene.setAttribute('aria-hidden','false');overlay.classList.remove('leaving');transition.classList.remove('active','loading');app.state=GameState.MENU;
    document.querySelectorAll('[data-start-lobby]').forEach(button=>button.disabled=false);
    document.querySelector('#lobby-toast').textContent='The 3D lobby could not be loaded. Please check your connection.';
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
