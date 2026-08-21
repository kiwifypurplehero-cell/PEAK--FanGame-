const COLORS = Object.freeze({
  floor: '#d8d0bf',
  wall: '#eee7d8',
  ceiling: '#ddd9ce',
  steel: '#52656b',
  glass: '#91cbd8',
  wood: '#a66f43',
  upholstery: '#537f8c',
  dark: '#293a40',
  leaf: '#5f8d62',
  pot: '#b86f52',
  gold: '#e9aa58'
});

/** Build the one, official FEANK airport lobby from mobile-safe primitives. */
export function createAirportLobby(scene) {
  const materials = new Map();
  const material = (name, hex, options = {}) => {
    if (materials.has(name)) return materials.get(name);
    const value = new BABYLON.StandardMaterial(name, scene);
    const color = BABYLON.Color3.FromHexString(hex);
    value.diffuseColor = color;
    value.ambientColor = color.scale(0.38);
    value.emissiveColor = options.emissive ? color.scale(0.42) : BABYLON.Color3.Black();
    value.specularColor = options.glass
      ? new BABYLON.Color3(0.12, 0.16, 0.17)
      : new BABYLON.Color3(0.035, 0.035, 0.035);
    value.alpha = options.alpha ?? 1;
    value.backFaceCulling = options.backFaceCulling ?? true;
    value.disableDepthWrite = options.disableDepthWrite ?? false;
    materials.set(name, value);
    return value;
  };
  const box = (name, position, size, boxMaterial, options = {}) => {
    const mesh = BABYLON.MeshBuilder.CreateBox(name, {
      width: size[0], height: size[1], depth: size[2]
    }, scene);
    mesh.position.set(...position);
    mesh.material = boxMaterial;
    mesh.checkCollisions = options.collisions ?? false;
    mesh.isPickable = options.pickable ?? mesh.checkCollisions;
    return mesh;
  };
  const cylinder = (name, position, height, diameter, cylinderMaterial, tessellation = 8) => {
    const mesh = BABYLON.MeshBuilder.CreateCylinder(name, {height, diameter, tessellation}, scene);
    mesh.position.set(...position);
    mesh.material = cylinderMaterial;
    mesh.checkCollisions = false;
    mesh.isPickable = false;
    return mesh;
  };
  const sphere = (name, position, diameter, sphereMaterial, segments = 6) => {
    const mesh = BABYLON.MeshBuilder.CreateSphere(name, {diameter, segments}, scene);
    mesh.position.set(...position);
    mesh.material = sphereMaterial;
    mesh.checkCollisions = false;
    mesh.isPickable = false;
    return mesh;
  };

  scene.clearColor = BABYLON.Color4.FromHexString('#b9d9edff');
  scene.ambientColor = BABYLON.Color3.FromHexString('#d9d8e5');

  // 1. FLOOR
  const floor = box('floor', [0, -0.15, 0], [22, 0.3, 16], material('warm stone', COLORS.floor), {collisions: true});

  // 2. WALLS
  const wallMaterial = material('light terminal walls', COLORS.wall);
  box('west wall', [-11.15, 3.8, 0], [0.3, 7.9, 16], wallMaterial, {collisions: true});
  box('east wall', [11.15, 3.8, 0], [0.3, 7.9, 16], wallMaterial, {collisions: true});
  box('gate wall left', [-7.4, 3.8, 8.15], [7.2, 7.9, 0.3], wallMaterial, {collisions: true});
  box('gate wall right', [7.4, 3.8, 8.15], [7.2, 7.9, 0.3], wallMaterial, {collisions: true});
  box('gate wall header', [0, 6.5, 8.15], [7.6, 2.5, 0.3], wallMaterial, {collisions: true});
  const pillarMaterial = material('structural steel', COLORS.steel);
  for (const x of [-8.6, 8.6]) {
    for (const z of [-4.5, 4.8]) box('terminal pillar', [x, 3.65, z], [0.5, 7.3, 0.5], pillarMaterial, {collisions: true});
  }

  // 3. ROOF
  const ceilingMaterial = material('high ceiling', COLORS.ceiling);
  box('roof west', [-7, 7.72, 0], [8.2, 0.3, 16], ceilingMaterial, {collisions: true});
  box('roof east', [7, 7.72, 0], [8.2, 0.3, 16], ceilingMaterial, {collisions: true});
  for (const z of [-6.1, -3.05, 0, 3.05, 6.1]) box('skylight cross beam', [0, 7.58, z], [6.1, 0.2, 0.16], pillarMaterial);
  for (const x of [-3.05, 3.05]) box('skylight side beam', [x, 7.58, 0], [0.16, 0.2, 15.8], pillarMaterial);

  // 4. GLASS
  const glassMaterial = material('simple blue glass', COLORS.glass, {glass: true, alpha: 0.48});
  for (let x = -9.25; x <= 9.25; x += 3.7) {
    box('facade glass panel', [x, 3.75, -8.02], [3.52, 7.2, 0.08], glassMaterial, {collisions: true});
    box('facade mullion', [x - 1.84, 3.75, -7.93], [0.16, 7.5, 0.2], pillarMaterial, {collisions: true});
  }
  box('facade top beam', [0, 7.48, -7.93], [22, 0.25, 0.22], pillarMaterial, {collisions: true});
  for (const z of [-4.58, -1.53, 1.53, 4.58]) box('skylight glass panel', [0, 7.68, z], [5.88, 0.06, 2.88], glassMaterial);

  // 5. LIGHTING — exactly two real lights and no shadows or post effects.
  const hemisphere = new BABYLON.HemisphericLight('lobby ambient light', new BABYLON.Vector3(0, 1, 0), scene);
  hemisphere.diffuse = BABYLON.Color3.FromHexString('#e4efff');
  hemisphere.groundColor = BABYLON.Color3.FromHexString('#777184');
  hemisphere.intensity = 0.78;
  const sunriseLight = new BABYLON.DirectionalLight('low sunrise light', new BABYLON.Vector3(0.38, -0.72, 0.58), scene);
  sunriseLight.position.set(-12, 10, -18);
  sunriseLight.diffuse = BABYLON.Color3.FromHexString('#ffd09a');
  sunriseLight.intensity = 0.82;

  // 6. FURNITURE
  const seatMaterial = material('bench upholstery', COLORS.upholstery);
  const createBench = (name, z) => {
    const root = new BABYLON.TransformNode(name, scene);
    root.position.set(4, 0, z);
    for (const x of [-1.05, 0, 1.05]) {
      const seat = box('bench seat', [x, 0.72, 0], [0.94, 0.16, 0.82], seatMaterial);
      const back = box('bench back', [x, 1.17, 0.34], [0.94, 0.72, 0.14], seatMaterial);
      seat.parent = back.parent = root;
    }
    for (const x of [-1.46, 1.46]) {
      const leg = cylinder('bench leg', [x, 0.36, 0], 0.7, 0.12, pillarMaterial);
      leg.parent = root;
    }
    return root;
  };
  createBench('waiting bench 1', 2.1);
  createBench('waiting bench 2', 4.25);
  box('departures board', [4, 4.5, 7.92], [5.4, 1.5, 0.1], material('departures board', COLORS.dark, {emissive: true}));
  for (let row = 0; row < 3; row += 1) box('departure information strip', [4, 4.88 - row * 0.38, 7.85], [4.5, 0.07, 0.02], material(row ? 'board text' : 'board heading', row ? '#bce3dd' : COLORS.gold, {emissive: true}));
  const kiosk = box('kiosk', [7.8, 0.9, -0.8], [1.3, 1.8, 0.8], material('kiosk body', COLORS.dark), {collisions: true});
  const kioskScreen = box('kiosk screen', [7.8, 1.35, -1.22], [0.86, 0.7, 0.035], material('kiosk display', '#83cbd3', {emissive: true}), {pickable: true});
  kioskScreen.parent = kiosk;
  kioskScreen.position.set(0, 0.45, -0.42);

  // 7. WORKBENCH
  const workbench = new BABYLON.TransformNode('expedition workbench', scene);
  workbench.position.set(-5.7, 0, 2.4);
  for (const part of [
    box('workbench body', [0, 0.65, 0], [4.2, 1.3, 1.15], material('counter front', COLORS.upholstery), {collisions: true}),
    box('workbench wooden top', [0, 1.37, 0], [4.55, 0.16, 1.35], material('warm wood', COLORS.wood), {collisions: true})
  ]) part.parent = workbench;

  // 8. LAPTOP
  const laptop = new BABYLON.TransformNode('laptop', scene);
  laptop.parent = workbench;
  const deviceMaterial = material('laptop case', COLORS.dark);
  for (const part of [
    box('laptop base', [0, 1.5, -0.06], [1.18, 0.08, 0.72], deviceMaterial, {pickable: true}),
    box('laptop keyboard', [0, 1.55, -0.08], [0.95, 0.02, 0.46], material('laptop keys', '#65777a'), {pickable: true}),
    box('laptop screen case', [0, 1.91, 0.28], [1.16, 0.76, 0.07], deviceMaterial, {pickable: true}),
    box('laptop screen', [0, 1.91, 0.235], [1, 0.6, 0.014], material('laptop display', '#a8e7e7', {emissive: true}), {pickable: true})
  ]) part.parent = laptop;

  // 9. PLANTS
  const potMaterial = material('terracotta pots', COLORS.pot);
  const foliageMaterial = material('plant foliage', COLORS.leaf);
  const stemMaterial = material('plant stems', '#416b4b');
  const createPlant = (x, z, scale = 1) => {
    cylinder('plant pot', [x, 0.4 * scale, z], 0.8 * scale, 0.72 * scale, potMaterial);
    cylinder('plant stem', [x, 0.93 * scale, z], 0.55 * scale, 0.09 * scale, stemMaterial, 6);
    for (let index = 0; index < 4; index += 1) {
      const leaf = sphere('plant leaf', [x + Math.sin(index * 1.8) * 0.28 * scale, (1.2 + (index % 2) * 0.2) * scale, z + Math.cos(index * 1.8) * 0.28 * scale], 0.62 * scale, foliageMaterial, 5);
      leaf.scaling.y = 1.45;
    }
  };
  createPlant(-9, -5.8, 1.05);
  createPlant(9, -5.4, 1.05);
  createPlant(8.7, 6.4, 0.9);

  // 10. GATE
  const gate = new BABYLON.TransformNode('EXPEDITION GATE', scene);
  for (const part of [
    box('gate left post', [-2.45, 2.25, 7.8], [0.45, 4.5, 0.45], pillarMaterial, {collisions: true}),
    box('gate right post', [2.45, 2.25, 7.8], [0.45, 4.5, 0.45], pillarMaterial, {collisions: true}),
    box('gate lintel', [0, 4.4, 7.8], [5.35, 0.45, 0.45], pillarMaterial, {collisions: true}),
    box('gate left door', [-1.18, 1.72, 7.82], [2.15, 3.42, 0.16], material('gate doors', '#7fa5ad'), {collisions: true}),
    box('gate right door', [1.18, 1.72, 7.82], [2.15, 3.42, 0.16], material('gate doors', '#7fa5ad'), {collisions: true}),
    box('EXPEDITION GATE sign', [0, 4.9, 7.72], [4.4, 0.58, 0.1], material('gate sign', COLORS.gold, {emissive: true}))
  ]) part.parent = gate;

  // 11. SKY — a simple inverted sphere plus layered sunrise horizon shapes.
  const skyMaterial = material('sunrise blue sky', '#a9cee8', {emissive: true, backFaceCulling: false, disableDepthWrite: true});
  const sky = BABYLON.MeshBuilder.CreateSphere('sunrise sky', {diameter: 72, segments: 12, sideOrientation: BABYLON.Mesh.BACKSIDE}, scene);
  sky.material = skyMaterial;
  sky.infiniteDistance = true;
  sky.isPickable = false;
  const horizonMaterials = [
    material('sunrise lilac', '#bba6d8', {emissive: true}),
    material('sunrise pink', '#e7a6b8', {emissive: true}),
    material('sunrise orange', '#efaa73', {emissive: true})
  ];
  horizonMaterials.forEach((horizonMaterial, index) => box('sunrise horizon band', [0, 1.2 + index * 1.1, -25 - index * 0.3], [38, 1.5, 0.1], horizonMaterial));
  const sun = sphere('golden sunrise', [-8, 4.2, -25], 2.6, material('golden sun', '#ffd477', {emissive: true}), 12);
  sun.scaling.z = 0.08;

  // 12. SPAWN
  const spawn = Object.freeze({
    position: Object.freeze({x: 0, y: 1.72, z: -4.5}),
    target: Object.freeze({x: -4.8, y: 1.5, z: 2.4})
  });
  const laptopPoint = new BABYLON.Vector3(-5.7, 1.9, 2.64);
  const kioskPoint = new BABYLON.Vector3(7.8, 1.35, -1.22);

  const required = {floor, laptop, kiosk, gate, spawn};
  for (const [name, value] of Object.entries(required)) {
    if (!value) throw new Error(`[AIRPORT LOBBY] Required object "${name}" was not created.`);
  }

  console.info('[FEANK] New primitive airport lobby created', {
    meshes: scene.meshes.length,
    lights: scene.lights.length,
    materials: scene.materials.length,
    advancedGraphics: false
  });
  return {spawn, laptop, laptopPoint, kiosk, kioskPoint, gate};
}
