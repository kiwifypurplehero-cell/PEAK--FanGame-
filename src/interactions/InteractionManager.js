export class Interactable {
  constructor({mesh,interactableName,interactionText,interactionDistance=2.8,interactionKey='e',interactionPoint,interactionAction}){Object.assign(this,{mesh,interactableName,interactionText,interactionDistance,interactionKey,interactionPoint,interactionAction});mesh.metadata={...(mesh.metadata||{}),interactable:this}}
}
export class InteractionManager {
  constructor(scene,camera,prompt){this.scene=scene;this.camera=camera;this.prompt=prompt;this.items=[];this.current=null;this.enabled=true;this.key=e=>{if(e.key.toLowerCase()===this.current?.interactionKey&&this.enabled)this.interact()};addEventListener('keydown',this.key)}
  register(config){const item=new Interactable(config);this.items.push(item);return item}
  update(){if(!this.enabled)return this.select(null);const ray=this.camera.getForwardRay(3.5);const hit=this.scene.pickWithRay(ray,m=>m.isPickable!==false);let node=hit?.pickedMesh,item=null;while(node&&!item){item=node.metadata?.interactable||null;node=node.parent}this.select(item&&hit.distance<=item.interactionDistance?item:null)}
  select(item){this.current=item;if(!item){this.prompt.classList.remove('visible');this.prompt.setAttribute('aria-hidden','true');return}const engine=this.scene.getEngine(),viewport=this.camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight()),p=BABYLON.Vector3.Project(item.interactionPoint,BABYLON.Matrix.Identity(),this.scene.getTransformMatrix(),viewport);this.prompt.style.left=`${p.x}px`;this.prompt.style.top=`${p.y}px`;this.prompt.querySelector('strong').textContent=`[ ${item.interactionKey.toUpperCase()} ]`;this.prompt.querySelector('span').textContent=item.interactionText;this.prompt.classList.add('visible');this.prompt.setAttribute('aria-hidden','false')}
  interact(){this.current?.interactionAction?.(this.current)}
  dispose(){removeEventListener('keydown',this.key)}
}
