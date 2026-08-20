export class EngineManager {
  constructor(canvas){this.canvas=canvas;this.engine=null;this.scene=null;this.running=false;this.resize=()=>this.engine?.resize()}
  create(){if(!window.BABYLON)throw new Error('Babylon.js failed to load');if(!this.canvas?.isConnected)throw new Error('Game canvas is not connected');this.engine=new BABYLON.Engine(this.canvas,true,{preserveDrawingBuffer:false,stencil:false,antialias:true},true);const weak=matchMedia('(max-width: 800px), (pointer: coarse)').matches;this.engine.setHardwareScalingLevel(weak?Math.min(devicePixelRatio,1.5):1);addEventListener('resize',this.resize);addEventListener('orientationchange',this.resize);return this.engine}
  run(scene){if(this.running)this.engine.stopRenderLoop();this.scene=scene;this.running=true;this.engine.runRenderLoop(()=>{if(!document.hidden&&this.scene)this.scene.render()})}
  dispose(){removeEventListener('resize',this.resize);removeEventListener('orientationchange',this.resize);this.engine?.stopRenderLoop();this.running=false;this.scene?.dispose();this.engine?.dispose();this.scene=null;this.engine=null}
}
