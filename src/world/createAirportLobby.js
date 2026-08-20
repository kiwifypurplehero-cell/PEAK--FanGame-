const C={floor:'#d9d4c8',wall:'#eee8dc',beam:'#45545b',blue:'#4f8394',wood:'#a87549',dark:'#28363c',glass:'#9ed8e4',leaf:'#5d8a61',pot:'#bb7656',gold:'#f4b45b'};

export function createAirportLobby(scene){
  const mats=new Map();
  const mat=(name,color,options={})=>{if(mats.has(name))return mats.get(name);const m=new BABYLON.StandardMaterial(name,scene),c=BABYLON.Color3.FromHexString(color);m.diffuseColor=c;m.ambientColor=c.scale(.45);m.emissiveColor=c.scale(options.emissive?.45:.035);m.specularColor=options.glass?new BABYLON.Color3(.18,.22,.23):new BABYLON.Color3(.055,.055,.055);if(options.glass){m.alpha=.34;m.backFaceCulling=false;m.needDepthPrePass=true}mats.set(name,m);return m};
  const box=(name,p,s,material,opts={})=>{const m=BABYLON.MeshBuilder.CreateBox(name,{width:s[0],height:s[1],depth:s[2]},scene);m.position.set(...p);m.material=material;m.checkCollisions=opts.collisions??true;m.isPickable=opts.pickable??m.checkCollisions;return m};
  const cylinder=(name,p,height,diameter,material,opts={})=>{const m=BABYLON.MeshBuilder.CreateCylinder(name,{height,diameter,tessellation:opts.tessellation||8},scene);m.position.set(...p);m.material=material;m.checkCollisions=opts.collisions??false;m.isPickable=false;return m};
  scene.clearColor=BABYLON.Color4.FromHexString('#c8b9e8ff');scene.ambientColor=BABYLON.Color3.FromHexString('#d8dce8');

  // The lobby owns its sunrise backdrop; it never falls back to a test-world sky.
  const sky=BABYLON.MeshBuilder.CreateSphere('permanent sunrise sky',{diameter:78,segments:12,sideOrientation:BABYLON.Mesh.BACKSIDE},scene);sky.material=mat('sunrise sky','#c8b9e8',{emissive:true});sky.isPickable=false;sky.infiniteDistance=true;

  // Compact terminal shell: 22 x 16 metres, open enough to cross in seconds.
  const floor=box('terminal floor',[0,-.15,1],[22,.3,16],mat('warm stone',C.floor));
  box('back wall',[0,3.8,8.85],[22,7.9,.3],mat('terminal plaster',C.wall));
  box('left wall',[-11.15,3.8,1],[.3,7.9,16],mat('terminal plaster',C.wall));
  box('right wall',[11.15,3.8,1],[.3,7.9,16],mat('terminal plaster',C.wall));
  // Solid ceiling bands frame a broad, inexpensive glass skylight.
  box('ceiling west',[-7,7.75,1],[8.2,.3,16],mat('ceiling', '#d8d8d2'));
  box('ceiling east',[7,7.75,1],[8.2,.3,16],mat('ceiling', '#d8d8d2'));
  const glassMat=mat('blue sunrise glass',C.glass,{glass:true});
  for(let z=-5.5;z<=7;z+=3.1){const pane=box('skylight panel',[0,7.72,z],[5.8,.08,2.85],glassMat,{collisions:false,pickable:false});pane.visibility=.88;box('skylight cross beam',[0,7.62,z-1.5],[6.2,.18,.14],mat('steel',C.beam),{collisions:false,pickable:false})}
  for(const x of [-3.05,3.05])box('skylight rail',[x,7.62,1],[.16,.2,15.5],mat('steel',C.beam),{collisions:false,pickable:false});

  // Priority glass facade. One shared material, broad panels, no realtime reflection.
  for(let x=-9.4;x<=9.4;x+=3.75){const pane=box('facade glass panel',[x,3.75,-7.05],[3.55,7.15,.09],glassMat,{collisions:true,pickable:true});pane.visibility=.9;box('facade mullion',[x-1.84,3.75,-6.96],[.15,7.4,.2],mat('steel',C.beam))}
  box('facade top beam',[0,7.42,-6.95],[22,.28,.28],mat('steel',C.beam));
  // Cheap exterior composition visible through the glass.
  box('apron',[0,-.12,-16],[36,.18,18],mat('apron','#788990'),{collisions:false,pickable:false});
  for(const x of [-7,7])box('runway stripe',[x,.01,-16],[4,.025,.28],mat('paint','#eadfae',{emissive:true}),{collisions:false,pickable:false});
  const sun=BABYLON.MeshBuilder.CreateDisc('low sunrise sun',{radius:1.45,tessellation:24},scene);sun.position.set(-8,4,-31);sun.material=mat('sun glow','#ffd37a',{emissive:true});sun.isPickable=false;
  box('distant terminal silhouette',[5,1,-28],[13,2,1],mat('distant lilac','#7b7894'),{collisions:false,pickable:false});

  // Structural pillars and emissive fixtures use shared geometry/materials.
  for(const x of [-8.6,8.6])for(const z of [-3.6,4.8])box('terminal pillar',[x,3.65,z],[.52,7.3,.52],mat('concrete','#d2cec3'));
  for(const x of [-5,0,5])for(const z of [-2,4])box('ceiling luminaire',[x,7.48,z],[2.2,.1,.36],mat('lamp','#fff2c4',{emissive:true}),{collisions:false,pickable:false});

  // Expedition counter and preserved interactive laptop.
  const counter=new BABYLON.TransformNode('Expedition Counter',scene);counter.position.set(-5.8,0,2.5);
  [box('counter body',[0,.65,0],[4.3,1.3,1.15],mat('counter blue',C.blue)),box('counter top',[0,1.36,0],[4.6,.16,1.35],mat('counter wood',C.wood))].forEach(m=>m.parent=counter);
  const laptop=new BABYLON.TransformNode('Laptop',scene);laptop.parent=counter;laptop.position.set(0,0,0);
  const laptopParts=[box('laptop base',[0,1.49,-.05],[1.18,.08,.72],mat('device',C.dark),{collisions:false,pickable:true}),box('laptop keyboard',[0,1.54,-.08],[.94,.018,.45],mat('keys','#66777b'),{collisions:false,pickable:true}),box('laptop screen case',[0,1.91,.28],[1.16,.77,.07],mat('device',C.dark),{collisions:false,pickable:true}),box('laptop screen',[0,1.91,.235],[1,.61,.014],mat('screen','#a9ecf0',{emissive:true}),{collisions:false,pickable:true})];laptopParts.forEach(m=>m.parent=laptop);

  // Waiting zone: only two bench sets, cloned slats and a simple departures board.
  const bench=(z)=>{const root=new BABYLON.TransformNode('waiting bench',scene);for(const x of [-1.05,0,1.05]){const seat=box('bench seat',[3.8+x,.72,z],[.94,.16,.8],mat('seat',C.blue),{collisions:false,pickable:false});seat.parent=root;const back=box('bench back',[3.8+x,1.2,z+.34],[.94,.75,.14],mat('seat',C.blue),{collisions:false,pickable:false});back.parent=root}for(const x of [2.85,4.75])cylinder('bench leg',[x,.36,z],.7,.12,mat('steel',C.beam));return root};bench(2);bench(4.1);
  const board=box('departures board',[3.8,4.45,8.62],[5.2,1.5,.12],mat('departures','#203d49',{emissive:true}),{collisions:false,pickable:false});
  for(let i=0;i<3;i++)box('departure line',[3.8,4.85-i*.38,8.53],[4.4,.07,.02],mat('board text',i===0?'#f4b45b':'#bce3dd',{emissive:true}),{collisions:false,pickable:false});

  // An unmistakable in-world marker makes accidental test-platform regressions visible.
  const signTexture=new BABYLON.DynamicTexture('airport lobby sign text',{width:1024,height:192},scene,false);const signContext=signTexture.getContext();signContext.fillStyle='#fff2c4';signContext.fillRect(0,0,1024,192);signContext.fillStyle='#263940';signContext.font='bold 72px Arial';signContext.textAlign='center';signContext.textBaseline='middle';signContext.fillText('FEANK AIRPORT LOBBY',512,96);signTexture.update();
  const signMaterial=new BABYLON.StandardMaterial('airport lobby sign',scene);signMaterial.diffuseTexture=signTexture;signMaterial.emissiveColor=new BABYLON.Color3(.35,.31,.22);signMaterial.specularColor=BABYLON.Color3.Black();
  const lobbySign=box('FEANK AIRPORT LOBBY sign',[0,6.15,8.42],[7.6,1.35,.1],signMaterial,{collisions:false,pickable:false});

  const plant=(x,z,scale=1)=>{cylinder('plant pot',[x,.42*scale,z],.84*scale,.7*scale,mat('terracotta',C.pot));const stem=cylinder('plant stem',[x,.98*scale,z],.55*scale,.09*scale,mat('stem','#406a4b'));for(let i=0;i<5;i++){const leaf=BABYLON.MeshBuilder.CreateSphere('low poly leaf',{diameter:.65*scale,segments:5},scene);leaf.position.set(x+Math.sin(i*2.4)*.3*scale,1.22*scale+(i%2)*.22*scale,z+Math.cos(i*2.4)*.3*scale);leaf.scaling.y=1.45;leaf.material=mat('foliage',C.leaf);leaf.isPickable=false} };
  plant(-9,-4.8,1.05);plant(8.7,-4.5,1.1);plant(7,6.6,.9);plant(-9,6.7,.85);

  // A single future kiosk. Its screen alone is pickable and shares the raycast manager.
  const kiosk=new BABYLON.TransformNode('Kiosk',scene);kiosk.position.set(7.7,0,-.8);box('kiosk pedestal',[7.7,.85,-.8],[1.25,1.7,.75],mat('kiosk shell',C.dark));const kioskScreen=box('kiosk screen',[7.7,1.27,-1.19],[.82,.7,.035],mat('kiosk display','#87d6df',{emissive:true}),{collisions:false,pickable:true});
  // Gate at the far end; the doors remain inactive in this milestone.
  box('gate frame',[0,2.35,8.5],[5.2,4.7,.45],mat('gate frame',C.beam));box('gate left door',[-1.18,1.75,8.2],[2.2,3.5,.22],mat('gate door','#80a5ad'));box('gate right door',[1.18,1.75,8.2],[2.2,3.5,.22],mat('gate door','#80a5ad'));box('EXPEDITION GATE sign',[0,4.25,8.16],[4.1,.55,.08],mat('gate sign',C.gold,{emissive:true}),{collisions:false,pickable:false});

  const hemi=new BABYLON.HemisphericLight('soft terminal fill',new BABYLON.Vector3(0,1,0),scene);hemi.diffuse=BABYLON.Color3.FromHexString('#dcecff');hemi.groundColor=BABYLON.Color3.FromHexString('#766f83');hemi.intensity=.72;
  const sunrise=new BABYLON.DirectionalLight('permanent sunrise',new BABYLON.Vector3(.42,-.72,.56),scene);sunrise.position.set(-12,11,-18);sunrise.diffuse=BABYLON.Color3.FromHexString('#ffd39b');sunrise.intensity=.86;
  const fill=new BABYLON.PointLight('central practical light',new BABYLON.Vector3(0,6,2),scene);fill.diffuse=BABYLON.Color3.FromHexString('#fff2d2');fill.intensity=.38;fill.range=14;
  const quality=localStorage.getItem('feank.settings')||'';if(!quality.includes('"quality":"low"')){const shadows=new BABYLON.ShadowGenerator(512,sunrise);shadows.useBlurExponentialShadowMap=true;shadows.blurKernel=8;[counter,...scene.meshes.filter(m=>m.name.includes('pillar'))].forEach(m=>shadows.addShadowCaster(m));floor.receiveShadows=true}
  return {floor,laptop,kiosk:kioskScreen,lobbySign,spawn:{position:{x:0,y:1.72,z:-4.5},target:{x:-4.8,y:1.5,z:2.5}},laptopPoint:new BABYLON.Vector3(-5.8,1.9,2.72),kioskPoint:new BABYLON.Vector3(7.7,1.3,-1.2)};
}
