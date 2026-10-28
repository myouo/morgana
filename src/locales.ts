export const localeInfo={en:{name:'English',html:'en'},fr:{name:'Français',html:'fr'},it:{name:'Italiano',html:'it'},jp:{name:'日本語',html:'ja'},ko:{name:'한국어',html:'ko'},'pt-br':{name:'Português (Brasil)',html:'pt-BR'},ru:{name:'Русский',html:'ru'},zh:{name:'简体中文',html:'zh-Hans'}} as const;
export type Language=keyof typeof localeInfo;
export function language(value:string|null):Language {const id=Object.entries(localeInfo).find(([id,info])=>id.toLowerCase()===value?.toLowerCase()||info.html.toLowerCase()===value?.toLowerCase())?.[0];return id&&isLanguage(id)?id:'zh';}
export function isLanguage(value:string):value is Language{return value==='en'||value==='fr'||value==='it'||value==='jp'||value==='ko'||value==='pt-br'||value==='ru'||value==='zh';}
