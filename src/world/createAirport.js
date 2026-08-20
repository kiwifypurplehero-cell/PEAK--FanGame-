const PALETTE={floor:'#ded2c0',floorAccent:'#7fa8a5',wall:'#eadcc9',trim:'#355666',navy:'#294454',glass:'#9bc5cf',runway:'#697b7c',yellow:'#efb94f',orange:'#d47755',green:'#5f917c',seat:'#d68a62',dark:'#263940',white:'#fff4d5'};

export function createAirport(scene){
  const materials=new Map();
  const material=(name,color,{emissive=false,alpha=1}={})=>{if(materials.has(name))return materials.get(name);const value=BABYLON.Color3.FromHexString(color);const result=new BABYLON.StandardMaterial(name,scene);result.diffuseColor=value;result.ambientColor=value.scale(.22);result.specularColor=new BABYLON.Color3(.06,.06,.06);result.specularPower=24;result.maxSimultaneousLights=6;result.alpha=alpha;if(emissive)result.emissiveColor=value.scale(.82);materials.set(name,result);return result};
  const box=(name,[x,y,z],[width,height,depth],color,collisions=true)=>{const mesh=BABYLON.MeshBuilder.CreateBox(name,{width,height,depth},scene);mesh.position.set(x,y,z);mesh.material=material(color,color);mesh.checkCollisions=collisions;mesh.isPickable=collisions;return mesh};
  const sign=(text,position,size=[2.8,.65,.12],color='navy')=>{const root=box(`${text} sign`,position,size,color,false);const texture=new BABYLON.DynamicTexture(`${text} label`,{width:512,height:128},scene,false);texture.hasAlpha=true;texture.drawText(text,null,84,'bold 42px Arial','#fff8e9','transparent',true);const labelMat=new BABYLON.StandardMaterial(`${text} label material`,scene);labelMat.diffuseTexture=texture;labelMat.emissiveTexture=texture;labelMat.opacityTexture=texture;labelMat.disableLighting=true;const label=box(`${text} label`,[position[0],position[1],position[2]-size[2]/2-.008],[size[0]*.9,size[1]*.72,.015],'white',false);label.material=labelMat;return root};

  // A fixed, cheap vertex-colour dawn dome replaces a flat midday sky. No clock or
  // post-process is involved, so the lobby always opens at the same sunrise.
  scene.ambientColor=BABYLON.Color3.FromHexString('#453f4c');
  const sky=BABYLON.MeshBuilder.CreateSphere('permanent sunrise sky',{diameter:120,segments:20,slice:.55,sideOrientation:BABYLON.Mesh.BACKSIDE,updatable:false},scene);
  const positions=sky.getVerticesData(BABYLON.VertexBuffer.PositionKind),colors=[];
  const horizon=BABYLON.Color3.FromHexString('#f3a16f'),mid=BABYLON.Color3.FromHexString('#b9a9d8'),zenith=BABYLON.Color3.FromHexString('#789fc8');
  for(let index=0;index<positions.length;index+=3){const height=Math.max(0,Math.min(1,(positions[index+1]+12)/55)),color=height<.35?BABYLON.Color3.Lerp(horizon,mid,height/.35):BABYLON.Color3.Lerp(mid,zenith,(height-.35)/.65);colors.push(color.r,color.g,color.b,1)}
  sky.setVerticesData(BABYLON.VertexBuffer.ColorKind,colors);const skyMaterial=new BABYLON.StandardMaterial('sunrise gradient material',scene);skyMaterial.diffuseColor.set(1,1,1);skyMaterial.emissiveColor.set(1,1,1);skyMaterial.disableLighting=true;skyMaterial.backFaceCulling=false;sky.material=skyMaterial;sky.isPickable=false;sky.infiniteDistance=true;
  const sun=BABYLON.MeshBuilder.CreateDisc('low sunrise sun',{radius:3.1,tessellation:24},scene);sun.position.set(-14,5,-48);sun.material=material('sun glow','#ffd38a',{emissive:true});sun.material.disableLighting=true;sun.isPickable=false;
  [[-24,9,-43,11,1.2],[3,13,-48,15,1.5],[23,8,-42,10,1]].forEach(([x,y,z,w,h],index)=>{const cloud=BABYLON.MeshBuilder.CreateSphere(`soft dawn cloud ${index+1}`,{diameter:2,segments:8},scene);cloud.position.set(x,y,z);cloud.scaling.set(w,h,1);cloud.material=material('dawn cloud','#dfc9d7',{emissive:true});cloud.isPickable=false});
  box('outside runway',[0,-.48,20],[90,.3,55],'runway',false);[-12,0,12].forEach(x=>box('runway marking',[x,-.3,20],[6,.02,.45],'white',false));
  box('terminal floor',[0,-.2,0],[28,.4,24],'floor');box('ceiling',[0,6.65,0],[28,.25,24],'wall');
  box('north wall',[0,3.2,11.85],[28,6.8,.3],'wall');box('west wall',[-13.85,3.2,0],[.3,6.8,24],'wall');box('east wall',[13.85,3.2,0],[.3,6.8,24],'wall');
  // Window wall uses low sections so the runway and sky remain visible.
  box('window sill wall',[0,.55,-11.85],[28,1.5,.3],'trim');box('window header',[0,5.8,-11.85],[28,1.7,.3],'wall');
  [-12,-8,-4,0,4,8,12].forEach(x=>box('window mullion',[x,3.25,-11.68],[.22,4.3,.22],'trim'));
  [-10,-6,-2,2,6,10].forEach(x=>{const glass=box('terminal window',[x,3.25,-11.82],[3.75,4.15,.06],'glass',false);glass.material=material('glass',PALETTE.glass,{emissive:true,alpha:.3});glass.visibility=.7});
  [-9,-3,3,9].forEach(x=>box('terminal pillar',[x,3.25,1],[.55,6.3,.55],'trim'));
  // Visible low-poly housings and emissive diffusers suggest a fully lit terminal;
  // only a few selected fixtures receive an actual light below.
  const ceilingFixture=(x,z,width=4)=>{box('ceiling lamp housing',[x,6.38,z],[width+.18,.16,.64],'dark',false);const diffuser=box('warm ceiling lamp',[x,6.27,z],[width,.09,.48],'white',false);diffuser.material=material('warm lamp diffuser',PALETTE.white,{emissive:true});return diffuser};
  [-9,-3,3,9].forEach(x=>[-7,-1,5,9].forEach(z=>ceilingFixture(x,z,3.15)));

  const kiosk=new BABYLON.TransformNode('Invite Kiosk',scene);
  [box('invite kiosk body',[-7.4,1,-5.5],[2.2,2,1.25],'floorAccent'),box('invite kiosk screen',[-7.4,2.15,-5.25],[1.75,1.15,.16],'navy'),box('invite kiosk base',[-7.4,.18,-5.5],[2.6,.25,1.65],'trim')].forEach(mesh=>mesh.parent=kiosk);sign('INVITE',[-7.4,3.2,-5.45],[2.5,.6,.12],'orange');

  const expedition=new BABYLON.TransformNode('Expedition Desk',scene);
  [box('expedition counter',[6.8,1.05,4.1],[5.4,2.1,1.35],'orange'),box('expedition counter top',[6.8,2.18,4.1],[5.8,.2,1.65],'white'),box('expedition display',[6.8,3.3,4.72],[3.9,1.5,.18],'navy')].forEach(mesh=>mesh.parent=expedition);sign('SELECT EXPEDITION',[6.8,4.45,4.72],[4.8,.65,.12]);

  const settings=new BABYLON.TransformNode('Game Configuration Desk',scene);
  [box('settings counter',[-7.4,1.05,5.7],[4.6,2.1,1.3],'green'),box('settings counter top',[-7.4,2.18,5.7],[5,.2,1.6],'white'),box('settings display',[-7.4,3.25,6.26],[3.4,1.35,.16],'navy')].forEach(mesh=>mesh.parent=settings);sign('GAME SETTINGS',[-7.4,4.3,6.26],[4.3,.62,.12]);

  // Waiting area. Instances share seat geometry/material and remain individually collidable.
  const seatBase=box('waiting seat',[0,.72,2],[1.25,.3,1.25],'seat');box('waiting seat back',[0,1.25,2.52],[1.25,1,.22],'seat');
  [[-2.1,2],[-.7,2],[.7,2],[2.1,2],[-2.1,4],[-.7,4],[.7,4],[2.1,4]].forEach(([x,z],index)=>{if(index===2)return;const seat=seatBase.createInstance(`waiting seat ${index}`);seat.position.set(x,.72,z);seat.checkCollisions=true;const back=box('waiting seat back',[x,1.25,z+.52],[1.25,1,.22],'seat');back.checkCollisions=true});
  sign('WAITING AREA',[0,4.85,5.25],[3.7,.62,.12],'floorAccent');
  [[-10,.45,1.7],[-10,.45,2.7],[10,.55,-1.8]].forEach((p,index)=>{const bag=box('decorative luggage',p,[.8,index===2?1.1:.9,.5],index===1?'yellow':'orange');box('luggage handle',[p[0],p[1]+.62,p[2]],[.34,.35,.08],'dark',false)});
  box('trash bin',[11,.65,7.2],[.75,1.3,.75],'trim');

  const gate=new BABYLON.TransformNode('Departure Gate',scene);
  [box('departure gate door',[0,2.25,11.65],[4.6,4.5,.2],'navy'),box('gate left frame',[-2.6,2.7,11.4],[.5,5.4,.7],'yellow'),box('gate right frame',[2.6,2.7,11.4],[.5,5.4,.7],'yellow')].forEach(mesh=>mesh.parent=gate);sign('GATE 01  •  DEPARTURES',[0,5.35,11.35],[6.7,.72,.16],'navy');
  sign('SPAWN AREA',[0,4.7,-7.7],[3.3,.58,.12],'floorAccent');

  // Wall/counter lights visually tie the pools of light to real fixtures.
  [[-7.4,3.9,-5.5],[6.8,5.05,4.45],[-7.4,4.9,6.05],[0,5.95,10.7]].forEach(([x,y,z],index)=>{box(`task light bracket ${index+1}`,[x,y+.16,z],[1.5,.16,.32],'dark',false);const shade=box(`glowing task light ${index+1}`,[x,y,z-.08],[1.25,.14,.4],'white',false);shade.material=material('warm lamp diffuser',PALETTE.white,{emissive:true})});

  // Ambient is intentionally secondary. Sunrise is the sole dynamic shadow source.
  const ambient=new BABYLON.HemisphericLight('subtle indirect fill',new BABYLON.Vector3(0,1,-.2),scene);ambient.diffuse=BABYLON.Color3.FromHexString('#d9cbe0');ambient.groundColor=BABYLON.Color3.FromHexString('#59646b');ambient.intensity=.26;
  const sunrise=new BABYLON.DirectionalLight('low sunrise through windows',new BABYLON.Vector3(.22,-.42,.88),scene);sunrise.position.set(-12,10,-18);sunrise.diffuse=BABYLON.Color3.FromHexString('#ffc982');sunrise.specular=BABYLON.Color3.FromHexString('#ffdca8');sunrise.intensity=.72;
  const weakDevice=matchMedia('(max-width: 800px), (pointer: coarse)').matches,storedQuality=(()=>{try{return JSON.parse(localStorage.getItem('feank.settings.v1')||'{}').quality}catch{return 'auto'}})();
  let shadowGenerator=null;if(storedQuality!=='low'){shadowGenerator=new BABYLON.ShadowGenerator(weakDevice?512:1024,sunrise);shadowGenerator.useBlurExponentialShadowMap=true;shadowGenerator.blurKernel=weakDevice?8:16;shadowGenerator.bias=.003;shadowGenerator.normalBias=.02;[kiosk,expedition,settings,gate].forEach(root=>root.getChildMeshes().forEach(mesh=>shadowGenerator.addShadowCaster(mesh)));scene.meshes.forEach(mesh=>{if(mesh.name==='terminal floor'||mesh.name.includes('counter')||mesh.name.includes('waiting seat'))mesh.receiveShadows=true})}
  const lightSpecs=[['central ceiling pool',[0,5.9,1],.62,9],['invite kiosk pool',[-7.4,5.5,-5.5],.54,7.5],['desk and waiting pool',[6.2,5.6,4.4],.58,8],['gate pool',[0,5.7,9.2],.5,7.5]];
  if(storedQuality==='low')lightSpecs.splice(2,1);
  const practicalLights=lightSpecs.map(([name,[x,y,z],intensity,range])=>{const light=new BABYLON.PointLight(name,new BABYLON.Vector3(x,y,z),scene);light.diffuse=BABYLON.Color3.FromHexString('#ffd9a0');light.specular=BABYLON.Color3.FromHexString('#ffe7bd');light.intensity=intensity;light.range=range;light.radius=.65;return light});
  return {kiosk,expedition,settings,gate,sunrise,shadowGenerator,practicalLights,points:{kiosk:new BABYLON.Vector3(-7.4,2.2,-5.25),expedition:new BABYLON.Vector3(6.8,3.2,4.5),settings:new BABYLON.Vector3(-7.4,3.2,6.05),gate:new BABYLON.Vector3(0,2.4,11.3)}};
}
