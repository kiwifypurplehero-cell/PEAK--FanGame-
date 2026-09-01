import {inputBindings} from './input-bindings.js';

const EYE_HEIGHT=1.7;
const COLLIDER_HALF_HEIGHT=.85;

export class PlayerController {
  constructor(scene,canvas){
    this.scene=scene;this.canvas=canvas;this.walkSpeed=3.2;this.enabled=true;this.keys=new Set();
    this.verticalVelocity=0;this.isGrounded=true;
    // The spawn is the eye position. The offset moves the collision centre down once;
    // update() never adds the eye/collider height again.
    this.camera=new BABYLON.UniversalCamera('player',new BABYLON.Vector3(-3.5,EYE_HEIGHT,-3),scene);
    this.camera.fov=BABYLON.Tools.ToRadians(70);this.camera.minZ=.08;this.camera.inertia=.35;this.camera.angularSensibility=2600;
    this.camera.checkCollisions=true;this.camera.applyGravity=false;
    this.camera.ellipsoid=new BABYLON.Vector3(.34,COLLIDER_HALF_HEIGHT,.34);
    this.camera.ellipsoidOffset=new BABYLON.Vector3(0,-COLLIDER_HALF_HEIGHT,0);
    this.camera.keysUp=[];this.camera.keysDown=[];this.camera.keysLeft=[];this.camera.keysRight=[];this.camera.setTarget(new BABYLON.Vector3(.4,1.3,2.4));this.camera.attachControl(canvas,true);
    this.down=event=>{if(this.enabled)this.keys.add(event.code)};this.up=event=>this.keys.delete(event.code);window.addEventListener('keydown',this.down);window.addEventListener('keyup',this.up);scene.onBeforeRenderObservable.add(()=>this.update());
  }
  update(){
    if(!this.enabled)return;
    const dt=Math.min(this.scene.getEngine().getDeltaTime()/1000,.05),move=new BABYLON.Vector3();
    const forward=this.camera.getDirection(BABYLON.Axis.Z);forward.y=0;forward.normalize();const right=this.camera.getDirection(BABYLON.Axis.X);right.y=0;right.normalize();
    if(this.keys.has(inputBindings.get('forward')))move.addInPlace(forward);if(this.keys.has(inputBindings.get('backward')))move.subtractInPlace(forward);if(this.keys.has(inputBindings.get('right')))move.addInPlace(right);if(this.keys.has(inputBindings.get('left')))move.subtractInPlace(right);
    if(move.lengthSquared())move.normalize().scaleInPlace(this.walkSpeed*dt);
    if(this.isGrounded)this.verticalVelocity=0;else this.verticalVelocity=Math.max(this.verticalVelocity-9.8*dt,-18);
    const beforeY=this.camera.position.y;move.y=this.isGrounded?-.02:this.verticalVelocity*dt;
    this.camera.moveWithCollisions(move);
    const actualY=this.camera.position.y-beforeY;
    this.isGrounded=move.y<=0&&actualY>move.y+.001;
    if(this.isGrounded)this.verticalVelocity=0;
  }
  setEnabled(enabled){this.enabled=enabled;this.keys.clear();if(enabled)this.camera.attachControl(this.canvas,true);else this.camera.detachControl()}
}
