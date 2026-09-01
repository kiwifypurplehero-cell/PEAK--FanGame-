export class TerminalUI {
  constructor(panel,player){this.panel=panel;this.player=player;this.opened=false;this.back=panel.querySelector('#terminal-back');this.back.addEventListener('click',()=>this.close())}
  open(){if(this.opened)return;this.opened=true;this.player.setEnabled(false);document.exitPointerLock?.();this.panel.classList.add('open');this.panel.setAttribute('aria-hidden','false');this.back.focus()}
  close(){if(!this.opened)return;this.opened=false;this.panel.classList.remove('open');this.panel.setAttribute('aria-hidden','true');this.player.setEnabled(true);this.player.canvas.focus()}
}
