import {readPO,compilePO} from './po.js';
import {encodePOText,decodePOText,poControls} from './po-text.js';
import type {Prologue} from './prologue.js';
import {requireValue} from './kag.js';
import {hash} from './locale.js';
import {readFile,writeFile} from 'node:fs/promises';
import {parse,stringify} from 'smol-toml';
export async function seedPrologue(source:Prologue,english:Prologue,locale:string){
 const base=new Map(english.pages.map(p=>[p.id,encodePOText(p.runs)])),old=await readPO(`locales/${locale}/awakening.po`,locale),controls=parse(await readFile('locales/controls.toml','utf8')),group=controls[locale];requireValue(group&&typeof group==='object'&&!Array.isArray(group)&&!(group instanceof Date),'PROLOGUE_CONTROLS');
 const entries=source.pages.map(p=>{const native=encodePOText(p.runs),prior=old.get('page:'+p.id);const text=prior?.text??native;decodePOText(text,p.runs);const kinds=poControls(p.runs);if(kinds.length)Object.defineProperty(group,'page:'+p.id,{value:kinds,writable:true,configurable:true,enumerable:true});return {context:'page:'+p.id,id:base.get(p.id)??native,text,reference:'scenario:'+p.id};});
 try{await writeFile(`locales/${locale}/prologue.po`,compilePO(locale,entries),{flag:'wx'});}catch(e){if(!(e instanceof Error)||!('code'in e)||e.code!=='EEXIST')throw e;}
 const choices=source.nodes.flatMap(n=>n.kind==='choice'?n.options:[]),englishChoices=english.nodes.flatMap(n=>n.kind==='choice'?n.options:[]);try{await writeFile(`locales/${locale}/choices.po`,compilePO(locale,choices.map((o,i)=>({context:'choice:'+o.id,id:englishChoices[i]!.text,text:o.text}))),{flag:'wx'});}catch(e){if(!(e instanceof Error)||!('code'in e)||e.code!=='EEXIST')throw e;}
 await writeFile('locales/controls.toml',stringify(controls));
 let sources:Record<string,unknown>={};try{sources=parse(await readFile('locales/prologue-sources.toml','utf8'));}catch(e){if(!(e instanceof Error)||!('code'in e)||e.code!=='ENOENT')throw e;}sources[locale]=Object.fromEntries(entries.map(e=>[e.context,hash(e.id)]));await writeFile('locales/prologue-sources.toml',stringify(sources));
}
export async function localizePrologue(source:Prologue,english:Prologue,locale:string){const p=structuredClone(source),entries=await readPO(`locales/${locale}/prologue.po`,locale),base=new Map(english.pages.map(p=>[p.id,encodePOText(p.runs)]));requireValue(entries.size===p.pages.length,'PROLOGUE_PO_COUNT');for(const page of p.pages){const entry=entries.get('page:'+page.id);requireValue(entry?.id===(base.get(page.id)??encodePOText(page.runs)),'PROLOGUE_PO_SOURCE '+page.id);const decoded=decodePOText(entry.text,page.runs);page.text=decoded.plain;page.runs=decoded.runs;}
 // structuredClone preserves the shared page objects between pages and nodes.
 const choices=await readPO(`locales/${locale}/choices.po`,locale),ec=new Map(english.nodes.flatMap(n=>n.kind==='choice'?n.options.map(o=>[o.id,o.text] as const):[]));for(const node of p.nodes)if(node.kind==='choice')for(const option of node.options){const entry=choices.get('choice:'+option.id);requireValue(entry&&entry.id===ec.get(option.id),'PROLOGUE_CHOICE_PO');option.text=entry.text;}
 return p;
}
