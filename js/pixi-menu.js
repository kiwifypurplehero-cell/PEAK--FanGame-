const VIRTUAL_WIDTH=1920;
const VIRTUAL_HEIGHT=1080;
const LAYERS=[
  ['skyLayer','forest-sky',0],
  ['distantMountainsLayer','forest-distant-mountains',.05],
  ['distantForestLayer','forest-distant',.08],
  ['midForestLayer','forest-mid',.12],
  ['rockCliffLayer','forest-cliff',.12],
  ['waterfallLayer','forest-waterfall',.12],
  ['foregroundTreesLayer','forest-trees-front',.18],
  ['branchesLayer','forest-branches',.18],
  ['foregroundGroundLayer','forest-foreground',.22],
  ['logoLayer','feank-logo',.08]
];

export async function initPixiMenu(host){
  if(!window.PIXI){console.error('[FEANK] Local PixiJS failed to load.');return}
  const app=new PIXI.Application();
  await app.init({width:window.innerWidth,height:window.innerHeight,resolution:Math.min(devicePixelRatio||1,2),autoDensity:true,antialias:true,background:'#6d579d'});
  host.appendChild(app.canvas);app.canvas.setAttribute('aria-hidden','true');
  const textures=await Promise.all(LAYERS.map(([,asset])=>PIXI.Assets.load(`assets/menu/${asset}.svg`)));
  const menuWorld=new PIXI.Container();app.stage.addChild(menuWorld);
  const layers=LAYERS.map(([name,,parallax],i)=>{const container=new PIXI.Container();container.label=name;const sprite=new PIXI.Sprite(textures[i]);container.addChild(sprite);menuWorld.addChild(container);return{name,container,sprite,parallax}});
  // HTML controls mirror this final Pixi layer's transform and remain accessible.
  const uiLayer=new PIXI.Container();uiLayer.label='uiLayer';menuWorld.addChild(uiLayer);
  const ui=document.querySelector('.ui-composition');let pointerX=0,pointerY=0;
  addEventListener('pointermove',e=>{pointerX=e.clientX/innerWidth-.5;pointerY=e.clientY/innerHeight-.5},{passive:true});
  function resize(){
    const viewportWidth=window.innerWidth,viewportHeight=window.innerHeight;
    app.renderer.resize(viewportWidth,viewportHeight);
    // Scale the complete 1920x1080 composition like background-size: cover.
    const scale=Math.max(viewportWidth/VIRTUAL_WIDTH,viewportHeight/VIRTUAL_HEIGHT);
    const offsetX=(viewportWidth-VIRTUAL_WIDTH*scale)/2;
    const offsetY=(viewportHeight-VIRTUAL_HEIGHT*scale)/2;
    menuWorld.scale.set(scale);menuWorld.position.set(offsetX,offsetY);
    ui?.style.setProperty('--menu-scale',scale);ui?.style.setProperty('--menu-offset-x',`${offsetX}px`);ui?.style.setProperty('--menu-offset-y',`${offsetY}px`);
  }
  window.addEventListener('load',resize);window.addEventListener('resize',resize);document.addEventListener('fullscreenchange',resize);resize();
  let elapsed=0;app.ticker.add(t=>{elapsed+=t.deltaMS;for(const {container,parallax,name} of layers){const amount=parallax*70;container.x+=(pointerX*amount-container.x)*.035;container.y+=(pointerY*amount*.45-container.y)*.035;if(name==='waterfallLayer')container.alpha=.86+Math.sin(elapsed/1100)*.06} });
}
