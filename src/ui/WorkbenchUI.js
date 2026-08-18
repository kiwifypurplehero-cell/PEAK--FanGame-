export class WorkbenchUI {
  constructor(root,onState){this.root=root;this.onState=onState;this.back=root.querySelector('#workbench-back');this.close=()=>this.hide();this.escape=event=>{if(event.key==='Escape'&&this.root.classList.contains('open')){event.preventDefault();this.hide()}};this.back.addEventListener('click',this.close);addEventListener('keydown',this.escape)}
  show(){this.root.classList.add('open');this.root.setAttribute('aria-hidden','false');this.onState(true);requestAnimationFrame(()=>this.back.focus())}
  hide(){if(!this.root.classList.contains('open'))return;this.root.classList.remove('open');this.root.setAttribute('aria-hidden','true');this.onState(false)}
  dispose(){this.hide();this.back.removeEventListener('click',this.close);removeEventListener('keydown',this.escape)}
}
