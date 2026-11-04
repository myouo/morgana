import {expressionWire,expr,instruction} from 'galbox-sdk/port-kit';
import type {ModuleHeader,ProgramModule,UIScreen} from 'galbox-sdk/protocol';
import {canonicalWireJSON} from 'galbox-sdk/protocol';
import {requireValue} from './kag.js';

/** Pool mutually exclusive bitmap menus with standard UI visibility operations.
 * IDs, hitboxes, sounds and callbacks remain unchanged; no runtime UI adapter. */
export function poolBitmapUI(header:ModuleHeader,files:readonly {body:ProgramModule}[],groups:readonly {id:string;prefix:string}[]){
 const ui=header.ui;requireValue(ui,'BITMAP_UI_CATALOG');const aliases=new Map<string,{screen:UIScreen;visible:string[]}>(),screens=[...ui.screens];
 for(const group of groups){
  const members=screens.filter(s=>s.id.startsWith(group.prefix));if(members.length<2)continue;
  requireValue(members.every(s=>s.overlay===true&&s.background===members[0]!.background),'BITMAP_UI_OVERLAY');const byId=new Map();for(const c of members.flatMap(s=>s.controls)){const old=byId.get(c.id);requireValue(!old||canonicalWireJSON(old)===canonicalWireJSON(c),'BITMAP_UI_CONTROL_ID');byId.set(c.id,c);}const controls=[...byId.values()]as UIScreen['controls'];requireValue(controls.length<=64&&controls.every(c=>c.kind==='button'&&c.graphic),'BITMAP_UI_CONTROLS');
  const pooled:UIScreen={id:group.id,title:'',background:members[0]!.background,overlay:true,controls:nonempty(controls.map(c=>({...c,visible:false})))};
  for(const member of members)aliases.set(member.id,{screen:pooled,visible:member.controls.filter(c=>c.visible).map(c=>c.id)});
  const first=screens.findIndex(s=>s.id===members[0]!.id);for(let n=screens.length-1;n>=0;n--)if(members.some(s=>s.id===screens[n]!.id))screens.splice(n,1);screens.splice(first,0,pooled);
 }
 for(const file of files)for(const fn of file.body.functions){const code=[];for(const original of fn.code){
  if('screen'in original&&typeof original.screen==='string'&&aliases.has(original.screen)){
   const alias=aliases.get(original.screen)!;code.push({...original,screen:alias.screen.id});
   if(original.op==='ui.show')for(const [n,id]of alias.visible.entries())code.push(instruction('ui.visible',{at:original.at+':pool'+n,screen:alias.screen.id,control:id,value:expressionWire(expr.flag(true))}));
  }else code.push(original);
 }fn.code=code;}
 const[first,...rest]=screens;requireValue(first&&screens.length<=16,'BITMAP_UI_SCREEN_BUDGET '+screens.length);ui.screens=[first,...rest];
 return [...aliases].map(([from,{screen}])=>({from,to:screen.id}));
}

function nonempty<T>(rows:readonly T[]):[T,...T[]]{const[first,...rest]=rows;requireValue(first!==undefined,'BITMAP_UI_EMPTY');return [first,...rest];}
