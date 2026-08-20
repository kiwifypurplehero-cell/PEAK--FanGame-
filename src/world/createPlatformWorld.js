const COLORS={platform:'#ded3bd',wood:'#b9824f',woodEdge:'#8f603a',laptop:'#454a50',keyboard:'#646b72',screen:'#bdefff'};

export function createPlatformWorld(scene){
  const materials=new Map();
  const material=(name,color,{emissive=false}={})=>{
    if(materials.has(name))return materials.get(name);
    const value=BABYLON.Color3.FromHexString(color),result=new BABYLON.StandardMaterial(name,scene);
    result.diffuseColor=value;result.ambientColor=value.scale(.35);result.emissiveColor=emissive?value.scale(.55):value.scale(.04);result.specularColor=new BABYLON.Color3(.08,.08,.08);
    materials.set(name,result);return result;
  };
  const box=(name,position,size,materialName,color,{collisions=true,pickable=collisions}={})=>{
    const mesh=BABYLON.MeshBuilder.CreateBox(name,{width:size[0],height:size[1],depth:size[2]},scene);
    mesh.position.set(...position);mesh.material=material(materialName,color);mesh.checkCollisions=collisions;mesh.isPickable=pickable;return mesh;
  };

  scene.clearColor=BABYLON.Color4.FromHexString('#9fd4efff');
  scene.ambientColor=BABYLON.Color3.FromHexString('#dfe8e8');
  const platform=box('platform',[0,-.25,0],[24,.5,24],'platform material',COLORS.platform);

  const workbench=new BABYLON.TransformNode('workbench',scene);
  const workbenchParts=[
    box('workbench top',[0,1.05,0],[3.6,.22,1.35],'light wood',COLORS.woodEdge),
    box('workbench apron',[0,.85,0],[3.2,.28,1.05],'wood',COLORS.wood),
    ...[-1.42,1.42].flatMap(x=>[-.43,.43].map(z=>box('workbench leg',[x,.43,z],[.24,.86,.24],'wood',COLORS.wood)))
  ];
  workbenchParts.forEach(mesh=>mesh.parent=workbench);

  const laptop=new BABYLON.TransformNode('Laptop',scene);
  const base=box('laptop base',[0,1.24,-.03],[1.25,.1,.82],'laptop case',COLORS.laptop,{collisions:false,pickable:true});
  const keyboard=box('laptop keyboard',[0,1.297,-.08],[.98,.018,.54],'keyboard',COLORS.keyboard,{collisions:false,pickable:true});
  const screenCase=box('laptop screen case',[0,1.72,.31],[1.25,.83,.08],'laptop case',COLORS.laptop,{collisions:false,pickable:true});
  screenCase.rotation.x=-.13;
  const screen=box('laptop glowing screen',[0,1.72,.262],[1.08,.67,.018],'laptop screen',COLORS.screen,{collisions:false,pickable:true});
  screen.rotation.x=-.13;screen.material.emissiveColor=BABYLON.Color3.FromHexString(COLORS.screen).scale(.62);
  [base,keyboard,screenCase,screen].forEach(mesh=>mesh.parent=laptop);

  const ambient=new BABYLON.HemisphericLight('clear ambient light',new BABYLON.Vector3(0,1,0),scene);
  ambient.diffuse=BABYLON.Color3.FromHexString('#fff8e8');ambient.groundColor=BABYLON.Color3.FromHexString('#8ea5aa');ambient.intensity=1.05;
  const directional=new BABYLON.DirectionalLight('soft directional light',new BABYLON.Vector3(-.35,-1,.45),scene);
  directional.position.set(6,10,-8);directional.diffuse=BABYLON.Color3.FromHexString('#fff1d2');directional.intensity=.42;

  return {platform,workbench,laptop,interactionPoint:new BABYLON.Vector3(0,1.7,.22)};
}
