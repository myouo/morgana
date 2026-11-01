import type {CSSProperties} from 'react';
import type {Player,PlayerView,SaveLibraryEntry} from 'galbox-sdk/player';
import type {SaveLayout,SaveSheet,TitleData} from './artwork.js';
import type {MenuWords} from './translations.js';

const pos=(x:number,y:number,width:number,height:number):CSSProperties=>({left:x,top:y,width,height});
function SheetButton({sheet,x,y,label,disabled,selected,onClick,returnButton=false}:{sheet:SaveSheet;x:number;y:number;label:string;disabled?:boolean;selected?:boolean;onClick():void;returnButton?:boolean}){
 return <button className="save-sheet" aria-label={label} aria-current={selected?'page':undefined} data-save-return={returnButton||undefined} disabled={disabled||selected} onClick={onClick} style={{...pos(x,y,sheet.width,sheet.height),backgroundImage:`url(${sheet.graphic})`}}/>;
}
/** Stable source positions in both modes; holes and auto slots never collapse. */
export function saveLibrary(view:PlayerView,layout:SaveLayout):Array<SaveLibraryEntry|undefined>{
 const rows:Array<SaveLibraryEntry|undefined>=Array.from({length:layout.manualSlots+layout.autoSlots}),prefix=view.profileId==='main'?'':view.profileId+':',extra:SaveLibraryEntry[]=[];
 for(const row of view.slots.filter(r=>r.profileId===view.profileId)){
  const auto=row.slot.startsWith(prefix+'auto:')?Number(row.slot.slice((prefix+'auto:').length)):NaN;
  if(row.kind==='auto'){if(Number.isInteger(auto)&&auto>=1&&auto<=layout.autoSlots)rows[layout.manualSlots+auto-1]=row;continue;}
  if(row.kind==='quick')continue;
  const number=['memory:','manual:'].flatMap(p=>row.slot.startsWith(prefix+p)?[Number(row.slot.slice((prefix+p).length))]:[])[0];
  if(number!==undefined&&Number.isInteger(number)&&number>=1&&number<=layout.manualSlots&&!rows[number-1])rows[number-1]=row;else extra.push(row);
 }
 for(const row of extra){const free=rows.findIndex((v,i)=>i<layout.manualSlots&&!v);if(free>=0)rows[free]=row;}
 return rows;
}
function stamp(time:number){const d=new Date(time),n=(v:number)=>String(v).padStart(2,'0');return `${d.getFullYear()}/${n(d.getMonth()+1)}/${n(d.getDate())} ${n(d.getHours())}:${n(d.getMinutes())}`;}
export function SourceSaveMenu({player,view,artwork,words,page,setPage,mode,busy,run,confirm,load,close}:{player:Player;view:PlayerView;artwork:TitleData;words:MenuWords;page:number;setPage(page:number):void;mode:'save'|'load';busy:boolean;run(action:()=>Promise<unknown>):void;confirm(text:string,action:()=>Promise<void>):void;load(row:SaveLibraryEntry):Promise<void>;close():void}){
 const art=artwork.menus.saveLayout;if(!art)return null;const library=saveLibrary(view,art),prefix=view.profileId==='main'?'':view.profileId+':',auto=page===10,latest=(kind:'manual'|'auto')=>library.filter((r):r is SaveLibraryEntry=>!!r&&(kind==='auto'?r.kind==='auto':r.kind!=='auto')).sort((a,b)=>(b.capture?.createdAt??0)-(a.capture?.createdAt??0))[0],latestKey='fata-save-latest:'+view.namespace+':'+view.profileId,latestSlot=localStorage.getItem(latestKey),newest=auto?latest('auto'):latestSlot===null?latest('manual'):library.find(r=>r?.slot===latestSlot),oldest=auto&&library.slice(40).filter(Boolean).length===4?library.slice(40).filter((r):r is SaveLibraryEntry=>!!r).sort((a,b)=>(a.capture?.createdAt??0)-(b.capture?.createdAt??0))[0]:undefined;
 const save=(row:SaveLibraryEntry|undefined,index:number)=>{const s=view.core?.run,at=s?.text?.rich?.at??s?.wait?.at,chapter=artwork.chapters.find(c=>at&&c.addresses.includes(at))?.title,textId=s?.text?.textId??'',key=/(?:^|:)([a-f0-9]{24})(?=:|$)/u.exec(textId)?.[1],bookmark=artwork.saveNames.get(textId)??(key?artwork.saveNames.get(key):undefined)??(chapter?art.bookmarks.get(chapter):undefined)??'';confirm(words.confirmSave,async()=>{await player.saveGame({slot:row?.slot??prefix+(auto?'auto:':'memory:')+(auto?index+1:page*4+index+1),kind:auto?'auto':'manual',expectedRevision:row?.revision??0,label:bookmark.slice(0,128)});if(!auto)localStorage.setItem(latestKey,row?.slot??prefix+'memory:'+(page*4+index+1));});};
 return <>
  {Array.from({length:4},(_,i)=>{const row=library[page*4+i],n=page*4+i+1,mark=row&&row===newest?(auto?art.recentAuto:art.recent):row&&auto&&row===oldest?art.oldestAuto:undefined;return <div key={i} className="source-save-card" data-save-slot={row?.slot??(auto?'auto:':'memory:')+(auto?i+1:n)} style={{...pos(200,25+i*125,400,100),backgroundImage:`url(${artwork.menus.card})`,fontSize:art.fontSize}}>
   <button className="save-card-hit" aria-label={mode==='save'?`${words.save} ${n}`:row?`${words.load} ${row.label}`:words.empty} disabled={busy||(mode==='save'?!view.core?.canSave||!!row?.protected:!row)} onClick={()=>{if(mode==='save')save(row,i);else if(row)confirm(words.confirmLoad,()=>load(row));}}/>
   <img className="save-thumbnail" src={row?.capture?.thumbnail?.dataURL??art.dummy} alt="" draggable={false}/>
   {art.numberPosition&&<span className="save-number" style={pos(art.numberPosition.x,art.numberPosition.y,15,16)}>{auto?101+i:n}</span>}
   <span className="save-caption" title={row?.label} style={pos(200,10,190,20)}>{row&&row.label!==row.slot?row.label:'No Data'}</span>
   <time className="save-date" style={pos(200,35,198,18)}>{row?.capture?stamp(row.capture.createdAt):art.emptyDate}</time>
   {mark&&<span className="save-recent" style={pos(mark.x,mark.y,400-mark.x,18)}>{mark.text}</span>}
   {row&&!auto&&<><SheetButton sheet={row.protected?art.locked:art.lock} x={art.lockPosition.x} y={art.lockPosition.y} label={row.protected?words.unprotectSave:words.protectSave} disabled={busy} onClick={()=>run(()=>player.protectSave(row.slot,row.revision,!row.protected))}/><SheetButton sheet={art.delete} x={art.deletePosition.x} y={art.deletePosition.y} label={words.deleteSave} disabled={busy||row.protected} onClick={()=>confirm(words.confirmDelete,async()=>{await player.deleteSave(row.slot,row.revision);if(localStorage.getItem(latestKey)===row.slot)localStorage.setItem(latestKey,'none');})}/></>}
  </div>;})}
  <SheetButton sheet={art.back} x={75} y={565} label={words.back} disabled={busy} onClick={close} returnButton/>
  <nav aria-label={words.savePages}>{art.pages.map((p,i)=><SheetButton key={i} sheet={i===page?p.selected:p.normal} x={art.pageX+i*30} y={540} label={i===10?words.autoSaves:String(i+1)} disabled={busy} selected={i===page} onClick={()=>setPage(i)}/>)}</nav>
 </>;
}
