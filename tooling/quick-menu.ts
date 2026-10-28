import {requireValue} from './kag.js';
export const quickActions=['settings','history','save','load','skip','auto','hideText'] as const;
export type QuickAction=typeof quickActions[number];
const handlers=['config','history','save','load','skip','auto','erase'];
/** Source-owned fixed quick-menu profile. TJS is inspected, never executed. */
export function readQuickMenu(source:string){
 const begin=source.indexOf('function makeQExecMenu('),end=source.indexOf('function showQExecMenu(',begin);requireValue(begin>=0&&end>begin,'QUICK_MENU_FUNCTION');
 const code=source.slice(begin,end).replace(/\/\*[\s\S]*?\*\//gu,'').replace(/\/\/[^\r\n]*/gu,'');
 const blocks=[...code.matchAll(/qtxtElm\.graphic\s*=\s*"([^"]+)";([\s\S]*?)destlayer\.addButton\(qtxtElm\)/gu)];requireValue(blocks.length===7,'QUICK_MENU_COUNT');
 const buttons=blocks.map(([_,graphic,body],i)=>{const handler=/qtxtElm\.exp\s*=\s*"kag\.([a-z]+)QExecMenuClick\(\)"/u.exec(body??'')?.[1],pos=/destlayer\.locate\((\d+),(\d+)\)/u.exec(body??'');requireValue(handler===handlers[i]&&pos&&graphic===`qmenu_exec0${i+1}`,'QUICK_MENU_SOURCE');const action=quickActions[i];requireValue(action,'QUICK_MENU_ACTION');return {action,graphic,x:Number(pos[1]),y:Number(pos[2])};});
 const zone=/if\s*\(x\s*>\s*(\d+)\s*&&\s*x\s*<\s*(\d+)\s*&&\s*y\s*>\s*(\d+)\s*&&\s*y\s*<\s*(\d+)\)\s*showQExecMenu\('scroll'\)/u.exec(source);requireValue(zone,'QUICK_MENU_HOVER');const [x,right,y,bottom]=zone.slice(1).map(Number);requireValue(x!==undefined&&right!==undefined&&y!==undefined&&bottom!==undefined&&x>=0&&right<=800&&y>=0&&bottom<=600,'QUICK_MENU_BOUNDS');return {buttons,zone:{x,y,width:right-x,height:bottom-y}};
}
