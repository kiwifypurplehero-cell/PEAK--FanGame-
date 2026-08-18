export class EngineManager {
  constructor(canvas){this.canvas=canvas;this.engine=null;this.scene=null;this.resize=()=>this.engine?.resize()}
  create(){if(!window.BABYLON)throw new Error('Babylon.js failed to load');this.engine=new BABYLON.Engine(this.canvas,true,{preserveDrawingBuffer:false,stencil:false,antialias:true},true);const weak=matchMedia('(max-width: 800px), (pointer: coarse)').matches;this.engine.setHardwareScalingLevel(weak?Math.min(devicePixelRatio,1.5):1);addEventListener('resize',this.resize);return this.engine}
  run(scene){this.scene=scene;this.engine.runRenderLoop(()=>{if(!document.hidden&&this.scene)this.scene.render()})}
  dispose(){removeEventListener('resize',this.resize);this.scene?.dispose();this.engine?.stopRenderLoop();this.engine?.dispose();this.scene=null;this.engine=null}
}
