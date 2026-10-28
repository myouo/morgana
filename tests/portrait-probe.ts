import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {inspectResource,createReleaseManifest} from 'galbox-sdk/release';
import {readFile} from 'node:fs/promises';
import {CharacterParts} from '../tooling/character-parts.js';
import {PortraitAssets} from '../tooling/portrait-assets.js';
import {lowerPortrait} from '../tooling/lower-character.js';
import {hash} from '../tooling/locale.js';
export async function portraitProbe(){const images=new PortraitAssets('en'),parts=new CharacterParts(images.lookup),plain=parts.update('女中','体 普通 - - '),smile=parts.update('女中','体 喜び - - '),b=new ProgramBuilder({gameId:'portrait-browser-probe',release:'v1',entry:'main'}),first=await lowerPortrait(b,images,plain,'first','maid',{x:308,y:0},1000),second=await lowerPortrait(b,images,smile,'second','maid',{x:308,y:0},300,first.asset);b.function({id:'main',entry:'first',layout:1,params:[],locals:[],returns:'void',code:[...first.code,...second.code,instruction('control.end',{at:'end'})]});const program=b.build(),resources=await Promise.all(program.assets.map(async a=>inspectResource(a,new Uint8Array(await readFile('public/'+a.path)),b=>new TextDecoder().decode(b)))),release=await createReleaseManifest({program,series:'1',resources},{async sha256(s){return hash(s);}});return {program,release};}
