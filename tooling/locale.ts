import {createHash} from 'node:crypto';
export const languages=['en','fr','it','jp','ko','pt-br','ru','zh'] as const;
export type Language=typeof languages[number];
export function isLanguage(value:string):value is Language{return languages.some(l=>l===value);}
export const hash=(data:string|Uint8Array)=>createHash('sha256').update(data).digest('hex');
