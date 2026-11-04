import type {ModuleProgram} from 'galbox-sdk/port-kit';
import type {ProgramModule} from 'galbox-sdk/protocol';
import {requireValue} from './kag.js';
/** Producer/verification utility; each public SDK installation retains the 64-body batch bound. */
export function installModuleFiles(source:ModuleProgram,files:readonly ProgramModule[]){
 const pending=new Map(files.map(f=>[f.id,f])),loaded=new Set(source.loaded());
 while(pending.size){const batch:ProgramModule[]=[];for(;;){const next=[...pending.values()].find(f=>(source.descriptor(f.id).dependencies??[]).every(id=>loaded.has(id)||batch.some(f=>f.id===id)));if(!next||batch.length===64)break;batch.push(next);pending.delete(next.id);}requireValue(batch.length>0,'MODULE_INSTALL_DEPENDENCY');source.installAll(batch);for(const f of batch)loaded.add(f.id);}
}
