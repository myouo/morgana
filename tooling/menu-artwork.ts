import {readFile,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {requireValue,tokenize} from './kag.js';
import {readQuickMenu} from './quick-menu.js';
/** Source UI definitions are read as data. Never execute the embedded TJS. */
export async function menuArtwork(locale:Language){
 const asset=async(name:string,folders=['image','bgimage'])=>{for(const group of [locale,'shared'])for(const folder of folders){const file=`private/extracted/${group}/${folder}/${name}.png`;if(existsSync(file)){const bytes=await readFile(file),target=`assets/${hash(bytes).slice(0,20)}.png`;await writeFile('public/'+target,bytes);return target;}}throw new Error('MENU_ASSET '+name);};
 const quickSource=readQuickMenu(await readFile(`private/text/${locale}/system/MainWindow.tjs`,'utf8'));
 const quick={zone:quickSource.zone,buttons:await Promise.all(quickSource.buttons.map(async b=>{const graphic=await asset(b.graphic),bytes=await readFile('public/'+graphic);requireValue(bytes.subarray(1,4).toString()==='PNG'&&bytes.readUInt32BE(16)%3===0,'QUICK_MENU_IMAGE');return {...b,graphic,width:bytes.readUInt32BE(16)/3,height:bytes.readUInt32BE(20)};}))};
 const config=await readFile(`private/text/${locale}/scenario/config.ks`,'utf8'),settings=config.split(/\r?\n\*config_ch_non_stop/u)[0]??'',tags=tokenize(settings,'config.ks').filter(t=>t.kind==='tag');
 const sliders=tags.filter(t=>t.name==='slider_create');for(const [name,top]of [['chspeed','320'],['ch2speed','380'],['pagewait','435'],['bgmvolume','505'],['sevolume','550']])requireValue(sliders.some(t=>t.args.name===name&&t.args.left==='255'&&t.args.top===top),'MENU_SLIDER_LAYOUT '+name);
 const source=await readFile(`private/text/${locale}/scenario/saveload.ks`,'utf8');requireValue(/obj\.setPos\(200,\s*25\s*\+\s*(?:i|entry)\s*\*\s*125\)/u.test(source),'MENU_SAVE_LAYOUT');
 const rawTitle=await readFile(`private/text/${locale}/scenario/title.ks`,'utf8'),website=/System\.shellExecute\(\s*'([^']+)'\s*\)/u.exec(rawTitle)?.[1]??null;if(website){const u=new URL(website);requireValue(['http:','https:'].includes(u.protocol)&&u.hostname==='novect.net','MENU_HOMEPAGE_URL');}
 const override=await readFile(`private/text/${locale}/system/Override.tjs`,'utf8');
 const assigned=(source:string,key:string)=>new RegExp('^;'+key+'\\s*=\\s*([^;]+);','mu').exec(source)?.[1]?.trim();
 const historySource=override.slice(override.indexOf('function ExtendedHistoryLayer_config()'));
 requireValue(assigned(historySource,'backgroundStorage')==='"massageback.png"'&&assigned(historySource,'closeButtonStorage')==='"reclose"','HISTORY_SOURCE_ART');
 const conf=await readFile(`private/text/${locale}/system/Config.tjs`,'utf8'),normal=Number(/;chSpeeds\.normal\s*=\s*(\d+)/u.exec(conf)?.[1]),auto=Number(/;autoModePageWaits\.medium\s*=\s*(\d+)/u.exec(conf)?.[1]);requireValue(normal>=0&&normal<=200&&auto>=0&&auto<=60000,'MENU_DEFAULTS');
 const speedMax=Number(/;chSpeeds\.slow\s*=\s*(\d+)/u.exec(conf)?.[1]),autoMin=Number(/;autoModePageWaits\.fast\s*=\s*(\d+)/u.exec(conf)?.[1]),autoSlider=sliders.find(t=>t.args.name==='pagewait');requireValue(speedMax>0&&speedMax<=200&&autoMin>=0&&autoMin<=60000&&autoSlider,'MENU_SOURCE_RANGES');const autoMax=autoSlider.args.max==='&kag.autoModePageWaits.slow'?Number(/;autoModePageWaits\.slow\s*=\s*(\d+)/u.exec(conf)?.[1]):Number(autoSlider.args.max);requireValue(Number.isInteger(autoMax)&&autoMax>=autoMin&&autoMax<=60000,'MENU_AUTO_RANGE');
 const positions=new Map<string,{x:number;y:number}>();let cursor={x:0,y:0};for(const t of tags){if(t.name==='locate'&&t.args.x!==undefined&&t.args.y!==undefined)cursor={x:Number(t.args.x),y:Number(t.args.y)};if(t.name==='button')positions.set(t.args.target??'',{...cursor});}
 const button=(target:string)=>{const v=positions.get(target);requireValue(v&&Number.isInteger(v.x)&&v.x>=0&&v.x<=697&&v.y===200,'MENU_CONFIG_BUTTON '+target);return v;};
 const checkboxBase=await asset('opt_checkbox_base'),checkboxCheck=await asset('opt_checkbox_check'),box=await readFile('public/'+checkboxBase),box2=await readFile('public/'+checkboxCheck);requireValue(box.readUInt32BE(16)%3===0&&box.readUInt32BE(16)===box2.readUInt32BE(16)&&box.readUInt32BE(20)===box2.readUInt32BE(20),'MENU_CHECKBOX');
 const configLayout={textMax:speedMax,autoMin,autoMax,textUnit:sliders.find(t=>t.args.name==='chspeed')?.args.unit??' ms / char',autoUnit:autoSlider.args.unit??' ms',buttons:{resume:button('*config_return'),reset:button('*config_default'),title:button('*config_title')},checkbox:{base:checkboxBase,checked:checkboxCheck,width:box.readUInt32BE(16)/3,height:box.readUInt32BE(20)}};
 const historyConfig=conf.slice(conf.indexOf('function HistoryLayer_config()'));
 const fixed=(source:string,key:string,max:number)=>{const value=Number(assigned(source,key));requireValue(Number.isInteger(value)&&value>=0&&value<=max,'HISTORY_SOURCE_LAYOUT '+key);return value;};
 const historyLayer=await readFile(`private/text/${locale}/system/HistoryLayer.tjs`,'utf8'),controlHeight=Number(/var controlHeight\s*=\s*(\d+)/u.exec(historyLayer)?.[1]);requireValue(Number.isInteger(controlHeight)&&controlHeight>=0&&controlHeight<=64,'HISTORY_CONTROL_HEIGHT');
 const historyLayout={left:fixed(historyConfig,'marginL',200),right:fixed(historyConfig,'marginR',400),top:fixed(historyConfig,'marginT',200)+controlHeight,bottom:fixed(historyConfig,'marginB',200),fontSize:fixed(historyConfig,'fontHeight',40),lineHeight:fixed(historyConfig,'lineHeight',60),closeX:fixed(historySource,'closeButtonLeft',760),closeY:fixed(historySource,'closeButtonTop',567)};
 requireValue(assigned(historyConfig,'verticalView')==='false'&&assigned(historyConfig,'everypage')==='false','HISTORY_SOURCE_PROFILE');
 return {configLayout,quick,save:await asset('saveload_back_save'),history:await asset('massageback'),historyClose:await asset('reclose'),historyLayout,settings:await asset('opt_base'),load:await asset('saveload_back_load'),card:await asset('saveload_itembase'),back:await asset('saveload_menu00f'),reset:await asset('opt_bt_default'),resume:await asset('opt_bt_return'),title:await asset('opt_bt_title'),slider:await asset('opt_slider_base'),pin:await asset('opt_slider_pin'),website,defaults:{intervalMs:normal,autoDelayMs:auto}};
}
