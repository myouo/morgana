import {po} from 'gettext-parser';
import type {GetTextTranslations} from 'gettext-parser';
import {readFile} from 'node:fs/promises';
import {parse} from 'smol-toml';
import {localeCatalog,interfaceTextCatalog} from 'galbox-sdk/port-kit';
import {requireValue} from './kag.js';
import {languages} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {menuKeys} from '../src/translations.js';
export interface POMessage {id:string;text:string;}
function object(value:unknown):asserts value is Record<string,unknown>{requireValue(!!value&&typeof value==='object'&&!Array.isArray(value),'PO_OBJECT');}
export function parsePO(source:string,locale:string):Map<string,POMessage>{
 requireValue(Buffer.byteLength(source)<=262144,'PO_SIZE');const parsed:unknown=po.parse(source,{validation:true});object(parsed);object(parsed.headers);const headers=new Map<string,string>();for(const [key,value]of Object.entries(parsed.headers)){requireValue(typeof value==='string'&&!headers.has(key.toLowerCase()),'PO_HEADER');headers.set(key.toLowerCase(),value);}requireValue(headers.get('language')===locale&&/charset=utf-8/iu.test(headers.get('content-type')??''),'PO_LANGUAGE_OR_ENCODING');object(parsed.translations);const messages=new Map<string,POMessage>();
 for(const [context,group]of Object.entries(parsed.translations)){object(group);for(const raw of Object.values(group)){object(raw);if(context===''&&raw.msgid==='')continue;requireValue(context.length>0&&context.length<=192&&raw.msgctxt===context&&!messages.has(context),'PO_CONTEXT');requireValue(typeof raw.msgid==='string'&&raw.msgid.length>0&&raw.msgid_plural===undefined&&!raw.obsolete,'PO_ENTRY');requireValue(Array.isArray(raw.msgstr)&&raw.msgstr.length===1&&typeof raw.msgstr[0]==='string'&&raw.msgstr[0].length>0&&raw.msgstr[0].length<=4096&&!raw.msgstr[0].includes('\0'),'PO_TRANSLATION');if(raw.comments!==undefined){object(raw.comments);requireValue(typeof raw.comments.flag!=='string'||!raw.comments.flag.split(',').some(f=>f.trim()==='fuzzy'),'PO_FUZZY');}messages.set(context,{id:raw.msgid,text:raw.msgstr[0]});}}
 requireValue(messages.size>0&&messages.size<=4096,'PO_SIZE');return messages;
}
export function checkSources(messages:ReadonlyMap<string,POMessage>,expected:ReadonlyMap<string,string>):void {requireValue(messages.size===expected.size,'PO_CONTEXT_SET');for(const [context,id]of expected){const entry=messages.get(context);requireValue(entry&&entry.id===id,'PO_SOURCE_CHANGED '+context);}}
export function compilePO(locale:string,messages:readonly {context:string;id:string;text:string;reference?:string}[]):string {
 const data:GetTextTranslations={charset:'UTF-8',headers:{'project-id-version':'morgana-opening','MIME-Version':'1.0','PO-Revision-Date':'2026-10-28 00:00+0000','Last-Translator':'Community contributors','Language-Team':locale,'content-type':'text/plain; charset=UTF-8','content-transfer-encoding':'8bit',language:locale,'plural-forms':'nplurals=1; plural=0;'},translations:{}};
 for(const entry of messages){requireValue(!data.translations[entry.context],'PO_CONTEXT');data.translations[entry.context]={[entry.id]:{msgctxt:entry.context,msgid:entry.id,msgstr:[entry.text],comments:{extracted:'Edit msgstr; keep msgctxt and msgid unchanged.',...(entry.reference?{reference:entry.reference}:{})}}};}
 return po.compile(data,{foldLength:100,sort:false}).toString('utf8');
}
export async function readPO(file:string,locale:string){const bytes=await readFile(file);return parsePO(new TextDecoder('utf-8',{fatal:true}).decode(bytes),locale);}
export async function readLanguages(){const source=await readFile('locales/locales.toml','utf8');requireValue(Buffer.byteLength(source)<=16384,'LOCALE_SIZE');const raw:unknown=parse(source);object(raw);requireValue(Object.keys(raw).every(k=>['version','default_locale','locales'].includes(k))&&Array.isArray(raw.locales),'LOCALE_CONFIG');const locales=raw.locales.map(l=>{object(l);requireValue(Object.keys(l).every(k=>['id','label','aliases','fallback'].includes(k)),'LOCALE_CONFIG');return {...l,fallback:l.fallback??null};});const catalog=localeCatalog({version:raw.version,defaultLocale:raw.default_locale,locales});requireValue(catalog.locales.length===languages.length&&languages.every(l=>catalog.locales.some(i=>i.id===localeInfo[l].html)),'LOCALE_UNSUPPORTED');return catalog;}
export async function readUI(locale:string){const english=await readPO('locales/en/ui.po','en'),entries=await readPO(`locales/${locale}/ui.po`,locale);requireValue(english.size===menuKeys.length&&menuKeys.every(k=>english.has('ui:'+k)),'PO_UI_KEYS');checkSources(entries,new Map([...english].map(([context,e])=>[context,e.id])));return interfaceTextCatalog({version:1,locale,messages:menuKeys.map(id=>({id,text:entries.get('ui:'+id)!.text}))});}

export async function readStory(locale:string){const merged=new Map<string,POMessage>();for(const file of ['story.po','prologue.po'])for(const [id,message]of await readPO(`locales/${locale}/${file}`,locale)){requireValue(!merged.has(id),'PO_CONTEXT_DUPLICATE');merged.set(id,message);}return merged;}
