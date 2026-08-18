export class MenuController {
  constructor({scene,overlay,audio}){this.scene=scene;this.overlay=overlay;this.audio=audio;this.active=null;this.returnFocus=null}
  init(){
    document.querySelectorAll('.plank').forEach(button=>button.addEventListener('pointerenter',()=>this.audio.play('hover')));
    document.querySelectorAll('[data-panel]').forEach(button=>button.addEventListener('click',()=>this.open(button.dataset.panel,button)));
    this.overlay.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>this.close()));
    this.overlay.addEventListener('pointerdown',event=>{if(event.target===this.overlay)this.close()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&this.active){event.preventDefault();this.close()}if(event.key==='Tab'&&this.active)this.trapFocus(event)});
  }
  open(id,trigger){const panel=this.overlay.querySelector(`[data-panel-id="${id}"]`);if(!panel)return;this.returnFocus=trigger;this.active=panel;this.scene.classList.add('obscured');this.scene.setAttribute('aria-hidden','true');this.overlay.classList.add('open');this.overlay.setAttribute('aria-hidden','false');panel.classList.add('active');this.audio.play('open');requestAnimationFrame(()=>panel.querySelector('button,input,select')?.focus())}
  close({restoreFocus=true}={}){if(this.active){this.audio.play('close');this.active.classList.remove('active')}this.active=null;this.overlay.classList.remove('open','leaving');this.overlay.setAttribute('aria-hidden','true');this.scene.classList.remove('obscured');if(!this.scene.classList.contains('inactive'))this.scene.setAttribute('aria-hidden','false');if(restoreFocus)this.returnFocus?.focus()}
  trapFocus(event){const items=[...this.active.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled])')];if(!items.length)return;const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
}
