import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {ReactNode} from 'react';
import type {Player} from 'galbox-sdk/player';
import type {TitleData} from './artwork.js';
import type {MenuWords} from './translations.js';
import {ResourceWait} from './resource-wait.js';

function MenuInput({player}:{player:Player}){
 const view=useSyncExternalStore(player.subscribe,player.getSnapshot,player.getSnapshot),wait=view.core?.run.wait,prompt=(wait?.kind==='group'||wait?.kind==='delay')?wait.prompt:undefined;
 return <>{prompt!==undefined&&view.loading.phase==='idle'&&<div className="advance-surface" onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();void player.step(prompt,view.epoch).catch(console.error);}}/>}<ResourceWait loading={view.loading.phase==='loading'} label=""/>{view.loading.phase==='failed'&&<button className="source-replay-retry" onClick={()=>void player.retryResources().catch(console.error)}>↻</button>}</>;
}

/** Menus and their transitions are authored SDK scenes, as is temporary playback. */
export function SourceReplayMenu({player,title,words,onClose,renderPlayer}:{player:Player;title:TitleData;words:MenuWords;onClose():void;renderPlayer(player:Player,surface:HTMLElement,returnTitle?:()=>Promise<void>):ReactNode}){
 const mount=useRef<HTMLDivElement>(null),surface=useRef<HTMLDivElement>(null),lastPage=useRef('page0'),[entry,setEntry]=useState('source-menu-index'),[session,setSession]=useState<{entry:string;player:Player}|null>(null),[busy,setBusy]=useState(false),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0),menu=entry.startsWith('source-menu-'),child=session?.entry===entry?session.player:null,closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{let active:Player|null=null;let live=true,detach=()=>{},unsubscribe=()=>{},finished=false;setSession(null);setBusy(true);setFailed(false);void(async()=>{try{await player.closeExtra();if(!live||!mount.current||!surface.current)return;const p=await player.openSceneReplay(entry,mount.current);if(!live)return;active=p;if(window.__fataTest)window.__fataTest.replay=()=>p;detach=p.attachInput(surface.current);setSession({entry,player:p});
  const changed=()=>{if(!live||finished)return;const v=p.getSnapshot(),screen=v.core?.run.ui?.active?.screen.id;if(screen?.startsWith('source-menu-page'))lastPage.current=screen.slice('source-menu-'.length);if(v.core?.run.status!=='ended')return;finished=true;if(menu){const request=v.core.run.globals['original.replay-request'];if(request?.kind!=='string'||!['title','prologue','door1','door2','door3','search','door4','door5','door6'].includes(request.value)){setFailed(true);return;}if(request.value==='title'){void player.closeExtra().then(()=>{if(live)closeRef.current();}).catch(()=>{if(live)setFailed(true);});}else setEntry(request.value);}else setEntry('source-menu-'+lastPage.current);};unsubscribe=p.subscribe(changed);changed();
 }catch(e){console.error(e);if(live)setFailed(true);}finally{if(live)setBusy(false);}})();return()=>{live=false;if(window.__fataTest?.replay?.()===active)delete window.__fataTest.replay;detach();unsubscribe();void player.closeExtra().catch(console.error);};},[player,entry,attempt,menu]);
 useEffect(()=>()=>{void player.closeExtra().catch(console.error);},[player]);
 return <div className="source-replay-menu" ref={surface} aria-label={title.unlockedButtons.find(b=>b.action==='extra')?.hint} onKeyDownCapture={event=>{if(event.key!=='Escape'||busy||!menu)return;event.preventDefault();event.stopPropagation();void player.closeExtra().then(()=>closeRef.current()).catch(()=>setFailed(true));}}>
  <div className="stage replay-stage" ref={mount}/>
  {child&&surface.current&&(menu?<MenuInput player={child}/>:renderPlayer(child,surface.current,async()=>{await player.closeExtra();onClose();}))}

  {failed&&<div className="resource-error" role="alert"><p>{words.failed}</p><button onClick={()=>setAttempt(n=>n+1)}>{words.retry}</button><button onClick={()=>void player.closeExtra().then(onClose)}>{words.back}</button></div>}
 </div>;
}
