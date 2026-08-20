import {EngineManager} from './EngineManager.js';
import {createPlatformWorld} from '../world/createPlatformWorld.js';
import {PlayerController} from '../player/PlayerController.js';
import {InteractionManager} from '../interactions/InteractionManager.js';
import {LobbyPanelUI} from '../ui/LobbyPanelUI.js';

export class LobbyGame {
  constructor(canvas,{onPanelChange=()=>{}}={}){this.canvas=canvas;this.core=new EngineManager(canvas);this.onPanelChange=onPanelChange}
  async init(){
    const engine=this.core.create(),scene=new BABYLON.Scene(engine);scene.collisionsEnabled=true;scene.gravity=new BABYLON.Vector3(0,-.22,0);scene.imageProcessingConfiguration.exposure=1.05;scene.imageProcessingConfiguration.contrast=1;scene.skipPointerMovePicking=true;
    const world=createPlatformWorld(scene);this.player=new PlayerController(scene,this.canvas);this.interactions=new InteractionManager(scene,this.player.camera,document.querySelector('#interaction-prompt'));this.ui=new LobbyPanelUI(open=>{this.player.setEnabled(!open);this.interactions.enabled=!open;if(open)this.interactions.select(null);this.onPanelChange(open)});
    const register=(mesh,name,text,point,action,distance=3.2)=>this.interactions.register({mesh,interactableName:name,interactionText:text,interactionDistance:distance,interactionKey:'e',interactionPoint:point,interactionAction:()=>{this.player.playInteraction();action()}});
    register(world.laptop,'Laptop','Use Laptop',world.laptopPoint,()=>this.ui.show('laptop'),2.8);
    register(world.kiosk,'Terminal Kiosk','Check Kiosk',world.kioskPoint,()=>this.ui.show('kiosk'),2.7);
    this.mobileInteract=document.querySelector('#mobile-interact');this.mobileInteract.onclick=()=>this.interactions.interact();scene.onBeforeRenderObservable.add(()=>{this.player.update();this.interactions.update();const available=!!this.interactions.current;this.mobileInteract.classList.toggle('visible',available);this.mobileInteract.setAttribute('aria-hidden',String(!available))});
    await scene.whenReadyAsync();engine.resize();scene.render();console.info('[FEANK] Compact airport ready',{camera:this.player.camera.position.asArray(),spawnSafe:true,meshes:scene.meshes.length,lights:scene.lights.length,lighting:'sunrise + fill + practical',renderLoops:1});this.core.run(scene);
  }
  pause(){this.core.engine?.stopRenderLoop()}
  dispose(){if(this.mobileInteract){this.mobileInteract.onclick=null;this.mobileInteract.classList.remove('visible');this.mobileInteract.setAttribute('aria-hidden','true')}this.ui?.dispose();this.interactions?.dispose();this.player?.dispose();this.core.dispose()}
}
