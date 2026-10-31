import {canonicalWireJSON,parseJsonValue} from 'galbox-sdk/protocol';
import type {LeafOriginAlias} from 'galbox-sdk/port-kit';
/** Deduplicate instruction bodies; addresses stay explicit and are restored canonically. */
export function compactLeafPlan(plan:{removedFunctions:string[];origins:LeafOriginAlias[]}){
 const signatures:string[]=[],indexes=new Map<string,number>(),index=(signature:string)=>{const {at,...body}=JSON.parse(signature);const key=canonicalWireJSON(body);let n=indexes.get(key);if(n===undefined){n=signatures.length;signatures.push(key);indexes.set(key,n);}return n;},chunks=<T>(v:T[])=>Array.from({length:Math.ceil(v.length/256)},(_,n)=>v.slice(n*256,(n+1)*256)),origins=plan.origins.map(a=>({from:a.from,to:a.to,source:index(a.sourceSignature),target:index(a.targetSignature),duration:a.duration}));
 return parseJsonValue({version:1,removedFunctions:plan.removedFunctions,signatures:chunks(signatures),origins:chunks(origins)});
}
