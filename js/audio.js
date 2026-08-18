export class AudioController {
  constructor(){this.settings=null;this.sounds=new Map();this.music=null}
  applySettings(settings){this.settings=settings;if(this.music)this.music.volume=(settings.masterVolume/100)*(settings.musicVolume/100)}
  register(name,source,{loop=false,music=false}={}){if(!source)return;const audio=new Audio(source);audio.loop=loop;if(music)this.music=audio;else this.sounds.set(name,audio);audio.addEventListener('error',()=>this.sounds.delete(name),{once:true})}
  play(name){const sound=this.sounds.get(name);if(!sound||!this.settings)return;sound.volume=(this.settings.masterVolume/100)*(this.settings.effectsVolume/100);sound.currentTime=0;sound.play().catch(()=>{})}
  // Integration points: register "hover", "click", "open", "close", and menu music when assets become available.
}
