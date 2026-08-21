const VIRTUAL_WIDTH=1920;
const VIRTUAL_HEIGHT=1080;
const COMPOSITION_ASSETS=['clouds','mountains-back','feank-logo','mountain-main','foreground'];

export async function initPixiMenu(host){
  if(!window.PIXI){console.error('[FEANK] Local PixiJS failed to load.');return}

  const app=new PIXI.Application();
  await app.init({
    width:window.innerWidth,
    height:window.innerHeight,
    resolution:Math.min(window.devicePixelRatio||1,2),
    autoDensity:true,
    antialias:true
  });
  host.appendChild(app.canvas);
  app.canvas.setAttribute('aria-hidden','true');

  const [skyTexture,...compositionTextures]=await Promise.all(
    ['sky',...COMPOSITION_ASSETS].map(name=>PIXI.Assets.load(`assets/menu/${name}.svg`))
  );

  // The sky fills the physical viewport. Everything else lives in one fixed
  // 1920x1080 coordinate system and receives exactly the same contain scale.
  const backgroundLayer=new PIXI.Container();
  const menuWorld=new PIXI.Container();
  app.stage.addChild(backgroundLayer,menuWorld);

  const sky=new PIXI.Sprite(skyTexture);
  sky.anchor.set(.5);
  backgroundLayer.addChild(sky);

  const layers=compositionTextures.map((texture,index)=>{
    const sprite=new PIXI.Sprite(texture);
    sprite.position.set(0,0);
    menuWorld.addChild(sprite);
    return {sprite,index,depth:[2,4,3,9,13][index]};
  });

  const uiComposition=document.querySelector('.ui-composition');
  let pointerX=0,pointerY=0;
  window.addEventListener('pointermove',event=>{
    pointerX=event.clientX/window.innerWidth-.5;
    pointerY=event.clientY/window.innerHeight-.5;
  },{passive:true});

  function resizeMenu(){
    const viewportWidth=window.innerWidth;
    const viewportHeight=window.innerHeight;
    app.renderer.resize(viewportWidth,viewportHeight);

    const scale=Math.min(viewportWidth/VIRTUAL_WIDTH,viewportHeight/VIRTUAL_HEIGHT);
    const offsetX=(viewportWidth-VIRTUAL_WIDTH*scale)/2;
    const offsetY=(viewportHeight-VIRTUAL_HEIGHT*scale)/2;
    menuWorld.scale.set(scale);
    menuWorld.position.set(offsetX,offsetY);

    // The HTML controls use the identical virtual origin and scale as Pixi.
    uiComposition?.style.setProperty('--menu-scale',scale);
    uiComposition?.style.setProperty('--menu-offset-x',`${offsetX}px`);
    uiComposition?.style.setProperty('--menu-offset-y',`${offsetY}px`);

    // Only the sky uses cover, allowing ultrawide screens to reveal a filled
    // background without stretching or changing the foreground composition.
    const backgroundScale=Math.max(viewportWidth/VIRTUAL_WIDTH,viewportHeight/VIRTUAL_HEIGHT);
    sky.scale.set(backgroundScale);
    sky.position.set(viewportWidth/2,viewportHeight/2);
  }

  window.addEventListener('resize',resizeMenu);
  document.addEventListener('fullscreenchange',resizeMenu);
  resizeMenu();

  let elapsed=0;
  app.ticker.add(ticker=>{
    elapsed+=ticker.deltaMS;
    for(const {sprite,index,depth} of layers){
      const drift=index===0?Math.sin(elapsed/18000)*5:0;
      const targetX=pointerX*depth+drift;
      const targetY=pointerY*depth*.55;
      sprite.x+=(targetX-sprite.x)*.035;
      sprite.y+=(targetY-sprite.y)*.035;
    }
    layers[0].sprite.alpha=.94+Math.sin(elapsed/4500)*.025;
  });
}
