import {PlayerController} from './player-controller.js';
import {InteractionManager} from './interaction-manager.js';
import {TerminalUI} from './terminal-ui.js';

export class AirportLobby {
  constructor({canvas,prompt,panel}){this.canvas=canvas;this.engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:false});this.scene=this.createScene();this.player=new PlayerController(this.scene,canvas);this.terminalUI=new TerminalUI(panel,this.player);this.interactions=new InteractionManager(this.scene,this.player,prompt,this.terminalUI);this.resize=()=>this.engine.resize();window.addEventListener('resize',this.resize);this.canvas.addEventListener('click',()=>{if(!this.terminalUI.opened)this.canvas.requestPointerLock?.()})}
  material(name,color,emissive){const material=new BABYLON.StandardMaterial(name,this.scene);material.diffuseColor=BABYLON.Color3.FromHexString(color);material.specularColor=new BABYLON.Color3(.08,.08,.08);if(emissive)material.emissiveColor=BABYLON.Color3.FromHexString(emissive);return material}
  box(name,size,position,material,collisions=true){const mesh=BABYLON.MeshBuilder.CreateBox(name,{width:size[0],height:size[1],depth:size[2]},this.scene);mesh.position.copyFromFloats(...position);mesh.material=material;mesh.checkCollisions=collisions;return mesh}
  label(name,text,width,height,position,rotationY=0){const texture=new BABYLON.DynamicTexture(`${name}Texture`,{width:512,height:128},this.scene,false);texture.hasAlpha=true;texture.drawText(text,null,82,'bold 46px Arial','#fff5d8','#526b73',true);const material=new BABYLON.StandardMaterial(`${name}Material`,this.scene);material.diffuseTexture=texture;material.emissiveColor=new BABYLON.Color3(.3,.34,.34);const plane=BABYLON.MeshBuilder.CreatePlane(name,{width,height},this.scene);plane.position.copyFromFloats(...position);plane.rotation.y=rotationY;plane.material=material;plane.isPickable=false;return plane}
  createScene(){
    const scene=new BABYLON.Scene(this.engine);scene.clearColor=new BABYLON.Color4(.58,.75,.85,1);scene.collisionsEnabled=true;scene.gravity=new BABYLON.Vector3(0,-.22,0);
    new BABYLON.HemisphericLight('ambient',new BABYLON.Vector3(0,1,0),scene).intensity=.82;const sun=new BABYLON.DirectionalLight('sun',new BABYLON.Vector3(-.4,-1,.55),scene);sun.intensity=.55;sun.diffuse=new BABYLON.Color3(1,.78,.58);
    const cream=this.material('cream','#e8ddc6'),floorMat=this.material('floor','#c9bda6'),wood=this.material('wood','#a87952'),blue=this.material('soft blue','#7198a3'),metal=this.material('light metal','#aeb6b3'),screen=this.material('terminal glow','#7caeb0','#376d70'),green=this.material('plant','#6e9468'),sky=this.material('sunrise','#e9ad7b','#75553d');
    this.box('floor',[15,.25,12],[0,-.125,0],floorMat);this.box('ceiling',[15,.2,12],[0,4.25,0],cream);
    this.box('west wall',[.25,4.3,12],[-7.5,2.1,0],cream);this.box('east wall',[.25,4.3,12],[7.5,2.1,0],cream);this.box('back wall',[15,4.3,.25],[0,2.1,6],cream);
    this.box('front wall left',[4.2,4.3,.25],[-5.4,2.1,-6],cream);this.box('front wall right',[4.2,4.3,.25],[5.4,2.1,-6],cream);this.box('window sill',[6.6,.45,.3],[0,.3,-5.92],metal);
    const glass=this.box('large windows',[6.6,3.5,.08],[0,2.2,-5.91],blue,false);glass.material=this.material('glass','#a8d2dc');glass.material.alpha=.42;glass.isPickable=false;this.box('simple sunrise sky',[7,4,.2],[0,2,-6.45],sky,false).isPickable=false;
    for(const x of [-6.1,6.1])this.box('pillar',[.55,4.2,.55],[x,2.1,-1],metal);
    // Two compact waiting benches.
    for(const z of [-.8,1]){this.box('bench seat',[3,.25,.65],[4.7,.65,z],wood);this.box('bench back',[3,.75,.2],[4.7,1.02,z+.28],wood);for(const x of [3.55,5.85])this.box('bench leg',[.18,.65,.18],[x,.32,z],metal)}
    // Decorative expedition gate on the back wall.
    this.box('gate frame top',[3.8,.35,.45],[-4.6,3.45,5.65],blue);this.box('gate frame left',[.35,3.2,.45],[-6.32,1.7,5.65],blue);this.box('gate frame right',[.35,3.2,.45],[-2.88,1.7,5.65],blue);this.box('closed gate',[3.1,2.9,.3],[-4.6,1.5,5.8],wood);this.label('gate label','EXPEDITION GATE',2.9,.55,[-4.6,3.75,5.43],Math.PI);
    // A restrained plant beside the waiting area.
    this.box('planter',[.75,.65,.75],[6.4,.33,3.9],wood);const trunk=this.box('plant trunk',[.16,1.15,.16],[6.4,1.15,3.9],wood,false);trunk.isPickable=false;for(const offset of [[-.25,1.6,0],[.24,1.48,.08],[0,1.75,.15]]){const leaf=BABYLON.MeshBuilder.CreateSphere('plant leaf',{diameter:.6,segments:6},scene);leaf.position.copyFromFloats(6.4+offset[0],offset[1],3.9+offset[2]);leaf.material=green;leaf.isPickable=false}
    // Floor-standing self-service terminal, facing the spawn.
    const root=new BABYLON.TransformNode('terminal root',scene);root.position.copyFromFloats(.7,0,2.5);root.rotation.y=Math.PI;this.box('terminal base',[1.3,.16,.9],[0,.08,0],metal).parent=root;this.box('terminal pedestal',[.42,1.15,.38],[0,.68,0],metal).parent=root;const frame=this.box('terminal frame',[1.65,1.05,.18],[0,1.48,-.08],metal);frame.rotation.x=-.16;frame.parent=root;const display=this.box('terminal interaction screen',[1.43,.83,.035],[0,1.48,-.19],screen,false);display.rotation.x=-.16;display.parent=root;display.metadata={terminalInteraction:true,terminalRoot:root};this.label('terminal text','EXPEDITION TERMINAL  •  MAP SETTINGS',1.25,.31,[.7,1.52,2.68],0);
    return scene;
  }
  start(){this.engine.runRenderLoop(()=>this.scene.render());this.resize();this.canvas.focus()}
  stop(){this.terminalUI.close();document.exitPointerLock?.();this.engine.stopRenderLoop()}
}
