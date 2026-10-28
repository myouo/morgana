import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {encodeWire} from 'galbox-sdk/wire';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {tokenize,requireValue} from './kag.js';
import {readTitlePresentation} from './title.js';
export async function appearance(locale:Language,mode:'fresh'|'unlocked'='fresh'){
 const config=await readFile(`private/text/${locale}/system/Config.tjs`,'utf8');
 // Select the fresh-profile title block, not an unlocked/ending title variant.
 const raw=await readFile(`private/text/${locale}/scenario/title.ks`,'utf8'),lines=raw.split(/\r?\n/u),begin=lines.findIndex(l=>l.trim()===(mode==='fresh'?'*title_main':'*title_main_end')),end=lines.findIndex((l,i)=>i>begin&&l.trim()==='[s]');requireValue(begin>=0&&end>begin,'TITLE_MAIN');
 const tokens=tokenize(lines.slice(begin+1,end).join('\n'),'title.ks',begin+1),images=tokens.filter(t=>t.kind==='tag'&&t.name==='image'),base=images.find(t=>t.kind==='tag'&&t.args.layer==='base'),menu=images.find(t=>t.kind==='tag'&&t.args.layer==='1');requireValue(base?.kind==='tag'&&menu?.kind==='tag'&&base.args.storage&&menu.args.storage,'TITLE_IMAGES');
 const marginL=Number(/;marginL\s*=\s*(\d+)/u.exec(config)?.[1]),marginT=Number(/;marginT\s*=\s*(\d+)/u.exec(config)?.[1]);requireValue(Number.isFinite(marginL)&&Number.isFinite(marginT),'TITLE_MARGINS');
 const asset=async(name:string,folder:string)=>{const candidates=[`${folder}/${name}.png`,`${folder}/${name}.jpg`];let source:string|undefined;for(const group of [locale,'shared'])for(const candidate of candidates){const p=`private/extracted/${group}/${candidate}`;if(!source&&existsSync(p))source=p;}requireValue(source,`ASSET_MISSING ${name}`);const bytes=await readFile(source),file=`assets/${hash(bytes).slice(0,20)}${path.extname(source)}`;await copyFile(source,'public/'+file);return file;};
 const buttons=[];let x=0,y=0;for(const t of tokens){if(t.kind!=='tag')continue;if(t.name==='locate'){x=Number(t.args.x)+marginL;y=Number(t.args.y)+marginT;}if(t.name==='button'){const targets:Record<string,string>={'*scenario':'start','*load_menu':'load','*config_menu':'config','*homepage':'homepage','*end':'exit','*extra':'extra'};const action=targets[t.args.target??''];requireValue(action,'TITLE_TARGET');buttons.push({action,enterSE:t.args.enterse??null,clickSE:t.args.clickse??null,x,y,width:155,height:30,hint:t.args.hint??'',graphic:await asset(t.args.graphic??'','image')});}}
 const windowTitle=tokens.find(t=>t.kind==='tag'&&t.name==='title');requireValue(windowTitle?.kind==='tag'&&windowTitle.args.name,'TITLE_CAPTION');const data={windowTitle:windowTitle.args.name,background:await asset(base.args.storage,'bgimage'),menu:await asset(menu.args.storage,'bgimage'),menuTop:Number(menu.args.top??0),buttons};await writeFile(`public/programs/${locale}.title.pb`,encodeWire('JsonValue',data));
 const fontSize=Number(/;defaultFontSize\s*=\s*(\d+)/u.exec(config)?.[1]),lineSpacing=Number(/;defaultLineSpacing\s*=\s*(\d+)/u.exec(config)?.[1]),face=/;defaultFace\s*=\s*"([^"\n]+)"/u.exec(config)?.[1]??'pre-rendered';requireValue(fontSize>0&&lineSpacing>=0,'FONT_CONFIG');
 const macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'),centerY=macro.includes('[macro name=draw_name]')?420+42:420+2*(fontSize+lineSpacing);
 const presentation=readTitlePresentation(raw);
 return {presentation,windowTitle:windowTitle.args.name,fontSize,lineSpacing,face,centerY,sourceTitle:{begin:begin+1,end:end+1,marginL,marginT},data};
}
