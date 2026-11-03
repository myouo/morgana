import type {Snapshot,Program,DeepReadonly} from 'galbox-sdk/protocol';
/** The published fourth-door endpoint becomes its explicit authored continuation. */
export function continueFifthBoundary(out:Snapshot,target:DeepReadonly<Program>):void {
 const frame=out.frames[0],op=target.functions.find(f=>f.id==='main')?.code.find(i=>i.at==='release:scenario5-entry');
 if(out.status!=='ended'||out.frames.length!==1||frame?.functionId!=='main'||frame.pc!=='release:scenario5-entry'||op?.op!=='wait.delay'||op.task!=='fifth-resume')return;
 const id='task:'+ ++out.counter;out.tasks.push({id,name:op.task,kind:'delay',status:'running',elapsed:0,duration:op.duration,attempt:1,at:op.at});out.wait={kind:'delay',at:op.at,task:id};out.status='waiting';
}
