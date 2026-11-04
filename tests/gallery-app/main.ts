import {createPlayer,createHttpProvider,createHttpModuleProvider} from 'galbox-sdk/player';
import type {Player} from 'galbox-sdk/player';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {decodeWire} from 'galbox-sdk/wire';
import {parseRulePresentation} from 'galbox-sdk/protocol';
import './style.css';
declare global{interface Window{__gallery?:Player;__galleryError?:string;}}
const locale=new URLSearchParams(location.search).get('lang')??'zh',surface=document.querySelector<HTMLElement>('#game')!,mount=document.querySelector<HTMLElement>('#mount')!;
surface.addEventListener('contextmenu',event=>event.preventDefault());surface.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();}},true);
try{
 const bytes=async(path:string)=>{const response=await fetch(path);if(!response.ok)throw new Error('Gallery fixture '+response.status);return new Uint8Array(await response.arrayBuffer());},source=createModuleProgram(decodeWire('ModuleManifest',await bytes(`/programs/${locale}.modules.pb`))),rules=decodeWire('JsonValue',await bytes(`/programs/${locale}.rules.pb`));
 const player=await createPlayer({program:source,moduleProvider:createHttpModuleProvider(source,location.href),provider:createHttpProvider(source,location.href),mount,saveCompatibilitySeries:source.describe().release.series,rulePresentation:parseRulePresentation(rules),graphics:{renderer:'canvas',background:'#000000'},loading:{mode:'balanced',lookahead:4,maxResidentBytes:67108864},streaming:{integrity:'versioned-url'}});window.__gallery=player;player.attachInput(surface);surface.addEventListener('pointerdown',()=>void player.retryAudio());await player.start();
}catch(error){window.__galleryError=String(error);throw error;}
