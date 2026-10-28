import {readFile,writeFile} from 'node:fs/promises';
import {parse,stringify} from 'smol-toml';
import {readAwakening} from './awakening.js';
import {languages} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {compilePO} from './po.js';
import {encodePOText,poControls} from './po-text.js';
import {requireValue} from './kag.js';
async function source(locale:string){return readAwakening(await readFile(`private/text/${locale}/scenario/scenario.ks`,'utf8'),await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'));}
const english=await source('en'),base=new Map(english.pages.map(p=>[p.id,encodePOText(p.runs)])),controls=parse(await readFile('locales/controls.toml','utf8'));
for(const l of languages){const a=await source(l),locale=localeInfo[l].html,group=controls[locale];requireValue(group&&typeof group==='object'&&!Array.isArray(group)&&!(group instanceof Date),'controls');
 const messages=a.pages.map(p=>{const id=base.get(p.id);requireValue(id,'AWAKENING_TEXT_ID');const kinds=poControls(p.runs);if(kinds.length)Object.defineProperty(group,'page:'+p.id,{value:kinds,writable:true,enumerable:true,configurable:true});return {context:'page:'+p.id,id,text:encodePOText(p.runs),reference:'page:'+p.id};});
 try{await writeFile(`locales/${locale}/awakening.po`,compilePO(locale,messages),{flag:'wx'});}catch(e){if(!(e instanceof Error)||!('code'in e)||e.code!=='EEXIST')throw e;console.log('Kept existing '+locale);}
 console.log(locale,a.pages.length,'source pages');
}
await writeFile('locales/controls.toml',stringify(controls));
