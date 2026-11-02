import type {DeepReadonly,ModuleFunction,Snapshot} from 'galbox-sdk/protocol';
import type {SearchLeafPlan} from './search-migration.js';
import type {ImageFilterAlias} from './image-filter-migration.js';

/** Manifest declarations select code; SDK still validates source and mapped cuts. */
export function migrationCodeIndex(declarations:readonly ModuleFunction[]){
 const byAddress=new Map<string,string>(),functions=new Set(declarations.map(f=>f.id));for(const f of declarations)for(const at of f.addresses)byAddress.set(at,f.id);
 return (snapshot:DeepReadonly<Snapshot>,plan?:SearchLeafPlan,images:readonly ImageFilterAlias[]=[])=>{
  const wanted=new Set<string>(['main']),address=(at:string|undefined)=>{const id=at&&byAddress.get(at);if(id)wanted.add(id);};
  for(const frame of snapshot.frames){if(functions.has(frame.functionId))wanted.add(frame.functionId);address(frame.pc);}
  for(const task of snapshot.tasks){const alias=plan?.origins.find(a=>a.from===task.at&&a.duration===task.duration&&a.sourceSignature===task.stageTask?.signature);address(alias?.to??task.at);address(task.mediaTask?.loopRegion?.at);address(task.mediaTask?.playback?.at);}
  address(snapshot.wait?.at);address(snapshot.ui?.active?.at);for(const w of snapshot.textLayout?.windows??[])address(w.geometryAt);
  for(const object of snapshot.stage){address(object.imageFilter?.at);const alias=images.find(a=>a.from===object.asset);address(alias?.at);}
  for(const invocation of snapshot.invocations??[])address(invocation.at);
  for(const text of [...(snapshot.text?[snapshot.text]:[]),...snapshot.history,...(snapshot.textLayout?.windows.flatMap(w=>w.entries)??[])]){address(text.rich?.at);address(text.template?.at);}
  return [...wanted];
 };
}
