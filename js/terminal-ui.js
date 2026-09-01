import {t,subscribeLanguage} from './i18n.js';

export class TerminalUI {
  constructor(panel,player){
    this.panel=panel;this.player=player;this.opened=false;this.timer=null;this.remaining=10;
    this.back=panel.querySelector('#terminal-back');this.start=panel.querySelector('#terminal-start');this.content=panel.querySelector('.terminal-content');this.status=panel.querySelector('.terminal-status');
    this.back.addEventListener('click',()=>this.timer?this.cancelExpeditionCountdown():this.close());this.start.addEventListener('click',()=>this.startExpeditionCountdown());
    this.onEscape=event=>{if(event.code==='Escape'&&this.opened&&this.timer){event.preventDefault();event.stopImmediatePropagation();this.cancelExpeditionCountdown()}};window.addEventListener('keydown',this.onEscape,true);
    subscribeLanguage(()=>this.renderStatus());
  }
  open(){if(this.opened)return;this.opened=true;this.player.setEnabled(false);document.exitPointerLock?.();this.panel.classList.add('open');this.panel.setAttribute('aria-hidden','false');this.start.focus()}
  close(){if(!this.opened)return;this.cancelExpeditionCountdown(false);this.opened=false;this.panel.classList.remove('open');this.panel.setAttribute('aria-hidden','true');this.player.setEnabled(true);this.player.canvas.focus()}
  startExpeditionCountdown(){if(this.timer)return;this.remaining=10;this.content.hidden=true;this.status.hidden=false;this.renderStatus();this.timer=setInterval(()=>{this.remaining-=1;this.renderStatus();if(this.remaining===0){clearInterval(this.timer);this.timer=null;this.launchExpedition()}},1000)}
  launchExpedition(){this.status.innerHTML=`<span>${t('expedition.notImplemented')}</span>`;setTimeout(()=>{if(this.opened&&!this.timer){this.status.hidden=true;this.content.hidden=false;this.start.focus()}},2200)}
  cancelExpeditionCountdown(showContent=true){if(this.timer){clearInterval(this.timer);this.timer=null}if(showContent){this.status.hidden=true;this.content.hidden=false;this.start.focus()}}
  renderStatus(){if(this.timer)this.status.innerHTML=`<span>${t('expedition.startingIn')}</span><strong>${this.remaining}</strong>`}
}
