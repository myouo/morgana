export interface HistoryNameFormat {macro:string;key:string;screen:string;text:string;fontSize:number;baseSize:number;}
export function historyNameFormats(input:unknown):Map<string,HistoryNameFormat>{
 if(input===undefined)return new Map();if(!Array.isArray(input)||input.length>128)throw Error('HISTORY_NAME_FORMATS');const out=new Map<string,HistoryNameFormat>();
 for(const row of input){if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).length!==6||!Object.keys(row).every(k=>['macro','key','screen','text','fontSize','baseSize'].includes(k))||typeof row.macro!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/u.test(row.macro)||typeof row.key!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/u.test(row.key)||typeof row.screen!=='string'||!row.screen.length||row.screen.length>256||typeof row.text!=='string'||!row.text.length||row.text.length>256||!Number.isInteger(row.fontSize)||row.fontSize<1||row.fontSize>128||!Number.isInteger(row.baseSize)||row.baseSize<1||row.baseSize>128)throw Error('HISTORY_NAME_FORMAT');const format:HistoryNameFormat={macro:row.macro,key:row.key,screen:row.screen,text:row.text,fontSize:row.fontSize,baseSize:row.baseSize};if(out.has(row.macro))throw Error('HISTORY_NAME_FORMAT_DUPLICATE');out.set(row.macro,format);
 }
 return out;
}
