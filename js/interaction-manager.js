import {inputBindings} from './input-bindings.js';
import {t,subscribeLanguage} from './i18n.js';

export const interactionDistance=2.5;
export const getInteractBindingLabel=()=>inputBindings.label('interact');

export class InteractionManager {
  constructor(scene,player,prompt,terminalUI){
    this.scene=scene;this.player=player;this.prompt=prompt;this.ui=terminalUI;this.items=[];this.currentInteraction=null;this.debug=false;this.debugState='';
    this.prompt.innerHTML='<strong></strong><span></span>';
    this.onKey=event=>{if(event.repeat)return;if(event.code==='Escape'&&this.ui.opened){event.preventDefault();this.ui.close();this.select(null)}else if(event.code===inputBindings.get('interact')&&this.currentInteraction&&!this.ui.opened){event.preventDefault();this.currentInteraction.action()}};
    window.addEventListener('keydown',this.onKey);subscribeLanguage(()=>this.currentInteraction&&this.select(this.currentInteraction));scene.onBeforeRenderObservable.add(()=>this.update());
  }
  register(interaction){interaction.distance=interaction.distance??interactionDistance;this.items.push(interaction);return interaction}
  update(){
    if(this.ui.opened)return this.select(null);
    const camera=this.player.camera,ray=camera.getForwardRay(interactionDistance),hit=this.scene.pickWithRay(ray,mesh=>mesh.isPickable&&mesh.isEnabled());
    const item=this.items.find(candidate=>candidate.mesh===hit?.pickedMesh);let selected=null,distance=Infinity,facingDot=-1;
    if(item){
      const anchorPosition=item.anchor.getAbsolutePosition(),rootPosition=item.root.getAbsolutePosition();distance=BABYLON.Vector3.Distance(camera.position,anchorPosition);
      const terminalForward=item.root.getDirection(BABYLON.Axis.Z).normalize(),terminalToPlayer=camera.position.subtract(rootPosition).normalize();facingDot=BABYLON.Vector3.Dot(terminalForward,terminalToPlayer);
      if(distance<=item.distance&&facingDot>.25)selected=item;
    }
    this.select(selected);this.logDebug({distance,facingDot,rayHit:hit?.pickedMesh?.metadata?.terminalInteraction?item?.id:hit?.pickedMesh?.name||'none'});
  }
  select(item){
    this.currentInteraction=item;
    if(!item){this.prompt.classList.remove('visible');this.prompt.setAttribute('aria-hidden','true');return}
    const camera=this.player.camera,world=item.anchor.getAbsolutePosition(),toAnchor=world.subtract(camera.globalPosition);
    if(BABYLON.Vector3.Dot(camera.getDirection(BABYLON.Axis.Z),toAnchor)<=0)return this.select(null);
    const engine=this.scene.getEngine(),viewport=camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight()),projected=BABYLON.Vector3.Project(world,BABYLON.Matrix.Identity(),this.scene.getTransformMatrix(),viewport);
    if(projected.z<0||projected.z>1)return this.select(null);
    this.prompt.style.left=`${projected.x}px`;this.prompt.style.top=`${projected.y}px`;this.prompt.querySelector('strong').textContent=`[ ${getInteractBindingLabel()} ]`;this.prompt.querySelector('span').textContent=t(item.labelKey||item.label);this.prompt.classList.add('visible');this.prompt.setAttribute('aria-hidden','false');
  }
  logDebug({distance,facingDot,rayHit}){
    if(!this.debug)return;const state=`${facingDot>.25}|${rayHit}|${this.currentInteraction?.id||'none'}|${inputBindings.get('interact')}`;if(state===this.debugState)return;this.debugState=state;
    console.debug('[INTERACTION DEBUG]',{distanceToTerminal:Number(distance.toFixed(2)),terminalFacingDot:Number(facingDot.toFixed(2)),rayHit,currentInteraction:this.currentInteraction?.id||null,currentInteractKey:inputBindings.get('interact')});
  }
}
