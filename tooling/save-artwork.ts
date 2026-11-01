import {readFile} from 'node:fs/promises';
import {requireValue} from './kag.js';
import type {Language} from './locale.js';

/** Finite UI data from the shipped plugin; never evaluate its TJS. */
export async function saveArtwork(locale:Language,asset:(name:string)=>Promise<string>){
 const raw=await readFile(`private/text/${locale}/scenario/saveload.ks`,'utf8'),source=raw.replace(/\/\*[\s\S]*?\*\//gu,'').replace(/\/\/[^\n]*/gu,''),system=await readFile(`private/text/${locale}/scenario/system_define.ks`,'utf8');
 const pageSource=source.slice(source.indexOf('function makePageButtons()'),source.indexOf('function changePage(')),pageCount=Number(/for\s*\(\s*var\s+i\s*=\s*0\s*;\s*i\s*<\s*(\d+)\s*;/u.exec(pageSource)?.[1]);requireValue([10,11].includes(pageCount)&&/for\s*\(\s*var\s+i\s*=\s*0\s*;\s*i\s*<\s*4\s*;\s*i\+\+\s*\)/u.test(source),'SAVE_PAGE_PROFILE');
 requireValue(/obj\.setPos\(200,\s*25\s*\+\s*(?:i|entry)\s*\*\s*125\)/u.test(source)&&source.includes('setImageSize(400, 100)'),'SAVE_CARD_PROFILE');
 requireValue(pageCount===10||/sf\.autosave_count\s*=\s*4;/u.test(system)&&source.includes('sf.saveload_page == 10 ? 100 + i : sf.saveload_page * 4 + i'),'SAVE_SLOT_PROFILE');const compact=pageSource.replace(/\s/gu,''),pageX=compact.includes('obj.left=i*30+(400-30*5)')?250:compact.includes('obj.left=235+(i*30)')?235:NaN;requireValue(Number.isFinite(pageX),'SAVE_PAGE_POSITION');
 const position=(name:string)=>{const coordinate=(axis:string)=>{const value=Number(new RegExp(name+'\\.'+axis+'\\s*=\\s*(\\d+)').exec(source)?.[1]);requireValue(Number.isInteger(value)&&value>=0&&value<=400,'SAVE_CONTROL_PROFILE '+name+'.'+axis);return value;};return {x:coordinate('left'),y:coordinate('top')};};const deletePosition=position('deleteButton'),lockPosition=position('protectButton');
 const modes=source.slice(source.indexOf('function makeLoadMenu()'),source.indexOf('function makeDeleteMenu()'));requireValue(modes&&!/^[\t ]*makeAskButton\(\);/mu.test(modes),'SAVE_CONFIRM_CONTROL_CHANGED');
 const numberMatch=/drawText\((\d+),\s*(\d+),\s*str,\s*0\)/u.exec(source),numberPosition=numberMatch?{x:Number(numberMatch[1]),y:Number(numberMatch[2])}:undefined;
 const recent=[...source.matchAll(/drawText\((\d+),\s*(\d+),\s*"([^"]+)",\s*0xff0000\)/gu)].map(m=>({x:Number(m[1]),y:Number(m[2]),text:m[3]!}));requireValue(recent.length>=2&&recent.length<=3,'SAVE_RECENT_LABELS');
 const sheet=async(name:string)=>{const graphic=await asset(name),bytes=await readFile('public/'+graphic),width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);requireValue(width%4===0,'SAVE_BUTTON_SHEET '+name);return {graphic,width:width/4,height};};
 return {pageX,...(numberPosition?{numberPosition}:{}),deletePosition,lockPosition,manualSlots:40,autoSlots:4,perPage:4,fontSize:12,recent:recent[0]!,recentAuto:recent[1]!,...(recent[2]?{oldestAuto:recent[2]}:{}),emptyDate:' ----/--/-- --:--',dummy:await asset('dummy'),delete:await sheet('saveload_delate'),lock:await sheet('saveload_lock'),locked:await sheet('saveload_lock2'),pages:await Promise.all(Array.from({length:pageCount},async(_,i)=>{const name='saveload_page'+String(i+1).padStart(2,'0');return {normal:await sheet(name+'f'),selected:await sheet(name+'fon')};})),back:await sheet('saveload_menu00f')};
}
