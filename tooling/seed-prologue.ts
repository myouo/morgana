import {readFile} from 'node:fs/promises';
import {readPrologue} from './prologue.js';
import {seedPrologue} from './localize-prologue.js';
import {languages} from './locale.js';
import {localeInfo} from '../src/locales.js';
async function source(l:string){return readPrologue(await readFile(`private/text/${l}/scenario/scenario.ks`,'utf8'),await readFile(`private/text/${l}/scenario/macro.ks`,'utf8'),['jp','ko','zh'].includes(l)?22:18);}
const en=await source('en');for(const l of languages){const p=await source(l);await seedPrologue(p,en,localeInfo[l].html);console.log(l,p.pages.length,'fresh-profile pages and two authored choices');}
