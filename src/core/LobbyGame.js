import {EngineManager} from './EngineManager.js';
import {createAirport} from '../world/createAirport.js';
import {PlayerController} from '../player/PlayerController.js';
import {InteractionManager} from '../interactions/InteractionManager.js';
import {LobbyPanelUI} from '../ui/LobbyPanelUI.js';

export class LobbyGame {
  constructor(canvas,{onPanelChange=()=>{}}={}){this.canvas=canvas;this.core=new EngineManager(canvas);this.onPanelChange=onPanelChange}
  async init(){
    const engine=this.core.create(),scene=new BABYLON.Scene(engine);scene.clearColor=BABYLON.Color4.FromHexString('#8bc9e8ff');scene.collisionsEnabled=true;scene.gravity=new BABYLON.Vector3(0,-.22,0);scene.imageProcessingConfiguration.exposure=1.12;scene.imageProcessingConfiguration.contrast=1.02;scene.skipPointerMovePicking=true;
    const airport=createAirport(scene);this.player=new PlayerController(scene,this.canvas);this.interactions=new InteractionManager(scene,this.player.camera,document.querySelector('#interaction-prompt'));this.ui=new LobbyPanelUI(open=>{this.player.setEnabled(!open);this.interactions.enabled=!open;if(open)this.interactions.select(null);this.onPanelChange(open)});
    const register=(mesh,name,text,point,action,distance=3.2)=>this.interactions.register({mesh,interactableName:name,interactionText:text,interactionDistance:distance,interactionKey:'e',interactionPoint:point,interactionAction:()=>{this.player.playInteraction();action()}});
    register(airport.kiosk,'Invite Kiosk','Use Invite Kiosk',airport.points.kiosk,()=>this.ui.show('invite'));
    register(airport.expedition,'Expedition Desk','Select Expedition',airport.points.expedition,()=>this.ui.show('expedition'),3.5);
    register(airport.settings,'Game Configuration','Configure Game',airport.points.settings,()=>this.ui.show('settings'),3.5);
    register(airport.gate,'Departure Gate','Check Departure Gate',airport.points.gate,()=>this.ui.toast('Expedition not ready'),3.6);
    this.mobileInteract=document.querySelector('#mobile-interact');this.mobileInteract.onclick=()=>this.interactions.interact();scene.onBeforeRenderObservable.add(()=>{this.player.update();this.interactions.update();this.mobileInteract.classList.toggle('visible',!!this.interactions.current)});
    await scene.whenReadyAsync();engine.resize();scene.render();console.info('[FEANK] Airport lobby ready',{camera:this.player.camera.position.asArray(),spawnSafe:true,meshes:scene.meshes.length,lights:scene.lights.length});this.core.run(scene);
  }
  pause(){this.core.engine?.stopRenderLoop()}
  dispose(){if(this.mobileInteract){this.mobileInteract.onclick=null;this.mobileInteract.classList.remove('visible')}this.ui?.dispose();this.interactions?.dispose();this.player?.dispose();this.core.dispose()}
}
