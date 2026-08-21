import {AudioController} from './audio.js';
import {MenuController} from './menu.js';
import {SettingsController} from './settings.js';
import {initPixiMenu} from './pixi-menu.js';

const scene=document.querySelector('#menu-scene'),overlay=document.querySelector('#overlay');
const audio=new AudioController();
const menu=new MenuController({scene,overlay,audio});menu.init();
new SettingsController(document.querySelector('[data-panel-id="settings"]'),audio).init();
initPixiMenu(document.querySelector('#pixi-menu'));
document.querySelectorAll('[data-maintenance]').forEach(button=>button.addEventListener('click',()=>menu.open('maintenance',button)));
document.querySelectorAll('[data-tab]').forEach(tab=>tab.addEventListener('click',()=>{const panel=tab.closest('.settings-panel');panel.querySelectorAll('[data-tab]').forEach(item=>item.setAttribute('aria-selected',item===tab));panel.querySelectorAll('[data-tab-page]').forEach(page=>page.classList.toggle('active',page.dataset.tabPage===tab.dataset.tab));}));
const fullscreen=document.querySelector('#fullscreen-button'),note=document.querySelector('#fullscreen-note');
if(!document.documentElement.requestFullscreen){fullscreen.disabled=true;fullscreen.textContent='UNAVAILABLE'}
fullscreen.addEventListener('click',async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch{note.textContent='Fullscreen could not be enabled.'}});
document.addEventListener('fullscreenchange',()=>fullscreen.textContent=document.fullscreenElement?'EXIT':'ENTER');
document.querySelector('#quit-yes').addEventListener('click',()=>{window.close();menu.close();document.querySelector('#farewell').classList.add('open')});
document.querySelector('#return-menu').addEventListener('click',()=>document.querySelector('#farewell').classList.remove('open'));
