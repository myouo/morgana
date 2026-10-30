import {createDomTextRenderer} from 'galbox-sdk/player';
import {createCore} from 'galbox-sdk/core';
import {decodeWire} from 'galbox-sdk/wire';
import type {Program} from 'galbox-sdk/protocol';
import '../../src/style.css';

/** Geometry-only fixture: standard Core pages, no original scenario execution. */
export async function auditText(program:Program,width=800,fontScale=1){
 const mount=document.createElement('div');mount.className='fit-probe';const style=document.createElement('style');style.textContent='.fit-probe .galbox-speaker{display:none}';mount.append(style);mount.style.cssText=`position:relative;width:${width}px;height:${width*.75}px`;document.body.append(mount);
 const fonts=new Map<string,FontFace>();let renderer:ReturnType<typeof createDomTextRenderer>|undefined;
 try{
  for(const asset of program.assets){if(asset.kind!=='font')throw new Error('FIT_ONLY_FONTS');const response=await fetch('/'+asset.path);if(!response.ok)throw new Error('FIT_FONT_HTTP');const bytes=await response.arrayBuffer(),digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');if(digest!==asset.sha256)throw new Error('FIT_FONT_DIGEST');const face=new FontFace('fit-'+asset.id,bytes);await face.load();document.fonts.add(face);fonts.set(asset.id,face);}
  renderer=createDomTextRenderer({mount,program,fontFamily:id=>{const face=fonts.get(id);if(!face)throw new Error('FIT_FONT_ID');return face.family;}});renderer.applyDisplayPreferences({fontScale,windowOpacity:1});
  const core=createCore(program);core.accept({type:'text.preferences',value:{intervalMs:0}});let count=0,shrunk=0,minFactor=1,worst:string|null=null;const failures:{at:string;dx:number;dy:number;escaped:boolean;edges?:number[]}[]=[],seen=new Set<string>();let steps=0;
  for(;steps<10000;steps++){
   while(core.run(100)==='yield'){}const snapshot=core.view().run;if(snapshot.status==='ended')break;const wait=snapshot.wait;if(wait?.kind!=='text'||!snapshot.text)throw new Error('FIT_TEXT_WAIT');
   if(!seen.has(wait.at)){seen.add(wait.at);renderer.render(snapshot);const root=mount.querySelector<HTMLElement>('[data-text-window]')!,factor=Number(root.style.getPropertyValue('--galbox-fit-scale')),dx=root.scrollWidth-root.clientWidth,dy=root.scrollHeight-root.clientHeight;count++;if(factor<1)shrunk++;if(factor<minFactor){minFactor=factor;worst=wait.at;}const bounds=root.getBoundingClientRect(),edges=[0,0,0,0];for(const e of root.querySelectorAll<HTMLElement>('.galbox-text-unit,ruby,rt')){if(e.classList.contains('galbox-text-unit')&&!e.textContent?.trim()&&!e.style.textDecoration)continue;const r=e.getBoundingClientRect();if(r.width>0){edges[0]=Math.max(edges[0]!,bounds.left-r.left);edges[1]=Math.max(edges[1]!,r.right-bounds.right);edges[2]=Math.max(edges[2]!,bounds.top-r.top);edges[3]=Math.max(edges[3]!,r.bottom-bounds.bottom);}}const escaped=edges.some(x=>x>1);if(dx>0||dy>0||escaped||root.scrollTop!==0||getComputedStyle(root).overflow!=='hidden')failures.push({at:wait.at,dx,dy,escaped,edges});}
   core.accept({type:'step',prompt:wait.prompt,inputId:'fit-'+steps});
  }
  if(steps===10000)throw new Error('FIT_STEP_LIMIT');return {count,shrunk,minFactor,worst,failures};
 }finally{renderer?.dispose();mount.remove();for(const face of fonts.values())document.fonts.delete(face);}
}
export async function auditWire(bytes:number[],width?:number,fontScale?:number){return auditText(decodeWire('Program',new Uint8Array(bytes)),width,fontScale);}
