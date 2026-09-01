import {inputBindings} from './input-bindings.js';
const STORAGE_KEY = 'feank.settings.v1';
export const defaults = {language:'en',quality:'auto',masterVolume:80,musicVolume:65,effectsVolume:80,voiceVolume:75,controls:{...inputBindings.defaults}};

export class SettingsController {
  constructor(root, audioController) { this.root=root; this.audio=audioController; this.values=this.load(); }
  load(){try{return {...defaults,...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return {...defaults}}}
  save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(this.values))}catch{/* Private browsing can disable storage. */}}
  init(){
    inputBindings.load(this.values.controls);
    this.root.querySelectorAll('[data-setting]').forEach(input=>{
      const key=input.dataset.setting; input.value=this.values[key]; this.updateOutput(input);
      input.addEventListener('input',()=>{this.values[key]=input.type==='range'?Number(input.value):input.value;this.updateOutput(input);this.save();this.audio.applySettings(this.values)});
    });
    this.audio.applySettings(this.values);
    this.root.querySelectorAll('[data-keybind]').forEach(button=>{
      const action=button.dataset.keybind,refresh=()=>button.textContent=inputBindings.label(action);refresh();inputBindings.subscribe(refresh);
      button.addEventListener('click',()=>{button.textContent='PRESS KEY';button.classList.add('listening');const capture=event=>{event.preventDefault();event.stopPropagation();if(event.key==='Escape')refresh();else{inputBindings.set(action,event.code);this.values.controls=inputBindings.toJSON();this.save()}button.classList.remove('listening');window.removeEventListener('keydown',capture,true)};window.addEventListener('keydown',capture,true)});
    });
  }
  updateOutput(input){const output=input.closest('.slider-row')?.querySelector('output');if(output)output.value=input.value}
}
