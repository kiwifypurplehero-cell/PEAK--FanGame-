import {AudioController} from './audio.js';
import {MenuController} from './menu.js';
import {SettingsController} from './settings.js';
import {initPixiMenu} from './pixi-menu.js';
import {AirportLobby} from './airport-lobby.js';

const scene=document.querySelector('#menu-scene'),overlay=document.querySelector('#overlay');
const audio=new AudioController();
const menu=new MenuController({scene,overlay,audio});menu.init();
new SettingsController(document.querySelector('[data-panel-id="settings"]'),audio).init();
initPixiMenu(document.querySelector('#pixi-menu'));
document.querySelectorAll('[data-maintenance]').forEach(button=>button.addEventListener('click',()=>menu.open('maintenance',button)));
let airport;
document.querySelector('#play-airport').addEventListener('click',()=>{scene.classList.add('inactive');scene.setAttribute('aria-hidden','true');const game=document.querySelector('#airport-game');game.classList.add('active');game.setAttribute('aria-hidden','false');airport??=new AirportLobby({canvas:document.querySelector('#airport-canvas'),prompt:document.querySelector('#interaction-prompt'),panel:document.querySelector('#terminal-panel')});airport.start()});
document.querySelector('#airport-exit').addEventListener('click',()=>{airport?.stop();document.querySelector('#airport-game').classList.remove('active');document.querySelector('#airport-game').setAttribute('aria-hidden','true');scene.classList.remove('inactive');scene.setAttribute('aria-hidden','false')});
document.querySelectorAll('[data-tab]').forEach(tab=>tab.addEventListener('click',()=>{const panel=tab.closest('.settings-panel');panel.querySelectorAll('[data-tab]').forEach(item=>item.setAttribute('aria-selected',item===tab));panel.querySelectorAll('[data-tab-page]').forEach(page=>page.classList.toggle('active',page.dataset.tabPage===tab.dataset.tab));}));
const fullscreen=document.querySelector('#fullscreen-button'),note=document.querySelector('#fullscreen-note');
if(!document.documentElement.requestFullscreen){fullscreen.disabled=true;fullscreen.textContent='UNAVAILABLE'}
fullscreen.addEventListener('click',async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch{note.textContent='Fullscreen could not be enabled.'}});
document.addEventListener('fullscreenchange',()=>fullscreen.textContent=document.fullscreenElement?'EXIT':'ENTER');
document.querySelector('#quit-yes').addEventListener('click',()=>{window.close();menu.close();document.querySelector('#farewell').classList.add('open')});
document.querySelector('#return-menu').addEventListener('click',()=>document.querySelector('#farewell').classList.remove('open'));
