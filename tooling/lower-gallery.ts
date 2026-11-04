import {readFile,writeFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {instruction,branchExpression,expr,literal,variable,uiImageButton,uiScreen,uiCatalog,showUI,waitUI,stageStyle} from 'galbox-sdk/port-kit';
import type {ProgramBuilder,AssetRef,UIScreenRef,UIControlRef} from 'galbox-sdk/port-kit';
import {bool,string} from 'galbox-sdk/protocol';
import type {Instruction} from 'galbox-sdk/protocol';
import {Content} from './content.js';
import {DoorStage} from './door-stage.js';
import {DoorEffects} from './door-effects.js';
import {SourceAudioLowerer,sourceAudioTags} from './lower-audio.js';
import {sourceMacros} from './source-macros.js';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {tokenize,requireValue,strictArgs,literalArg} from './kag.js';
import type {Token,Tag} from './kag.js';
import {nativeSource} from './native-source.js';

const exec=promisify(execFile);
type Button={graphic:string;target:string;x:number;y:number;ref?:UIControlRef<'button'>};
type Block={id:string;file:string;label:string;tokens:Token[];next:string|null;hook:string|null;jump:string|null;buttons:Button[]};
type Issue={code:string;asset:string;behavior:string};

/** Static six-file gallery compiler. Native hooks become SDK UI waits, never JS handlers. */
export async function lowerGallery(b:ProgramBuilder,content:Content,locale:Language){
 const blocks=new Map<string,Block>(),sources=new Map<string,string>(),issues:Issue[]=[],menus=new Map<string,{screen:UIScreenRef;overlay:AssetRef<'image'>;buttons:Button[]}>(),screens:UIScreenRef[]=[],knownScripts=new Set<string>();
 const key=(file:string,label:string)=>file.replace(/\.ks$/u,'')+':'+label;
 for(let page=1;page<=6;page++){
  const file=`picture${page===1?'':page}.ks`,raw=await readFile(`private/text/${locale}/scenario/${file}`,'utf8'),tokens=tokenize(raw,file);sources.set(file,raw);let current:Block|undefined;
  for(const t of tokens){if(t.kind==='label'){const id=key(file,t.name);requireValue(!blocks.has(id),'GALLERY_DUPLICATE_LABEL '+id);if(current)current.next=id;current={id,file,label:t.name,tokens:[],next:null,hook:null,jump:null,buttons:[]};blocks.set(id,current);}else{requireValue(current,'GALLERY_BEFORE_LABEL');current.tokens.push(t);}}
 }
 for(const block of blocks.values()){
  const output:Token[]=[];let x=0,y=0;
  for(let n=0;n<block.tokens.length;n++){
   const t=block.tokens[n]!;if(t.kind==='text'){requireValue(!t.text.trim(),'GALLERY_UNEXPECTED_TEXT');continue;}requireValue(t.kind==='tag','GALLERY_SCRIPT_OUTSIDE_BLOCK');
   if(t.name==='iscript'){strictArgs(t,[]);let script='';while(block.tokens[++n]?.kind==='script')script+=(block.tokens[n] as Extract<Token,{kind:'script'}>).text;const end=block.tokens[n];requireValue(end?.kind==='tag'&&end.name==='endscript','GALLERY_SCRIPT_END');const m=/^functionmyLeftClickHook\(\)\{kag\.process\('','\*([^']+)'\);returntrue;\}$/u.exec(script.replace(/\s/gu,''));requireValue(m&&!block.hook,'GALLERY_UNKNOWN_SCRIPT '+block.id);block.hook=key(block.file,m[1]!);knownScripts.add(block.id);continue;}
   if(t.name==='eval'){strictArgs(t,['exp']);const exp=literalArg(t,'exp').replace(/\s/gu,'');if(exp==='tf.fromextra=true'){output.push(t);continue;}requireValue(['kag.leftClickHook.add(myLeftClickHook)','kag.leftClickHook.remove(myLeftClickHook)','kag.goToStartMenuItem.visible=false'].includes(exp),'GALLERY_UNKNOWN_EVAL '+block.id);if(exp.includes('.add('))requireValue(block.hook,'GALLERY_HOOK_ORDER');continue;}
   if(t.name==='locate'){strictArgs(t,['x','y']);x=Number(t.args.x);y=Number(t.args.y);continue;}
   if(t.name==='button'){strictArgs(t,['graphic','target','storage']);requireValue(Number.isInteger(x)&&Number.isInteger(y)&&t.args.target?.startsWith('*'),'GALLERY_BUTTON');block.buttons.push({graphic:literalArg(t,'graphic'),target:key(t.args.storage??block.file,literalArg(t,'target').slice(1)),x,y});continue;}
   if(t.name==='jump'){strictArgs(t,['storage','target']);requireValue(!block.jump,'GALLERY_JUMP_COUNT');block.jump=t.args.storage==='title.ks'?'title':key(t.args.storage??block.file,t.args.target?.replace(/^\*/u,'')??'picture_main');continue;}
   if(t.name==='s'){strictArgs(t,[]);continue;}
   output.push(t);
  }
  block.tokens=output;requireValue([block.buttons.length>0,!!block.hook,!!block.jump].filter(Boolean).length<=1,'GALLERY_MULTIPLE_CONTROL '+block.id);
 }
 const entry='picture:picture_main',reachable=new Set<string>();function visit(id:string){if(id==='title'||reachable.has(id))return;const block=blocks.get(id);requireValue(block,'GALLERY_TARGET '+id);reachable.add(id);for(const target of block.buttons.length?block.buttons.map(v=>v.target):[block.hook??block.jump??block.next]){requireValue(target,'GALLERY_FALLTHROUGH '+id);visit(target);}}visit(entry);
 for(const block of blocks.values())if(!reachable.has(block.id))issues.push({code:'SOURCE_UNREACHABLE_GALLERY_LABEL',asset:block.id,behavior:'No original button, hook, jump or fallthrough reaches this label. Source remains in the private input; no unreachable presentation is invented.'});
 const blank=await content.solid('transparent'),white=await content.solid('white'),baseline=new DoorStage(b,content,blank,white,true,['7','trail']);baseline.addressPrefix='gallery-seed';baseline.flush();const seeds=baseline.take();
 const nav=variable('original.gallery-next','string'),choice=variable('original.gallery-control','string');b.global({id:nav.id,kind:'string',initial:string(entry)}).global({id:choice.id,kind:'string',initial:string('')}).global({id:'original.native-menu-active',kind:'bool',initial:bool(false)}).global({id:'original.fromextra',kind:'bool',initial:bool(false)});
 for(const block of blocks.values())if(reachable.has(block.id)&&block.buttons.length){
  requireValue(block.label==='backpoint','GALLERY_MENU_LABEL');const layers:{file:string;x:number;y:number}[]=[];
  for(const [n,button]of block.buttons.entries()){
   const source=content.sourceButtonImage(button.graphic),bytes=await readFile(source),dimensions=(await exec('magick',['identify','-format','%w %h',source])).stdout.trim().split(' ').map(Number),frameWidth=Math.floor(dimensions[0]!/3),frameHeight=dimensions[1]!,width=Math.min(frameWidth,800-button.x),height=Math.min(frameHeight,600-button.y);requireValue(button.x>=0&&button.y>=0&&width>0&&height>0,'GALLERY_BUTTON_RECT');
   const base=`private/generated/gallery-button-${hash(hash(bytes)+':'+width+':'+height)}`,sheet=base+'.png',normal=base+'-normal.png',args:string[]=[];for(const frame of [0,2,1])args.push('(',source,'-crop',`${width}x${height}+${frame*frameWidth}+0`,'+repage',')');await exec('magick',[...args,'+append','-depth','8','-strip',sheet]);await exec('magick',[sheet,'-crop',`${width}x${height}+0+0`,'+repage','-strip',normal]);
   try{button.ref=uiImageButton('gallery-'+block.file.replace(/\.ks$/u,'')+'-'+n,await content.encodedImage(sheet),{rect:{x:button.x*1.6,y:button.y*1.2,width:width*1.6,height:height*1.2},frameWidth:width,frameHeight:height,text:button.target});}catch(error){throw new Error('GALLERY_BUTTON_WIRE '+JSON.stringify({id:block.id,button,width,height,frameWidth,frameHeight}),{cause:error});}layers.push({file:normal,x:button.x,y:button.y});
  }
  const file=`private/generated/gallery-overlay-${hash(JSON.stringify(layers))}.png`,args=['-size','800x600','xc:none'];for(const l of layers)args.push(l.file,'-geometry',`+${l.x}+${l.y}`,'-compose','over','-composite');await exec('magick',[...args,'-depth','8','-strip',file]);const screen=uiScreen('gallery-'+block.file.replace(/\.ks$/u,''),'gallery',block.buttons.map(v=>v.ref!),'#000000',{overlay:true});menus.set(block.id,{screen,overlay:await content.encodedImage(file),buttons:block.buttons});screens.push(screen);
 }
 const transparent='private/generated/gallery-click-3x1.png';await exec('magick',['-size','3x1','xc:none','-depth','8','-strip',transparent]);const advance=uiImageButton('gallery-advance',await content.encodedImage(transparent),{rect:{x:0,y:0,width:1280,height:720},frameWidth:1,frameHeight:1,text:'next'}),advanceScreen=uiScreen('gallery-advance','gallery',[advance],'#000000',{overlay:true});screens.push(advanceScreen);
 const macro=sourceMacros(await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8')),compiled:{id:string;code:Instruction[];stage:DoorStage;effects:DoorEffects}[]=[],phenaContexts=new Map<string,{stage:DoorStage;effects:DoorEffects}>();
 const fnName=(id:string)=>'gallery-'+id.replace(/:/gu,'-');
 for(const block of blocks.values()){
  if(!reachable.has(block.id))continue;const special=block.label==='phena_back'?phenaContexts.get(block.file):undefined;requireValue(block.label!=='phena_back'||special,'GALLERY_PHENA_CONTEXT');const stage=special?special.stage.fork():baseline.fork();stage.addressPrefix='gallery:'+block.id;stage.markUnknownAssets();const effects=special?special.effects.fork(stage):new DoorEffects(stage,locale,issues,true),audio=new SourceAudioLowerer(b,async(name)=>content.audio(name,'element'),block.id===entry?undefined:{bgm:'gallery-audio-bgm'});audio.useStableNames('gallery-audio');
  const prefix:Instruction[]=[instruction('ui.hide',{at:'gallery:'+block.id+':enter'})],menu=menus.get(block.id),firstView=block.hook&&[...menus.values()].some(m=>m.buttons.some(v=>v.target===block.id));
  if(menu||firstView){const overlay=menu?.overlay??menus.get(key(block.file,'backpoint'))!.overlay,o=stage.get('message0');stage.assetWritten(o);o.asset=overlay;o.left=o.top=0;o.width=800;o.height=600;o.visible=!!firstView;stage.get('message0','back').visible=false;}
  async function lower(t:Tag,depth=0):Promise<void>{requireValue(depth<4&&t.attributes.every(a=>a.mode==='literal'),'GALLERY_DYNAMIC_TAG');const expanded=macro(t);if(expanded){for(const e of expanded)await lower(e,depth+1);return;}if(effects.supports(t.name)){await effects.lower(t);return;}if(sourceAudioTags.has(t.name)){stage.flush();stage.code.push(...await audio.lower(t,stage.at('audio')));return;}
   switch(t.name){
    case'eval':strictArgs(t,['exp']);requireValue(literalArg(t,'exp').replace(/\s/gu,'')==='tf.fromextra=true','GALLERY_RETURN_FLAG');stage.code.push(instruction('value.set',{at:stage.at('from-extra'),dest:'original.fromextra',value:literal(bool(true))}));break;
    case'image':strictArgs(t,['storage','layer','page','visible','left','top','clipleft','cliptop','clipwidth','clipheight']);if(t.args.storage==='Phena_anime')await effects.animation(t);else await stage.image(literalArg(t,'storage'),literalArg(t,'layer'),t.args.page??'fore',t.args.visible===undefined?undefined:t.args.visible==='true',t.args.left===undefined?undefined:Number(t.args.left),t.args.top===undefined?undefined:Number(t.args.top));break;
    case'backlay':strictArgs(t,[]);stage.copy();break;
    case'layopt':{
     strictArgs(t,['layer','page','visible']);const value=literalArg(t,'visible');
     if(value==='fakse'){const native=(await nativeSource(`private/text/${locale}/system/MessageLayer.tjs`)).replace(/\s/gu,'');requireValue(locale==='jp'&&sources.has(t.source.file)&&block.label==='backpoint'&&native.includes('visible=+elm.visibleifelm.visible!==void;'),'GALLERY_VISIBLE_COERCION_PROFILE');issues.push({code:'SOURCE_VISIBLE_LITERAL_COERCED',asset:t.source.file+':'+t.source.line,behavior:'Native MessageLayer.setOptions converts visible with unary +. The original nonnumeric fakse literal becomes zero/false; retain the authored result without editing the source.'});}
     else requireValue(['true','false'].includes(value),'GALLERY_VISIBLE');stage.get(literalArg(t,'layer'),t.args.page).visible=value==='true';break;
    }
    case'position':strictArgs(t,['layer','page','left','top','width','height','marginl','margint','marginr','marginb']);requireValue(t.args.layer==='message0'&&['left','top','marginl','margint','marginr','marginb'].every(k=>t.args[k]==='0')&&t.args.width==='800'&&t.args.height==='600','GALLERY_MESSAGE_POSITION');break;
    case'current':strictArgs(t,['layer']);requireValue(t.args.layer==='message0','GALLERY_CURRENT');break;
    case'trans':{strictArgs(t,['method','time','stay','page','children','from','vague','rule']);const method=t.args.method??'crossfade',from=t.args.from;requireValue(method==='crossfade'||method==='universal'||method==='scroll'&&['left','right','top','bottom'].includes(from??''),'GALLERY_TRANSITION');await stage.transition(Number(t.args.time),method==='universal'?'rule':method==='scroll'?('scroll-'+from)as'scroll-left':'crossfade',t.args.children!=='false',t.args.rule,t.args.vague===undefined?64:Number(t.args.vague));break;}
    case'wt':strictArgs(t,['canskip']);stage.join(t.args.canskip!=='false');break;
    case'wait':{strictArgs(t,['time','canskip']);const duration=Number(t.args.time);requireValue(Number.isInteger(duration)&&duration>0&&duration<=3600000,'GALLERY_DELAY');const at=stage.at('delay');stage.code.push(instruction('wait.delay',{at,task:at+'-task',duration,skippable:t.args.canskip!=='false'}));break;}
    case'freeimage':strictArgs(t,['layer','page']);stage.clear(literalArg(t,'layer'),t.args.page);break;
    case'rclick':case'history':strictArgs(t,['enabled','output']);requireValue(t.args.enabled==='false','GALLERY_INPUT_POLICY');break;
    default:throw new Error('GALLERY_UNSUPPORTED '+t.name+' '+t.source.file+':'+t.source.line);
   }
  }
  for(const t of block.tokens){requireValue(t.kind==='tag','GALLERY_EFFECT_TOKEN');await lower(t);}stage.finish();
  // The active Phena film keeps its original page identities until its own exit.
  if(block.label==='eight'&&block.file==='picture2.ks'){stage.flush();phenaContexts.set(block.file,{stage:stage.fork(),effects:effects.fork(stage)});}else stage.canonicalizePages();
  const code=[...prefix,...stage.take()],next=(target:string,at:string)=>[instruction('value.set',{at,dest:nav.id,value:literal(string(target))}),instruction('control.return',{at:at+':return'})]as Instruction[];
  if(menu){
   const bindings=many(menu.buttons.map((v,n)=>({control:v.ref!,target:'gallery:'+block.id+':o'+n})));
   code.push(stageStyle('gallery:'+block.id+':hide-static','door:message0:a',{visible:false}),showUI('gallery:'+block.id+':show',menu.screen),instruction('state.collect',{at:'gallery:'+block.id+':collect',retainTasks:[],historyLimit:1}),waitUI('gallery:'+block.id+':wait',menu.screen,choice,bindings));
   for(const [n,v]of menu.buttons.entries())code.push(...next(v.target,'gallery:'+block.id+':o'+n));
  }
  else if(block.hook){code.push(showUI('gallery:'+block.id+':show',advanceScreen),instruction('state.collect',{at:'gallery:'+block.id+':collect',retainTasks:[],historyLimit:1}),waitUI('gallery:'+block.id+':wait',advanceScreen,choice,[{control:advance,target:'gallery:'+block.id+':next'}]),...next(block.hook,'gallery:'+block.id+':next'));}
  else code.push(...next(block.jump??block.next!,'gallery:'+block.id+':next'));
  compiled.push({id:fnName(block.id),code,stage,effects});
 }
 const retain=[...new Set(compiled.flatMap(v=>v.code.flatMap(i=>i.op==='audio.track'||i.op==='stage.sequence'||i.op==='stage.raster'||i.op==='stage.motion'?[i.task]:[])))];requireValue(retain.length<=64,'GALLERY_RETAIN_BOUND');
 for(const fn of compiled){for(const i of fn.code)if(i.op==='state.collect')i.retainTasks=retain;b.function({id:fn.id,entry:fn.code[0]!.at,layout:1,params:[],locals:[],returns:'void',code:fn.code});}
 const router:Instruction[]=[...seeds,instruction('value.set',{at:'gallery:menu-active',dest:'original.native-menu-active',value:literal(bool(true))}),instruction('save.policy',{at:'gallery:no-save',allow:false}),instruction('value.set',{at:'gallery:initialize',dest:nav.id,value:literal(string(entry))})],ids=[...reachable];
 for(const [n,id]of ids.entries())router.push(branchExpression('gallery:test'+n,expr.equal(expr.variable(nav),expr.text(id)),'gallery:call'+n,n===ids.length-1?'gallery:return':'gallery:test'+(n+1)));
 for(const [n,id]of ids.entries())router.push(instruction('control.call',{at:'gallery:call'+n,function:fnName(id),args:[]}),instruction('control.jump',{at:'gallery:again'+n,target:'gallery:test0'}));router.push(instruction('control.return',{at:'gallery:return'}));
 b.function({id:'gallery-main',entry:router[0]!.at,layout:1,params:[],locals:[],returns:'void',code:router});b.ui(uiCatalog('source-gallery','v1',screens));
 return {entry:'gallery-main',blocks:[...blocks.values()].filter(v=>reachable.has(v.id)).map(v=>({id:v.id,buttons:v.buttons.map(b=>({id:b.ref?.id,target:b.target})),hook:v.hook,jump:v.jump,next:v.next})),thumbnails:[...menus.values()].reduce((n,m)=>n+m.buttons.filter(v=>!['next','back','title'].includes(v.target.split(':').at(-1)!)).length,0),hooks:[...knownScripts].filter(id=>reachable.has(id)).length,returnModes:[...blocks.values()].filter(v=>reachable.has(v.id)&&v.label==='title').map(v=>({id:v.id,fromExtra:v.tokens.some(t=>t.kind==='tag'&&t.name==='eval')})),issues};
}
function many<T>(values:readonly T[]):[T,...T[]]{const[first,...rest]=values;requireValue(first!==undefined,'GALLERY_EMPTY_BUTTONS');return [first,...rest];}
