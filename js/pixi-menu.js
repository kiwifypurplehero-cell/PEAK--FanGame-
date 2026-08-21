const ASSETS=['sky','clouds','mountains-back','feank-logo','mountain-main','foreground'];
export async function initPixiMenu(host){
  if(!window.PIXI){console.error('[FEANK] Local PixiJS failed to load.');return}
  const app=new PIXI.Application();
  await app.init({resizeTo:window,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:true,antialias:true});
  host.appendChild(app.canvas);app.canvas.setAttribute('aria-hidden','true');
  const textures=await Promise.all(ASSETS.map(name=>PIXI.Assets.load(`assets/menu/${name}.svg`)));
  const layers=textures.map((texture,index)=>{const sprite=new PIXI.Sprite(texture);sprite.anchor.set(.5);app.stage.addChild(sprite);return {sprite,index};});
  let pointerX=0,pointerY=0;window.addEventListener('pointermove',event=>{pointerX=event.clientX/window.innerWidth-.5;pointerY=event.clientY/window.innerHeight-.5},{passive:true});
  function layout(){const w=app.screen.width,h=app.screen.height;for(const {sprite,index} of layers){const scale=Math.max(w/1920,h/1080)*1.035;sprite.scale.set(scale);sprite.position.set(w/2,h/2);sprite._baseX=w/2;sprite._baseY=h/2;sprite._depth=[0,2,4,3,9,13][index]}}
  layout();window.addEventListener('resize',layout);
  let elapsed=0;app.ticker.add(ticker=>{elapsed+=ticker.deltaMS;for(const {sprite,index} of layers){const drift=index===1?Math.sin(elapsed/18000)*5:0;sprite.x+=(sprite._baseX+pointerX*sprite._depth+drift-sprite.x)*.035;sprite.y+=(sprite._baseY+pointerY*sprite._depth*.55-sprite.y)*.035}layers[1].sprite.alpha=.94+Math.sin(elapsed/4500)*.025});
}
