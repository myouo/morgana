import {createCore} from 'galbox-sdk/core';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {createHttpModuleProvider,prepareModuleProgram,openIndexedDBStore} from 'galbox-sdk/player';
import {storageNamespace} from 'galbox-sdk/backups';
import {decodeWire} from 'galbox-sdk/wire';
type FixtureBytes=number[]|string;
function fixtureBytes(input:FixtureBytes):Uint8Array{if(Array.isArray(input))return new Uint8Array(input);if(input.length>32*1024*1024)throw new Error('TEST_CUT_BYTES');return Uint8Array.from(atob(input),c=>c.charCodeAt(0));}

/** Explicit browser fixture import through the SDK Store. Never runs in normal play. */
export async function seedBrowserCut(manifestBytes:FixtureBytes,snapshotBytes:FixtureBytes,profileBytes:FixtureBytes,expectedGameId:string,expectedSeries:string){
 const manifest=decodeWire('ModuleManifest',fixtureBytes(manifestBytes));if(manifest.header.gameId!==expectedGameId||manifest.release.series!==expectedSeries)throw new Error('TEST_CUT_IDENTITY');
 const source=createModuleProgram(manifest),snapshot=decodeWire('Snapshot',fixtureBytes(snapshotBytes)),profile=decodeWire('Profile',fixtureBytes(profileBytes));if(snapshot.replayScene)throw new Error('TEST_REPLAY_CUT');source.binding(snapshot);const candidate=source.bindSnapshot(snapshot);const controller=new AbortController();await prepareModuleProgram(source,createHttpModuleProvider(source,location.href),source.binding(candidate),{get cancelled(){return controller.signal.aborted;},onCancel(listener){controller.signal.addEventListener('abort',listener,{once:true});return()=>controller.signal.removeEventListener('abort',listener);}});createCore(source,profile,candidate);
 const store=await openIndexedDBStore(storageNamespace(expectedGameId,expectedSeries),'galbox-sdk'),id='fifth-fixture:'+crypto.randomUUID(),slot='fixture:'+crypto.randomUUID();try{if(!store.import)throw new Error('TEST_IMPORT_UNAVAILABLE');const imported={...profile,revision:0};await store.import({id,slot,snapshot,profile:imported,metadata:{profileId:'import:'+id,label:'source cut'}});const actual=await store.read('import:'+id);if(JSON.stringify(actual.profile.read)!==JSON.stringify(profile.read)||JSON.stringify(actual.profile.values)!==JSON.stringify(profile.values)||JSON.stringify(actual.profile.extras)!==JSON.stringify(profile.extras)||JSON.stringify(actual.profile.flow)!==JSON.stringify(profile.flow))throw new Error('TEST_PROGRESS_CHANGED');return slot;}finally{store.close();}
}
