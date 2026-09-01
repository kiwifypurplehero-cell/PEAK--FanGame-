const STORAGE_KEY='feank.language';

const translations={
  en:{
    'menu.hostGame':'HOST GAME','menu.playOffline':'PLAY OFFLINE','menu.settings':'SETTINGS','menu.credits':'CREDITS','menu.quit':'QUIT','menu.maintenance':'MAINTENANCE','menu.testLobby':'TEST LOBBY','menu.unofficial':'UNOFFICIAL FAN PROJECT','menu.airport':'MENU',
    'settings.title':'SETTINGS','settings.game':'GAME','settings.graphics':'GRAPHICS','settings.audio':'AUDIO','settings.controls':'CONTROLS','settings.language':'LANGUAGE','settings.preferencesSoon':'More expedition preferences are coming soon.','settings.quality':'QUALITY','settings.fullscreen':'FULLSCREEN','settings.masterVolume':'MASTER VOLUME','settings.music':'MUSIC','settings.effects':'SOUND EFFECTS','settings.move':'MOVE','settings.look':'LOOK','settings.jump':'JUMP','settings.interact':'INTERACT','settings.pause':'PAUSE / BACK','settings.desktop':'Desktop keyboard and mouse controls.','settings.pressKey':'PRESS KEY',
    'common.back':'BACK','common.yes':'YES','common.no':'NO','maintenance.status':'EXPEDITION STATUS','maintenance.title':'UNDER MAINTENANCE','maintenance.body':'THIS MODE IS CURRENTLY UNDER MAINTENANCE','credits.created':'Created by','credits.assisted':'Development assisted by','credits.notice':"An unofficial fan project, not affiliated with or endorsed by the original game's developers.",'quit.title':'QUIT GAME?','quit.thanks':'THANKS FOR PLAYING','quit.return':'RETURN TO MENU',
    'terminal.title':'EXPEDITION TERMINAL','terminal.map':'MAP','terminal.random':'RANDOM','terminal.difficulty':'DIFFICULTY','terminal.inDevelopment':'IN DEVELOPMENT','terminal.startGame':'START GAME','interaction.useTerminal':'USE TERMINAL','expedition.startingIn':'STARTING EXPEDITION IN','expedition.notImplemented':'EXPEDITION SYSTEM IN DEVELOPMENT'
  },
  'pt-BR':{
    'menu.hostGame':'CRIAR PARTIDA','menu.playOffline':'JOGAR OFFLINE','menu.settings':'CONFIGURAÇÕES','menu.credits':'CRÉDITOS','menu.quit':'SAIR','menu.maintenance':'MANUTENÇÃO','menu.testLobby':'LOBBY DE TESTE','menu.unofficial':'PROJETO DE FÃ NÃO OFICIAL','menu.airport':'MENU',
    'settings.title':'CONFIGURAÇÕES','settings.game':'JOGO','settings.graphics':'GRÁFICOS','settings.audio':'ÁUDIO','settings.controls':'CONTROLES','settings.language':'IDIOMA','settings.preferencesSoon':'Mais preferências de expedição chegarão em breve.','settings.quality':'QUALIDADE','settings.fullscreen':'TELA CHEIA','settings.masterVolume':'VOLUME GERAL','settings.music':'MÚSICA','settings.effects':'EFEITOS SONOROS','settings.move':'MOVER','settings.look':'OLHAR','settings.jump':'PULAR','settings.interact':'INTERAGIR','settings.pause':'PAUSAR / VOLTAR','settings.desktop':'Controles de teclado e mouse para computador.','settings.pressKey':'PRESSIONE UMA TECLA',
    'common.back':'VOLTAR','common.yes':'SIM','common.no':'NÃO','maintenance.status':'STATUS DA EXPEDIÇÃO','maintenance.title':'EM MANUTENÇÃO','maintenance.body':'ESTE MODO ESTÁ EM MANUTENÇÃO','credits.created':'Criado por','credits.assisted':'Desenvolvimento auxiliado por','credits.notice':'Projeto de fã não oficial, sem afiliação ou endosso dos desenvolvedores do jogo original.','quit.title':'SAIR DO JOGO?','quit.thanks':'OBRIGADO POR JOGAR','quit.return':'VOLTAR AO MENU',
    'terminal.title':'TERMINAL DE EXPEDIÇÃO','terminal.map':'MAPA','terminal.random':'ALEATÓRIO','terminal.difficulty':'DIFICULDADE','terminal.inDevelopment':'EM DESENVOLVIMENTO','terminal.startGame':'INICIAR PARTIDA','interaction.useTerminal':'USAR TERMINAL','expedition.startingIn':'INICIANDO EXPEDIÇÃO EM','expedition.notImplemented':'SISTEMA DE EXPEDIÇÃO EM DESENVOLVIMENTO'
  }
};

const supported=['en','pt-BR'];
let language=(()=>{try{const saved=localStorage.getItem(STORAGE_KEY);if(supported.includes(saved))return saved;const legacy=JSON.parse(localStorage.getItem('feank.settings.v1')||'{}').language;return supported.includes(legacy)?legacy:'en'}catch{return'en'}})();
const listeners=new Set();
export const t=key=>translations[language][key]??translations.en[key]??key;
export const getLanguage=()=>language;
export function applyTranslations(root=document){root.querySelectorAll('[data-i18n]').forEach(node=>node.textContent=t(node.dataset.i18n));document.documentElement.lang=language;listeners.forEach(listener=>listener(language))}
export function setLanguage(value){language=supported.includes(value)?value:'en';try{localStorage.setItem(STORAGE_KEY,language)}catch{/* Storage can be unavailable. */}applyTranslations()}
export function subscribeLanguage(listener){listeners.add(listener);return()=>listeners.delete(listener)}
