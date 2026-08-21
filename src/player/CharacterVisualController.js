export const CharacterVisualState=Object.freeze({
  IDLE:'IDLE',WALKING:'WALKING',RUNNING:'RUNNING',HOLDING_ITEM:'HOLDING_ITEM',GRABBING_PLAYER:'GRABBING_PLAYER',CLIMBING:'CLIMBING'
});

export const CHARACTER_COLOR_STORAGE_KEY='feank.character.color';
export const DEFAULT_CHARACTER_COLOR='#e7a26f';

const STATE_ARMS=Object.freeze({
  [CharacterVisualState.IDLE]:[false,false],
  [CharacterVisualState.WALKING]:[false,false],
  [CharacterVisualState.RUNNING]:[true,true],
  [CharacterVisualState.HOLDING_ITEM]:[false,true],
  [CharacterVisualState.GRABBING_PLAYER]:[true,true],
  [CharacterVisualState.CLIMBING]:[true,true]
});

export function readCharacterColor(){
  const saved=localStorage.getItem(CHARACTER_COLOR_STORAGE_KEY);
  return /^#[0-9a-f]{6}$/i.test(saved||'')?saved:DEFAULT_CHARACTER_COLOR;
}

export class CharacterVisualController{
  constructor(scene,camera,bodyMeshes=[]){
    this.scene=scene;this.camera=camera;this.bodyMeshes=bodyMeshes;this.state=CharacterVisualState.IDLE;this.armAmount=[0,0];
    this.material=new BABYLON.StandardMaterial('local character matte color',scene);this.material.specularColor=BABYLON.Color3.Black();this.material.roughness=1;
    bodyMeshes.forEach(mesh=>mesh.material=this.material);
    this.root=new BABYLON.TransformNode('FirstPersonHands',scene);this.root.parent=camera;
    this.limbs=[this.createLimb('Left',-1),this.createLimb('Right',1)];
    this.setColor(readCharacterColor(),false);this.adaptViewport();
    this.resize=()=>this.adaptViewport();addEventListener('resize',this.resize);addEventListener('orientationchange',this.resize);
  }
  createLimb(name,sign){
    const root=new BABYLON.TransformNode(`View${name}HandRoot`,this.scene);root.parent=this.root;
    const arm=BABYLON.MeshBuilder.CreateCapsule(`${name} retractable arm`,{height:.48,radius:.075,tessellation:8},this.scene);arm.parent=root;arm.rotation.x=-.82;arm.material=this.material;arm.isVisible=false;
    const hand=BABYLON.MeshBuilder.CreateSphere(`${name} simple hand`,{diameter:.19,segments:8},this.scene);hand.parent=root;hand.position.z=.22;hand.scaling.set(1,.9,1);hand.material=this.material;
    for(const mesh of [arm,hand]){mesh.isPickable=false;mesh.checkCollisions=false;mesh.renderingGroupId=2;mesh.alwaysSelectAsActiveMesh=true}
    return {root,arm,hand,sign,baseX:0};
  }
  adaptViewport(){
    const engine=this.scene.getEngine(),width=Math.max(1,engine.getRenderWidth()),height=Math.max(1,engine.getRenderHeight()),aspect=width/height;
    const fovScale=Math.tan(this.camera.fov/2)/Math.tan(BABYLON.Tools.ToRadians(70)/2),coarse=matchMedia('(pointer: coarse)').matches;
    const spread=BABYLON.Scalar.Clamp((coarse?.31:.29)+Math.max(0,aspect-1.55)*.055,.29,.43)*fovScale;
    const vertical=coarse&&height<650?-.31:-.34;
    for(const limb of this.limbs){limb.baseX=limb.sign*spread;limb.root.position.set(limb.baseX,vertical,.72);limb.root.scaling.setAll(BABYLON.Scalar.Clamp(height/720,.82,1.04))}
  }
  setState(state){if(STATE_ARMS[state])this.state=state}
  setColor(hex,persist=true){
    if(!/^#[0-9a-f]{6}$/i.test(hex))return;
    const color=BABYLON.Color3.FromHexString(hex);this.material.diffuseColor=color;this.material.ambientColor=color.scale(.75);this.material.emissiveColor=color.scale(.12);this.color=hex.toLowerCase();
    if(persist)localStorage.setItem(CHARACTER_COLOR_STORAGE_KEY,this.color);
  }
  update(dt,time,interaction=0){
    const active=STATE_ARMS[this.state];
    this.limbs.forEach((limb,index)=>{const target=active[index]?1:0;this.armAmount[index]=BABYLON.Scalar.Lerp(this.armAmount[index],target,1-Math.exp(-dt*10));const amount=this.armAmount[index];limb.arm.isVisible=amount>.025;limb.arm.visibility=amount;limb.arm.scaling.y=Math.max(.04,amount);limb.arm.position.z=-.02-(1-amount)*.12;const run=this.state===CharacterVisualState.RUNNING?Math.sin(time*9+index*Math.PI)*.025:0;limb.root.position.x=BABYLON.Scalar.Lerp(limb.root.position.x,limb.baseX+limb.sign*(active[index]?.025:0),1-Math.exp(-dt*8));limb.root.rotation.x=run;limb.hand.position.z=.22+amount*.07+(index===1?Math.sin(interaction*Math.PI)*.22:0)});
  }
  dispose(){removeEventListener('resize',this.resize);removeEventListener('orientationchange',this.resize);this.root.dispose();this.material.dispose()}
}
