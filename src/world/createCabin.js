const colors={wood:'#8b5a32',dark:'#4d3020',plank:'#a76f3e',wall:'#d7b77b',cream:'#ead9aa',green:'#49614b',red:'#80483b',metal:'#555b59',grass:'#617849'};
export function createCabin(scene){
  const mats=new Map();const mat=(name,color)=>{if(!mats.has(name)){const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.ambientColor=m.diffuseColor.scale(.22);m.specularColor=new BABYLON.Color3(.05,.05,.04);mats.set(name,m)}return mats.get(name)};
  const box=(name,pos,scale,color,collide=true)=>{const m=BABYLON.MeshBuilder.CreateBox(name,{width:scale[0],height:scale[1],depth:scale[2]},scene);m.position=new BABYLON.Vector3(...pos);m.material=mat(color,color);m.checkCollisions=collide;m.isPickable=collide;return m};
  // Keep doors and windows from opening onto a black void without a heavy map.
  const ground=BABYLON.MeshBuilder.CreateGround('cabin surroundings',{width:44,height:44},scene);ground.position.y=-.42;ground.material=mat('grass',colors.grass);ground.isPickable=false;
  const sky=BABYLON.MeshBuilder.CreateSphere('stylized sky',{diameter:70,segments:12,sideOrientation:BABYLON.Mesh.BACKSIDE},scene);const skyMat=mat('sky','#6e9eaa');skyMat.emissiveColor=BABYLON.Color3.FromHexString('#527b84');sky.material=skyMat;sky.isPickable=false;
  box('floor',[0,-.2,0],[14,.4,11],'plank');box('ceiling',[0,4.2,0],[14,.25,11],'dark');
  box('back wall',[0,2.05,5.35],[14,4.5,.3],'wall');box('left wall',[-6.85,2.05,0],[.3,4.5,11],'wall');box('right wall',[6.85,2.05,0],[.3,4.5,11],'wall');
  box('front left',[-4.7,2.05,-5.35],[4.3,4.5,.3],'wall');box('front right',[4.7,2.05,-5.35],[4.3,4.5,.3],'wall');box('front header',[0,3.7,-5.35],[5.2,1.2,.3],'wall');
  box('door',[0,1.5,-5.18],[2.2,3,.18],'dark');box('door cross',[0,1.5,-5.04],[2.05,.16,.12],'wood',false);
  [-5.8,-2.9,0,2.9,5.8].forEach(x=>box('ceiling beam',[x,3.95,0],[.22,.36,10.8],'dark'));
  [-6.15,6.15].forEach(x=>[-4.7,4.7].forEach(z=>box('post',[x,2,z],[.42,4,.42],'dark')));
  // Warm windows with deep frames.
  [-3.3,3.3].forEach(x=>{box('window glow',[x,2.35,5.15],[2.1,1.45,.08],'cream',false);box('window top',[x,3.1,5.02],[2.4,.18,.25],'dark');box('window sill',[x,1.6,5.02],[2.4,.18,.3],'dark');box('window divider',[x,2.35,5.01],[.13,1.5,.22],'dark')});
  // Workbench is assembled as one reusable interactive root.
  const workbench=new BABYLON.TransformNode('Workbench',scene);const top=box('workbench target',[3.7,1.15,2.4],[3.5,.32,1.5],'plank');top.parent=workbench;
  [[2.25,.55,1.9],[5.15,.55,1.9],[2.25,.55,2.9],[5.15,.55,2.9]].forEach(p=>{const leg=box('workbench leg',p,[.3,1.2,.3],'dark');leg.parent=workbench});
  const back=box('workbench back',[3.7,2.05,3.05],[3.5,1.5,.18],'dark');back.parent=workbench;const map=box('bench map',[3.7,1.38,2.25],[2,.05,.85],'cream',false);map.rotation.x=.08;map.parent=workbench;
  // Shelves, tables, crates and climbing decorations.
  box('side partition',[-2.5,2.05,2.55],[.22,4.1,5.4],'dark');box('shelf',[-5.6,1.8,2.7],[2.1,.2,.65],'wood');box('shelf',[-5.6,2.8,2.7],[2.1,.2,.65],'wood');
  [-5.9,-5.1].forEach((x,i)=>box('crate',[x,.5,3.9],[1.1,1,1.1],i?'red':'wood'));
  box('main table',[-1.1,.85,-1.1],[2.5,.25,1.5],'wood');[-2.1,-.1].forEach(x=>box('table leg',[x,.4,-1.1],[.22,.8,.22],'dark'));
  box('bench',[-3.4,.45,-2.8],[2.3,.45,.7],'green');box('wall map',[-4.9,2.5,-5.12],[2.1,1.3,.06],'cream',false);
  const rope=BABYLON.MeshBuilder.CreateTorus('coiled rope',{diameter:1.05,thickness:.12,tessellation:18},scene);rope.position=new BABYLON.Vector3(5.3,2.2,5.05);rope.rotation.x=Math.PI/2;rope.material=mat('rope','#c69b5d');rope.isPickable=false;
  const lamp=new BABYLON.PointLight('warm cabin lamp',new BABYLON.Vector3(0,3.5,0),scene);lamp.diffuse=BABYLON.Color3.FromHexString('#ffd99a');lamp.intensity=.75;lamp.range=15;scene.ambientColor=new BABYLON.Color3(.3,.28,.23);
  const outside=new BABYLON.HemisphericLight('soft ambient light',new BABYLON.Vector3(0,1,-.2),scene);outside.diffuse=BABYLON.Color3.FromHexString('#f6dfbd');outside.groundColor=BABYLON.Color3.FromHexString('#52604b');outside.intensity=.82;
  return {workbench,workbenchTarget:top,interactionPoint:new BABYLON.Vector3(3.7,2.05,2.4)};
}
