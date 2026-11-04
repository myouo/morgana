import {readFile,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {instruction,branchExpression,expr,literal,variable,uiImageButton,uiScreen,uiCatalog,showUI,waitUI,uiSound} from 'galbox-sdk/port-kit';
import type {ProgramBuilder,UIScreenRef,UIControlRef} from 'galbox-sdk/port-kit';
import {bool,string,i32} from 'galbox-sdk/protocol';
import type {Instruction} from 'galbox-sdk/protocol';
import {Content} from './content.js';
import {DoorStage} from './door-stage.js';
import {SourceAudioLowerer,sourceAudioTags} from './lower-audio.js';
import {sourceMacros,validateMacroLibraryReload} from './source-macros.js';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {tokenize,requireValue,strictArgs,literalArg} from './kag.js';
import type {Tag,Token} from './kag.js';
import {poolBitmapUI} from './pool-bitmap-ui.js';

const exec=promisify(execFile);
type Button={graphic:string;target:string;x:number;y:number;enter?:string;click?:string;ref?:UIControlRef<'button'>};
type Block={id:string;file:string;label:string;tokens:Tag[];next:string|null;target:string|null;buttons:Button[];screen?:UIScreenRef};
function many<T>(a:readonly T[]):[T,...T[]]{const[first,...rest]=a;requireValue(first!==undefined,'MUSIC_EMPTY');return [first,...rest];}

/** Compile the original bitmap music lists, playing waits and lyric files. */
export async function lowerMusic(b:ProgramBuilder,content:Content,locale:Language){
 const pending=['music.ks','music2.ks','music3.ks'],seenFiles=new Set<string>(),blocks=new Map<string,Block>(),issues:{code:string;asset:string;behavior:string}[]=[],key=(file:string,label:string)=>file.replace(/\.ks$/u,'')+':'+label;
 const macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'),expand=sourceMacros(macro),config=await readFile(`private/text/${locale}/system/Config.tjs`,'utf8'),marginL=Number(/;marginL\s*=\s*(\d+)/u.exec(config)?.[1]),marginT=Number(/;marginT\s*=\s*(\d+)/u.exec(config)?.[1]);requireValue(Number.isFinite(marginL)&&Number.isFinite(marginT),'MUSIC_MARGINS');
 for(const file of pending){if(seenFiles.has(file))continue;requireValue(/^[a-zA-Z0-9_-]+\.ks$/u.test(file),'MUSIC_STORAGE');seenFiles.add(file);const tokens=tokenize(await readFile(`private/text/${locale}/others/${file}`,'utf8'),file);let current:Block|undefined;for(const t of tokens){
  if(t.kind==='label'){const id=key(file,t.name);requireValue(!blocks.has(id),'MUSIC_DUPLICATE_LABEL');if(current)current.next=id;current={id,file,label:t.name,tokens:[],next:null,target:null,buttons:[]};blocks.set(id,current);continue;}
  requireValue(current&&(t.kind==='tag'||t.kind==='text'&&!t.text.trim()),'MUSIC_NON_TAG_SOURCE');if(t.kind!=='tag')continue;current.tokens.push(t);if(['button','jump','call'].includes(t.name)&&t.args.storage&&!['title.ks','macro.ks'].includes(t.args.storage))pending.push(t.args.storage);
 }}
 for(const block of blocks.values()){
  const output:Tag[]=[];let x=0,y=0;
  for(const t of block.tokens){
   if(t.name==='locate'){strictArgs(t,['x','y']);x=Number(t.args.x)+marginL;y=Number(t.args.y)+marginT;continue;}
   if(t.name==='button'){strictArgs(t,['graphic','target','storage','enterse','clickse']);requireValue(t.args.target?.startsWith('*')&&[x,y].every(Number.isFinite),'MUSIC_BUTTON');block.buttons.push({graphic:literalArg(t,'graphic'),target:key(t.args.storage??block.file,literalArg(t,'target').slice(1)),x,y,...(t.args.enterse?{enter:t.args.enterse}:{}),...(t.args.clickse?{click:t.args.clickse}:{})});continue;}
   if(t.name==='jump'||t.name==='call'&&t.args.storage!=='macro.ks'){strictArgs(t,['storage','target']);requireValue(!block.target,'MUSIC_MULTIPLE_JUMPS');block.target=t.args.storage==='title.ks'?'title':key(t.args.storage??block.file,t.args.target?.replace(/^\*/u,'')??'music_main');if(t.name==='call')issues.push({code:'SOURCE_MUSIC_TAIL_CALL',asset:block.id,behavior:'The source call is the final reachable operation in its lyric-return block, and music exits only by jumping to title. Lower the finite return edge as a standard Program router jump without accumulating unreachable call continuations.'});continue;}
   if(t.name==='s'){strictArgs(t,[]);continue;}output.push(t);
  }
  block.tokens=output;
 }
 const screens:UIScreenRef[]=[],buttonCache=new Map<string,UIControlRef<'button'>>(),screenCache=new Map<string,UIScreenRef>();
 for(const block of blocks.values())if(block.buttons.length){
  for(const button of block.buttons){
   const source=content.sourceButtonImage(button.graphic),bytes=await readFile(source),dimensions=(await exec('magick',['identify','-format','%w %h',source])).stdout.trim().split(' ').map(Number),frameWidth=Math.floor(dimensions[0]!/3),frameHeight=dimensions[1]!,left=Math.max(0,-button.x),top=Math.max(0,-button.y),width=Math.min(frameWidth-left,800-Math.max(0,button.x)),height=Math.min(frameHeight-top,600-Math.max(0,button.y));requireValue(width>0&&height>0,'MUSIC_BUTTON_BOUNDS');const shape=JSON.stringify([hash(bytes),button.x,button.y,width,height,button.enter,button.click]);let ref=buttonCache.get(shape);
   if(!ref){const file=`private/generated/music-button-${hash(shape)}.png`;if(!existsSync(file)){const args:string[]=[];for(const frame of [0,2,1])args.push('(',source,'-crop',`${width}x${height}+${frame*frameWidth+left}+${top}`,'+repage',')');await exec('magick',[...args,'+append','-depth','8','-strip',file]);}ref=uiImageButton('music-control-'+buttonCache.size,await content.encodedImage(file),{rect:{x:Math.max(0,button.x)*1.6,y:Math.max(0,button.y)*1.2,width:Math.min(width*1.6,1280-Math.max(0,button.x)*1.6),height:Math.min(height*1.2,720-Math.max(0,button.y)*1.2)},frameWidth:width,frameHeight:height,text:'select',...(button.enter?{enterSound:uiSound(await content.audio(button.enter,'buffer'))}:{}),...(button.click?{clickSound:uiSound(await content.audio(button.click,'buffer'))}:{})});buttonCache.set(shape,ref);}button.ref=ref;
  }
  const shape=JSON.stringify(block.buttons.map(v=>v.ref!.id));let screen=screenCache.get(shape);if(!screen){screen=uiScreen('music-screen'+screenCache.size,'music',block.buttons.map(v=>v.ref!),'#000000',{overlay:true});screenCache.set(shape,screen);screens.push(screen);}block.screen=screen;
 }
 const clickFile='private/generated/music-click-3x1.png';if(!existsSync(clickFile))await exec('magick',['-size','3x1','xc:none','-depth','8','-strip',clickFile]);const advance=uiImageButton('music-advance',await content.encodedImage(clickFile),{rect:{x:0,y:0,width:1280,height:720},frameWidth:1,frameHeight:1,text:'return'}),advanceScreen=uiScreen('music-advance','music',[advance],'#000000',{overlay:true});screens.push(advanceScreen);
 const blank=await content.solid('transparent'),white=await content.solid('white'),baseline=new DoorStage(b,content,blank,white,true);baseline.addressPrefix='music-seed';baseline.flush();const seed=baseline.take(),nav=variable('original.music-next','string'),choice=variable('original.music-control','string');
 b.global({id:nav.id,kind:'string',initial:string('music:music_main:v0')}).global({id:choice.id,kind:'string',initial:string('')}).global({id:'original.native-menu-active',kind:'bool',initial:bool(false)}).global({id:'original.fromextra',kind:'bool',initial:bool(false)}).global({id:'original.rclickmode',kind:'i32',initial:i32(0)});
 const work=[{id:'music:music_main',visible:false}],compiled=new Map<string,Instruction[]>(),states:{id:string;block:string;visible:boolean;buttons:{id:string;target:string}[];playing:boolean;track?:string;target?:string}[]=[],stateKey=(id:string,visible:boolean)=>id+':v'+Number(visible);
 for(const item of work){const id=stateKey(item.id,item.visible);if(compiled.has(id))continue;const block=blocks.get(item.id)!;requireValue(block,'MUSIC_TARGET '+item.id);const stage=baseline.fork();stage.addressPrefix='music:'+id;stage.get('1').visible=stage.get('1','back').visible=item.visible;stage.markUnknownAssets();const audio=new SourceAudioLowerer(b,async(name)=>content.audio(name,'element'),{bgm:'music-audio-bgm'});audio.useStableNames('music-audio');const code:Instruction[]=[instruction('ui.hide',{at:'music:'+id+':enter'})];let playing=false,track:string|undefined;
  const go=(target:string,visible:boolean,at:string)=>{if(target!=='title')work.push({id:target,visible});code.push(instruction('value.set',{at,dest:nav.id,value:literal(string(target==='title'?'title':stateKey(target,visible)))}),instruction('control.return',{at:at+':return'}));};
  async function lower(t:Tag,depth=0):Promise<void>{requireValue(depth<4&&t.attributes.every(a=>a.mode==='literal'),'MUSIC_DYNAMIC_TAG');const expanded=expand(t);if(expanded){for(const x of expanded)await lower(x,depth+1);return;}if(sourceAudioTags.has(t.name)){stage.flush();code.push(...stage.take(),...await audio.lower(t,stage.at('audio')));if(t.name==='playbgm')track=literalArg(t,'storage');return;}
   switch(t.name){
    case'image':strictArgs(t,['storage','layer','page','visible','left','top']);await stage.image(literalArg(t,'storage'),literalArg(t,'layer'),t.args.page??'fore',t.args.visible===undefined?undefined:t.args.visible==='true',t.args.left===undefined?undefined:Number(t.args.left),t.args.top===undefined?undefined:Number(t.args.top));break;
    case'trans':strictArgs(t,['method','time','stay','page','children']);requireValue(t.args.method==='crossfade','MUSIC_TRANSITION');await stage.transition(Number(t.args.time),'crossfade',t.args.children!=='false');break;
    case'wt':strictArgs(t,['canskip']);stage.join(t.args.canskip!=='false');break;
    case'wait':{strictArgs(t,['time','canskip']);stage.flush();const at=stage.at('wait');code.push(...stage.take(),instruction('wait.delay',{at,task:at,duration:Number(t.args.time),skippable:t.args.canskip!=='false'}));break;}
    case'p':{strictArgs(t,[]);requireValue(!playing&&!block.buttons.length,'MUSIC_PLAYING_WAIT');stage.finish();code.push(...stage.take(),showUI('music:'+id+':playing',advanceScreen),waitUI('music:'+id+':wait',advanceScreen,choice,[{control:advance,target:'music:'+id+':stop'}]),instruction('ui.hide',{at:'music:'+id+':stop'}));playing=true;break;}
    case'position':strictArgs(t,['layer','page','width','height','color','opacity','visible']);requireValue(t.args.layer==='message1'&&t.args.width==='800'&&t.args.height==='600'&&t.args.opacity==='0','MUSIC_MESSAGE_POSITION');break;
    case'current':strictArgs(t,['layer']);requireValue(t.args.layer==='message1','MUSIC_CURRENT');break;
    case'cm':case'ct':case'er':strictArgs(t,[]);break;
    case'history':case'rclick':case'textfade':strictArgs(t,['enabled','output']);requireValue(t.args.enabled==='false','MUSIC_POLICY');break;
    case'clickskip':strictArgs(t,['enabled']);requireValue(t.args.enabled==='true','MUSIC_CLICK_SKIP');break;
    case'eval':{strictArgs(t,['exp']);const exp=literalArg(t,'exp').replace(/\s/gu,'');if(/^sf\.showpagebreak=[01]$/u.test(exp))code.push(instruction('profile.set',{at:stage.at('pagebreak'),key:'original.showpagebreak',value:i32(Number(exp.at(-1)))}));else if(exp==='f.rclickmode=1')code.push(instruction('value.set',{at:stage.at('rclick'),dest:'original.rclickmode',value:literal(i32(1))}));else if(exp==='tf.fromextra=true')code.push(instruction('value.set',{at:stage.at('from-extra'),dest:'original.fromextra',value:literal(bool(true))}));else throw new Error('MUSIC_EVAL '+exp);break;}
    case'call':{strictArgs(t,['storage','target']);requireValue(t.args.storage==='macro.ks'&&t.args.target==='*start','MUSIC_LIBRARY_CALL');validateMacroLibraryReload(macro);issues.push({code:'SOURCE_MACRO_LIBRARY_RELOAD',asset:block.id,behavior:'Validate the native fixed defaults and helper definitions as data. Bitmap-only music screens do not execute TJS or use text drawing helpers.'});break;}
    default:throw new Error('MUSIC_UNSUPPORTED '+t.name+' '+t.source.file+':'+t.source.line);
   }
  }
  for(const t of block.tokens){await lower(t);}stage.finish();stage.canonicalizePages();code.push(...stage.take());const visible=stage.get('1').visible;
  if(block.screen){code.push(showUI('music:'+id+':show',block.screen),instruction('state.collect',{at:'music:'+id+':collect',retainTasks:['music-audio-bgm'],historyLimit:1}),waitUI('music:'+id+':wait',block.screen,choice,many(block.buttons.map((v,n)=>({control:v.ref!,target:'music:'+id+':o'+n})))));for(const [n,button]of block.buttons.entries())go(button.target,visible,'music:'+id+':o'+n);}
  else go(block.target??block.next!,visible,'music:'+id+':next');
  compiled.set(id,code);states.push({id,block:block.id,visible:item.visible,buttons:block.buttons.map(v=>({id:v.ref!.id,target:stateKey(v.target,visible)})),playing,...(track?{track}:{}),...(block.target?{target:block.target}:{})});
 }
 for(const [id,code]of compiled)b.function({id:'music-'+id,entry:code[0]!.at,layout:1,params:[],locals:[],returns:'void',code});
 const code:Instruction[]=[...seed,instruction('value.set',{at:'music:active',dest:'original.native-menu-active',value:literal(bool(true))}),instruction('save.policy',{at:'music:no-save',allow:false}),instruction('value.set',{at:'music:initialize',dest:nav.id,value:literal(string('music:music_main:v0'))})],ids=[...compiled.keys()];for(const [n,id]of ids.entries())code.push(branchExpression('music:test'+n,expr.equal(expr.variable(nav),expr.text(id)),'music:call'+n,n===ids.length-1?'music:return':'music:test'+(n+1)));for(const [n,id]of ids.entries())code.push(instruction('control.call',{at:'music:call'+n,function:'music-'+id,args:[]}),instruction('control.jump',{at:'music:again'+n,target:'music:test0'}));code.push(instruction('control.return',{at:'music:return'}));b.function({id:'music-main',entry:code[0]!.at,layout:1,params:[],locals:[],returns:'void',code});
 b.ui(uiCatalog('source-music','v1',screens));const parts=b.parts({compositionVersion:3}),aliases=poolBitmapUI(parts.header,parts.files,[{id:'music-pooled',prefix:'music-'}]);
 return {entry:'music-main',parts,files:[...seenFiles],states,aliases,tracks:states.filter(s=>s.track).map(s=>({id:s.id,storage:s.track!,playing:s.playing})),issues};
}
