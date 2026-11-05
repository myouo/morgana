import {readFile,readdir,writeFile} from 'node:fs/promises';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {MemoryStore} from 'galbox-sdk/testing';
import {storageNamespace} from 'galbox-sdk/backups';
import {languages} from './locale.js';
const root='generated/history-fourth',read=async(p:string)=>new Uint8Array(await readFile(p));
for(const locale of languages.filter(l=>(process.argv[2]??'zh,en').split(',').includes(l)))for(const file of await readdir(root+'/cuts'))if(file.startsWith(locale+'-')&&file.endsWith('.snapshot.pb')){const name=file.slice(0,-'.snapshot.pb'.length),manifest=decodeWire('ModuleManifest',await read(`${root}/cuts/${name}.modules.pb`)),source=createModuleProgram(manifest),cut=decodeWire('Snapshot',await read(`${root}/cuts/${file}`)),profile=decodeWire('Profile',await read(`${root}/cuts/${name}.profile.pb`));source.binding(cut);const store=new MemoryStore(storageNamespace(manifest.header.gameId,manifest.release.series),profile);await store.save('source-cut',cut,0,{profileId:'main',label:name});await writeFile(`${root}/cuts/${name}.pb`,encodeWire('PortableBackup',await store.backup(manifest.header.gameId,manifest.release.series,manifest.header.release)));if(name===locale+'-note')await writeFile(`${root}/programs/${locale}.incoming.modules.pb`,encodeWire('ModuleManifest',manifest));}
