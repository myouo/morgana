import {createCore} from 'galbox-sdk/core';import type {ModuleProgram} from 'galbox-sdk/port-kit';import {parseSnapshot,parseValue} from 'galbox-sdk/protocol';import type {Snapshot,DeepReadonly,Program} from 'galbox-sdk/protocol';
/** Explicit first-door edition upgrade. Existing instruction/call identities
 * are checked by the producer; Core validates the complete mapped result. */
export function migrateFirstDoor(snapshot:DeepReadonly<Snapshot>,target:DeepReadonly<Program>,source:ModuleProgram,opacityAsset:string):Snapshot {
 const out=parseSnapshot(snapshot),initial=createCore(source).view().run;out.release=target.release;out.globals={...Object.fromEntries(target.globals.map(s=>[s.id,parseValue(s.initial)])),...out.globals};
 if(out.textLayout&&initial.textLayout)out.textLayout.signature=initial.textLayout.signature;
 if(initial.streamCatalog)out.streamCatalog=initial.streamCatalog;if(initial.audioSourcesSignature)out.audioSourcesSignature=initial.audioSourcesSignature;if(initial.extrasSignature)out.extrasSignature=initial.extrasSignature;
 if(!out.stage.some(o=>o.id==='text-opacity'))out.stage.push({id:'text-opacity',asset:opacityAsset,position:{x:0,y:0,alpha:1},z:-100,visible:false});
 if(out.status==='ended'){
  if(out.frames.length!==1||out.frames[0]?.functionId!=='main'||out.frames[0].pc!=='main:complete')throw new Error('SAVE_UPGRADE_UNSUPPORTED_END');
  const id='task:'+(++out.counter);out.tasks.push({id,name:'integration-resume',kind:'delay',status:'running',elapsed:0,duration:1,attempt:1,at:'main:complete'});out.status='waiting';out.wait={kind:'delay',at:'main:complete',task:id};
 }
 return source.bindSnapshot(out);
}
