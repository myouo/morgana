import {ProgramBuilder,instruction,sceneMarker} from 'galbox-sdk/port-kit';
import {bool} from 'galbox-sdk/protocol';
import {createReleaseManifest} from 'galbox-sdk/release';
import {readFile} from 'node:fs/promises';
import {sourceReplayCatalog,firstDoorCompletion} from '../tooling/chapter-replay.js';
import {hash} from '../tooling/locale.js';
/** Synthetic chapter bodies validate the real source gate adapter, not story coverage. */
export async function replayProbe(){const b=new ProgramBuilder({gameId:'source-replay-policy-fixture',release:'v1',entry:'main'}),scenes=sourceReplayCatalog(b,await readFile('private/text/en/scenario/chapter.ks','utf8'),{prologue:'Fixture prologue',door1:'Fixture first door'});const page=(at:string)=>instruction('text.page',{at,textId:at,revision:'v1',speaker:'',content:at});b.function({id:'main',entry:'locked',layout:1,params:[],locals:[],returns:'void',code:[page('locked'),firstDoorCompletion(await readFile('private/text/en/scenario/scenario.ks','utf8'),'complete'),page('unlocked'),instruction('control.end',{at:'end'})]});for(const [id,ref]of Object.entries(scenes))b.function({id,entry:id+':scene',layout:1,params:[],locals:[],returns:'void',code:[sceneMarker(id+':scene',ref),instruction('profile.set',{at:id+':temporary',key:'fixtureReplayOnly',value:bool(true)}),page(id+':line'),instruction('control.return',{at:id+':return'})]});const program=b.build(),release=await createReleaseManifest({program,series:'1',resources:[]},{async sha256(s){return hash(s);}});return {program,release};}
