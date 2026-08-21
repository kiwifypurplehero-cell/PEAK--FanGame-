import {EngineManager} from './EngineManager.js?v=20260821-MOBILE-RENDER-FIX-01';
import {createAirportLobby} from '../world/createAirportLobby.js?v=20260821-MOBILE-RENDER-FIX-01';
import {PlayerController} from '../player/PlayerController.js?v=20260821-MOBILE-RENDER-FIX-01';
import {InteractionManager} from '../interactions/InteractionManager.js?v=20260821-MOBILE-RENDER-FIX-01';
import {LobbyPanelUI} from '../ui/LobbyPanelUI.js?v=20260821-MOBILE-RENDER-FIX-01';

const finite=(label,value)=>{if(!Number.isFinite(value))throw new TypeError(`[SCENE VALIDATION] ${label} must be finite; received ${String(value)}`)};
const errorText=(error,detail='')=>`R-ERROR · SCENE.RENDER\n${error?.name||'Error'}\n${error?.message||String(error)}${detail?`\n${detail}`:''}`;

function validateSceneForFirstRender(scene,player){
  player.validateRenderState();
  for(const mesh of scene.meshes){
    for(const [property,vector] of Object.entries({position:mesh.position,rotation:mesh.rotation,scaling:mesh.scaling}))for(const axis of ['x','y','z'])finite(`${mesh.name}.${property}.${axis}`,vector?.[axis]);
    for(const property of ['visibility','alphaIndex'])if(mesh[property]!==undefined)finite(`${mesh.name}.${property}`,mesh[property]);
    const seen=new Set();for(let node=mesh;node;node=node.parent){if(seen.has(node))throw new Error(`[SCENE VALIDATION] Parent cycle detected at ${mesh.name}`);seen.add(node)}
    if(mesh.material&&!scene.materials.includes(mesh.material))throw new Error(`[SCENE VALIDATION] ${mesh.name} uses a material outside this scene`);
  }
  for(const material of scene.materials){
    for(const property of ['alpha','roughness','metallic'])if(material[property]!==undefined)finite(`${material.name}.${property}`,material[property]);
    for(const property of ['diffuseColor','ambientColor','emissiveColor','specularColor']){const color=material[property];if(color)for(const channel of ['r','g','b'])finite(`${material.name}.${property}.${channel}`,color[channel])}
  }
  for(const light of scene.lights){finite(`${light.name}.intensity`,light.intensity);if(light.range!==undefined)finite(`${light.name}.range`,light.range)}
  console.info('[FEANK] Pre-render numeric validation passed',{meshes:scene.meshes.length,materials:scene.materials.length,lights:scene.lights.length});
}

function isolateRenderFailure(scene,groups,onStage,originalError){
  const setGroup=(group,enabled)=>{group.nodes.forEach(node=>node.setEnabled(enabled));group.lights.forEach(light=>light.setEnabled(enabled))};
  groups.forEach(group=>setGroup(group,false));let failing='BASE SCENE';
  try{
    scene.render();
    for(const group of groups){failing=group.name;setGroup(group,true);console.info(`[FEANK][RENDER ISOLATION] testing ${group.name}`);scene.render();console.info(`[FEANK][RENDER ISOLATION] ${group.name} passed`)}
  }catch(isolationError){
    console.error(`[FEANK][RENDER ISOLATION] failure after ${failing}`,isolationError);console.error(isolationError.stack);
    onStage(errorText(originalError,`ISOLATION GROUP: ${failing}`));
  }finally{groups.forEach(group=>setGroup(group,true))}
}

export class LobbyGame {
  constructor(canvas,{onPanelChange=()=>{},onStage=()=>{}}={}){this.canvas=canvas;this.core=new EngineManager(canvas);this.onPanelChange=onPanelChange;this.onStage=onStage}
  async init(){
    console.info('[FEANK] 1 - Starting lobby');
    this.onStage('LOADING ENGINE...');
    const engine=this.core.create();console.info('[FEANK] 2 - Engine ready');
    const isMobile=matchMedia('(max-width: 800px), (pointer: coarse)').matches;
    const scene=new BABYLON.Scene(engine);this.core.scene=scene;scene.collisionsEnabled=true;scene.gravity=new BABYLON.Vector3(0,0,0);scene.imageProcessingConfiguration.exposure=1.05;scene.imageProcessingConfiguration.contrast=1;scene.imageProcessingConfiguration.isEnabled=!isMobile;scene.postProcessesEnabled=!isMobile;scene.shadowsEnabled=!isMobile;scene.skipPointerMovePicking=true;console.info('[FEANK] 3 - Scene created',{isMobile,imageProcessing:!isMobile,postProcessing:!isMobile,shadows:!isMobile});
    // Prove that this WebGL context can render before building decorative geometry.
    const probeCamera=new BABYLON.FreeCamera('startup render probe',BABYLON.Vector3.Zero(),scene);scene.render();probeCamera.dispose();console.info('[FEANK] 3a - Minimal WebGL frame rendered');
    this.onStage('BUILDING TERMINAL...');console.info('[FEANK] 4 - Building airport');
    const world=createAirportLobby(scene);console.info('[FEANK] 5 - Airport ready');
    this.onStage('CREATING PLAYER...');console.info('[FEANK] 6 - Creating player');this.player=new PlayerController(scene,this.canvas,world.spawn);console.info('[FEANK] 7 - Player ready');
    try{const interactions=new InteractionManager(scene,this.player.camera,document.querySelector('#interaction-prompt'));const ui=new LobbyPanelUI(open=>{this.player.setEnabled(!open);interactions.enabled=!open;if(open)interactions.select(null);this.onPanelChange(open)},color=>this.player.setCharacterColor(color));this.interactions=interactions;this.ui=ui;
    const register=(mesh,name,text,point,action,distance=3.2)=>interactions.register({mesh,interactableName:name,interactionText:text,interactionDistance:distance,interactionKey:'e',interactionPoint:point,interactionAction:()=>{this.player.playInteraction();action()}});
    register(world.laptop,'Laptop','Use Laptop',world.laptopPoint,()=>this.ui.show('laptop'),2.8);
    register(world.kiosk,'Terminal Kiosk','Check Kiosk',world.kioskPoint,()=>this.ui.show('kiosk'),2.7);
    this.mobileInteract=document.querySelector('#mobile-interact');if(this.mobileInteract)this.mobileInteract.onclick=()=>interactions.interact();}catch(error){console.error('[FEANK] Interaction system failed; continuing with a playable lobby.',error)}
    console.info('[FEANK] 8 - Interaction system ready');
    this.onStage('R1 · BEFORE ENGINE RESIZE');
    console.info('[FEANK][R1] BEFORE engine.resize()');
    const resizeStart=performance.now();
    try{engine.resize()}catch(error){this.onStage('R-ERROR · ENGINE.RESIZE');console.error('[FEANK] engine.resize() failed',error);throw error}
    console.info('[FEANK] engine.resize duration:',performance.now()-resizeStart);
    console.info('[FEANK][R1] AFTER engine.resize()');
    this.onStage('R2 · ENGINE RESIZE OK');

    console.info('[FEANK][R2] BEFORE scene.render()');
    this.onStage('R3 · BEFORE FIRST SCENE RENDER');
    const renderStart=performance.now();
    validateSceneForFirstRender(scene,this.player);
    try{scene.render()}catch(error){this.onStage(errorText(error));console.error(error);console.error(error.stack);isolateRenderFailure(scene,[...world.diagnosticGroups,this.player.diagnosticGroup],this.onStage,error);throw error}
    console.info('[FEANK] scene.render duration:',performance.now()-renderStart);
    console.info('[FEANK][R2] AFTER scene.render()');
    this.onStage('R4 · FIRST SCENE RENDER OK');
    // Runtime movement and picking begin only after the static scene has proved it can render.
    scene.onBeforeRenderObservable.add(()=>{this.player.update();if(!this.interactions)return;this.interactions.update();const available=!!this.interactions.current;if(this.mobileInteract){this.mobileInteract.classList.toggle('visible',available);this.mobileInteract.setAttribute('aria-hidden',String(!available))}});

    console.info('[FEANK][R3] BEFORE EngineManager.run()');
    this.onStage('R5 · BEFORE RENDER LOOP');
    const runStart=performance.now();
    try{this.core.run(scene)}catch(error){this.onStage('R-ERROR · ENGINEMANAGER.RUN');console.error('[FEANK] EngineManager.run(scene) failed',error);throw error}
    console.info('[FEANK] EngineManager.run duration:',performance.now()-runStart);
    console.info('[FEANK][R3] AFTER EngineManager.run()');
    this.onStage('R6 · RENDER LOOP STARTED');
    this.onStage('LOBBY READY');
    // Procedural meshes are ready synchronously. Waiting for Scene.whenReadyAsync here
    // could wait forever on an optional texture/shader and used to block this return.
    console.info('[FEANK] Airport lobby ready',{camera:this.player.camera.position.asArray(),spawnSafe:true,meshes:scene.meshes.length,lights:scene.lights.length,lighting:'sunrise + fill + practical',renderLoops:1});
  }
  pause(){this.core.engine?.stopRenderLoop()}
  dispose(){if(this.mobileInteract){this.mobileInteract.onclick=null;this.mobileInteract.classList.remove('visible');this.mobileInteract.setAttribute('aria-hidden','true')}this.ui?.dispose();this.interactions?.dispose();this.player?.dispose();this.core.dispose()}
}
