import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {stringify} from 'smol-toml';
import {decodeWire} from 'galbox-sdk/wire';
import {compilePO} from './po.js';
import {languages} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {requireValue} from './kag.js';
import {encodePOText,poControls} from './po-text.js';
const english=decodeWire('ProgramTextCatalog',new Uint8Array(await readFile('generated/site/text/en.story.pb'))),englishUI=decodeWire('InterfaceTextCatalog',new Uint8Array(await readFile('generated/site/text/en.ui.pb')));
function pages(c:typeof english){return c.entries.flatMap(e=>e.kind==='rich'&&e.at.startsWith('page:')?[{id:e.textId,text:encodePOText(e.runs)}]:[]);}
const controls:Record<string,Record<string,string[]>>={};
const base=new Map(pages(english).map(p=>[p.id,p.text])),baseUI=new Map(englishUI.messages.map(e=>[e.id,e.text]));
await mkdir('locales',{recursive:true});
async function create(file:string,content:string){try{await writeFile(file,content,{flag:'wx'});}catch(e){if(!(e instanceof Error)||!('code'in e)||e.code!=='EEXIST')throw e;console.log('Kept existing '+file);}}
for(const l of languages){const locale=localeInfo[l].html;await mkdir('locales/'+locale,{recursive:true});const story=decodeWire('ProgramTextCatalog',new Uint8Array(await readFile(`generated/site/text/${l}.story.pb`))),ui=decodeWire('InterfaceTextCatalog',new Uint8Array(await readFile(`generated/site/text/${l}.ui.pb`)));
 controls[locale]=Object.fromEntries(story.entries.flatMap(e=>e.kind==='rich'&&poControls(e.runs).length?[['page:'+e.textId,poControls(e.runs)]]:[]));
 await create(`locales/${locale}/story.po`,compilePO(locale,pages(story).map(p=>{const id=base.get(p.id);requireValue(id,'PO_PAGE_IDS');return {context:'page:'+p.id,id,text:p.text,reference:'page:'+p.id};})));
 await create(`locales/${locale}/ui.po`,compilePO(locale,ui.messages.map(e=>{const id=baseUI.get(e.id);requireValue(id,'PO_UI_KEYS');return {context:'ui:'+e.id,id,text:e.text};})));
}
const catalog=decodeWire('LocaleCatalog',new Uint8Array(await readFile('generated/site/text/locales.pb')));await create('locales/locales.toml',stringify({version:1,default_locale:catalog.defaultLocale,locales:catalog.locales.map(({fallback,...locale})=>({...locale,...(fallback?{fallback}:{})}))}));console.log('Seeded only editable text catalogs; no scripts/assets copied');

await create('locales/controls.toml',stringify(controls));
