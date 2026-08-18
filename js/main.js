import {AudioController} from './audio.js';
import {MenuController} from './menu.js';
import {SettingsController} from './settings.js';
import {LobbyGame} from '../src/core/LobbyGame.js';

const audio=new AudioController();
const menu=new MenuController({scene:document.querySelector('#menu-scene'),overlay:document.querySelector('#overlay'),audio});
menu.init();
new SettingsController(document.querySelector('[data-panel-id="settings"]'),audio).init();

document.querySelectorAll('[data-tab]').forEach(tab=>tab.addEventListener('click',()=>{
  const panel=tab.closest('.settings-panel');panel.querySelectorAll('[data-tab]').forEach(item=>item.setAttribute('aria-selected',String(item===tab)));panel.querySelectorAll('[data-tab-page]').forEach(page=>page.classList.toggle('active',page.dataset.tabPage===tab.dataset.tab));
}));

document.querySelectorAll('[data-placeholder]:not([data-placeholder="game"])').forEach(button=>button.addEventListener('click',()=>{
  button.closest('.panel').querySelector('.status').textContent=button.dataset.placeholder==='lobby'?'Lobby creation is ready for a future multiplayer update.':'Expedition loading is ready for future gameplay integration.';
  audio.play('click');
}));

const fullscreenButton=document.querySelector('#fullscreen-button');
const fullscreenNote=document.querySelector('#fullscreen-note');
if(!document.documentElement.requestFullscreen){fullscreenButton.disabled=true;fullscreenButton.textContent='UNAVAILABLE';fullscreenNote.textContent='Fullscreen is not supported by this browser.'}
fullscreenButton.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{fullscreenNote.textContent='Fullscreen could not be enabled.'}});
document.addEventListener('fullscreenchange',()=>fullscreenButton.textContent=document.fullscreenElement?'EXIT':'ENTER');

document.querySelector('#quit-yes').addEventListener('click',()=>{window.close();setTimeout(()=>{menu.close();document.querySelector('#farewell').classList.add('open');document.querySelector('#farewell').setAttribute('aria-hidden','false');document.querySelector('#return-menu').focus()},120)});
document.querySelector('#return-menu').addEventListener('click',()=>{const farewell=document.querySelector('#farewell');farewell.classList.remove('open');farewell.setAttribute('aria-hidden','true');document.querySelector('[data-panel="quit"]').focus()});

const shell=document.querySelector('#game-shell'),transition=document.querySelector('#scene-transition'),canvas=document.querySelector('#game-canvas');
let lobby=null,changingScene=false;
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

async function enterLobby(){
  if(changingScene||lobby)return;
  changingScene=true;
  document.querySelectorAll('button').forEach(button=>button.blur());
  transition.classList.add('active');
  document.querySelector('#menu-scene').classList.add('leaving');
  document.querySelector('#overlay').classList.add('leaving');
  await wait(560);
  transition.classList.add('loading');
  try{
    lobby=new LobbyGame(canvas);
    await lobby.init();
    menu.close();
    shell.classList.add('active');shell.setAttribute('aria-hidden','false');
    await wait(180);transition.classList.remove('active','loading');
  }catch(error){
    console.error('Unable to initialize the lobby:',error);lobby?.dispose();lobby=null;
    document.querySelector('#menu-scene').classList.remove('leaving');document.querySelector('#overlay').classList.remove('leaving');
    transition.classList.remove('active','loading');alert('The 3D lobby could not be loaded. Please check your connection and try again.');
  }finally{changingScene=false}
}
async function leaveLobby(){
  if(changingScene||!lobby)return;changingScene=true;transition.classList.add('active');await wait(560);
  shell.classList.remove('active');shell.setAttribute('aria-hidden','true');lobby.dispose();lobby=null;
  document.querySelector('#menu-scene').classList.remove('leaving','obscured');document.querySelector('#menu-scene').setAttribute('aria-hidden','false');document.querySelector('#overlay').classList.remove('leaving','open');
  await wait(120);transition.classList.remove('active');changingScene=false;document.querySelector('[data-panel="offline"]').focus();
}
document.querySelector('[data-placeholder="game"]').addEventListener('click',enterLobby);
document.querySelector('#lobby-menu-button').addEventListener('click',leaveLobby);
document.addEventListener('pointerlockchange',()=>document.querySelector('#game-hint').classList.toggle('hidden',!!document.pointerLockElement));
