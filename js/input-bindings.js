const LABELS={Space:'SPACE',Escape:'ESC',ArrowUp:'UP',ArrowDown:'DOWN',ArrowLeft:'LEFT',ArrowRight:'RIGHT'};
class InputBindings {
  constructor(){this.defaults={forward:'KeyW',backward:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',interact:'KeyE'};this.values={...this.defaults};this.listeners=new Set()}
  load(values={}){this.values={...this.defaults,...values};this.emit()}
  set(action,code){if(this.defaults[action]&&code){this.values[action]=code;this.emit()}}
  get(action){return this.values[action]}
  label(action){const code=this.get(action);return LABELS[code]||code?.replace(/^Key/,'').replace(/^Digit/,'')||'?'}
  subscribe(listener){this.listeners.add(listener);return()=>this.listeners.delete(listener)}
  emit(){this.listeners.forEach(listener=>listener(this.values))}
  toJSON(){return {...this.values}}
}
export const inputBindings=new InputBindings();
