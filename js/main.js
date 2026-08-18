import {AudioController} from './audio.js';
import {MenuController} from './menu.js';
import {SettingsController} from './settings.js';

const audio=new AudioController();
const menu=new MenuController({scene:document.querySelector('#menu-scene'),overlay:document.querySelector('#overlay'),audio});
menu.init();
new SettingsController(document.querySelector('[data-panel-id="settings"]'),audio).init();

document.querySelectorAll('[data-tab]').forEach(tab=>tab.addEventListener('click',()=>{
  const panel=tab.closest('.settings-panel');panel.querySelectorAll('[data-tab]').forEach(item=>item.setAttribute('aria-selected',String(item===tab)));panel.querySelectorAll('[data-tab-page]').forEach(page=>page.classList.toggle('active',page.dataset.tabPage===tab.dataset.tab));
}));

document.querySelectorAll('[data-placeholder]').forEach(button=>button.addEventListener('click',()=>{
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
