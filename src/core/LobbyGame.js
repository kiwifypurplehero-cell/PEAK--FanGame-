import {EngineManager} from './EngineManager.js';
import {createAirportLobby} from '../world/createAirportLobby.js';
import {PlayerController} from '../player/PlayerController.js';
import {InteractionManager} from '../interactions/InteractionManager.js';
import {LobbyPanelUI} from '../ui/LobbyPanelUI.js';

export class LobbyGame {
  constructor(canvas,{onPanelChange=()=>{}}={}){this.canvas=canvas;this.core=new EngineManager(canvas);this.onPanelChange=onPanelChange}
  async init(){
    console.info('[FEANK] 1 - Starting lobby');
    const engine=this.core.create();console.info('[FEANK] 2 - Engine ready');
    const scene=new BABYLON.Scene(engine);scene.collisionsEnabled=true;scene.gravity=new BABYLON.Vector3(0,-.22,0);scene.imageProcessingConfiguration.exposure=1.05;scene.imageProcessingConfiguration.contrast=1;scene.skipPointerMovePicking=true;console.info('[FEANK] 3 - Scene created');
    console.info('[FEANK] 4 - Building airport');
    const world=createAirportLobby(scene);console.info('[FEANK] 5 - Airport ready');
    console.info('[FEANK] 6 - Creating player');this.player=new PlayerController(scene,this.canvas,world.spawn);console.info('[FEANK] 7 - Player ready');
    try{this.interactions=new InteractionManager(scene,this.player.camera,document.querySelector('#interaction-prompt'));this.ui=new LobbyPanelUI(open=>{this.player.setEnabled(!open);this.interactions.enabled=!open;if(open)this.interactions.select(null);this.onPanelChange(open)});
    const register=(mesh,name,text,point,action,distance=3.2)=>this.interactions.register({mesh,interactableName:name,interactionText:text,interactionDistance:distance,interactionKey:'e',interactionPoint:point,interactionAction:()=>{this.player.playInteraction();action()}});
    register(world.laptop,'Laptop','Use Laptop',world.laptopPoint,()=>this.ui.show('laptop'),2.8);
    register(world.kiosk,'Terminal Kiosk','Check Kiosk',world.kioskPoint,()=>this.ui.show('kiosk'),2.7);
    this.mobileInteract=document.querySelector('#mobile-interact');this.mobileInteract.onclick=()=>this.interactions.interact();}catch(error){console.error('[FEANK] Interaction system failed; continuing with a playable lobby.',error)}
    console.info('[FEANK] 8 - Interaction system ready');scene.onBeforeRenderObservable.add(()=>{this.player.update();if(!this.interactions)return;this.interactions.update();const available=!!this.interactions.current;this.mobileInteract.classList.toggle('visible',available);this.mobileInteract.setAttribute('aria-hidden',String(!available))});
    engine.resize();scene.render();console.info('[FEANK] 9 - Starting render loop');this.core.run(scene);
    // Procedural meshes are ready synchronously. Waiting for Scene.whenReadyAsync here
    // could wait forever on an optional texture/shader and used to block this return.
    console.info('[FEANK] Airport lobby ready',{camera:this.player.camera.position.asArray(),spawnSafe:true,meshes:scene.meshes.length,lights:scene.lights.length,lighting:'sunrise + fill + practical',renderLoops:1});
  }
  pause(){this.core.engine?.stopRenderLoop()}
  dispose(){if(this.mobileInteract){this.mobileInteract.onclick=null;this.mobileInteract.classList.remove('visible');this.mobileInteract.setAttribute('aria-hidden','true')}this.ui?.dispose();this.interactions?.dispose();this.player?.dispose();this.core.dispose()}
}
