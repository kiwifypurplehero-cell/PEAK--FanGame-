export class LobbyPanelUI {
  constructor(onState){this.onState=onState;this.current=null;this.escape=event=>{if(event.key==='Escape'&&this.current){event.preventDefault();this.hide()}};this.click=event=>{if(event.target.closest('[data-lobby-close]'))this.hide()};addEventListener('keydown',this.escape);document.addEventListener('click',this.click)}
  show(id){const panel=document.querySelector(`[data-lobby-panel="${id}"]`);if(!panel)return;this.hide(false);this.current=panel;panel.classList.add('open');panel.setAttribute('aria-hidden','false');this.onState(true);requestAnimationFrame(()=>panel.querySelector('button:not([disabled])')?.focus())}
  hide(notify=true){if(!this.current)return;this.current.classList.remove('open');this.current.setAttribute('aria-hidden','true');this.current=null;if(notify)this.onState(false)}
  toast(message){const toast=document.querySelector('#lobby-toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>toast.classList.remove('visible'),2600)}
  dispose(){clearTimeout(this.toastTimer);this.hide();removeEventListener('keydown',this.escape);document.removeEventListener('click',this.click)}
}
