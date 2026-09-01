import {inputBindings} from './input-bindings.js';
export class InteractionManager {
  constructor(scene,player,prompt,terminalUI){this.scene=scene;this.player=player;this.prompt=prompt;this.ui=terminalUI;this.available=false;this.onKey=event=>{if(event.code==='Escape'&&this.ui.opened){event.preventDefault();this.ui.close()}else if(event.code===inputBindings.get('interact')){if(this.ui.opened)this.ui.close();else if(this.available)this.ui.open()}};window.addEventListener('keydown',this.onKey);scene.onBeforeRenderObservable.add(()=>this.update())}
  update(){if(this.ui.opened){this.setAvailable(false);return}const hit=this.scene.pickWithRay(this.player.camera.getForwardRay(2.4),mesh=>mesh.isPickable);let valid=Boolean(hit?.hit&&hit.pickedMesh.metadata?.terminalInteraction===true);if(valid){const terminal=hit.pickedMesh.metadata.terminalRoot,toCamera=this.player.camera.position.subtract(terminal.position).normalize();valid=BABYLON.Vector3.Dot(terminal.forward,toCamera)>.35}this.setAvailable(valid)}
  setAvailable(value){this.available=value;this.prompt.textContent=value?`[ ${inputBindings.label('interact')} ] USE TERMINAL`:'';this.prompt.classList.toggle('visible',value)}
}
