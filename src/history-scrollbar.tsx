import {useLayoutEffect,useRef,useState} from 'react';
import type {RefObject,PointerEvent} from 'react';
import type {Language} from './locales.js';

// Override.tjs / VerticalScrollBar: common eight-language source skin.
export function historyScrollbarProfile(locale:Language){return {left:604,top:100,width:15,height:locale==='zh'||locale==='jp'?420:440,base:'#1c1f2d',face:'#000000',bright:'#808080'};}
export function HistoryScrollbar({content,locale,label,lineHeight}:{content:RefObject<HTMLDivElement|null>;locale:Language;label:string;lineHeight:number}){
 const skin=historyScrollbarProfile(locale),track=useRef<HTMLDivElement>(null),drag=useRef<{id:number;offset:number}|null>(null),[position,setPosition]=useState({top:0,viewport:0,total:0});
 useLayoutEffect(()=>{const el=content.current;if(!el)return;const sync=()=>setPosition({top:el.scrollTop,viewport:el.clientHeight,total:el.scrollHeight}),observer=new ResizeObserver(sync);observer.observe(el);if(el.firstElementChild)observer.observe(el.firstElementChild);el.addEventListener('scroll',sync,{passive:true});sync();return()=>{observer.disconnect();el.removeEventListener('scroll',sync);};},[content]);
 const max=Math.max(0,position.total-position.viewport),length=skin.height-2*skin.width,thumb=Math.min(length,Math.max(skin.width,Math.floor(length*position.viewport/Math.max(1,position.total)))),travel=length-thumb,top=max?position.top/max*travel:0;
 const move=(value:number)=>{const el=content.current;if(el)el.scrollTop=Math.max(0,Math.min(max,value));};
 const dragTo=(event:PointerEvent<HTMLDivElement>)=>{const active=drag.current,rect=track.current?.getBoundingClientRect();if(!active||!rect)return;const thumbPixels=rect.height*thumb/length,ratio=(event.clientY-rect.top-active.offset)/Math.max(1,rect.height-thumbPixels);move(Math.round(Math.max(0,Math.min(1,ratio))*max/lineHeight)*lineHeight);};
 if(max<=1)return null;
 return <div className="source-history-scrollbar" role="scrollbar" tabIndex={0} aria-label={label} aria-orientation="vertical" aria-valuemin={0} aria-valuemax={Math.ceil(max/lineHeight)} aria-valuenow={Math.round(position.top/lineHeight)} style={{left:skin.left,top:skin.top,width:skin.width,height:skin.height,background:skin.base}} onKeyDown={event=>{const page=Math.max(lineHeight,Math.floor(position.viewport/lineHeight)*lineHeight),value=event.key==='Home'?0:event.key==='End'?max:position.top+(event.key==='ArrowUp'?-lineHeight:event.key==='ArrowDown'?lineHeight:event.key==='PageUp'?-page:event.key==='PageDown'?page:0);if(['Home','End','ArrowUp','ArrowDown','PageUp','PageDown'].includes(event.key)){event.preventDefault();event.stopPropagation();move(value);}}}>
  <button className="history-scroll-part" aria-label={label+' ↑'} style={{top:0,height:skin.width}} onClick={()=>move(position.top-lineHeight)}>▲</button>
  <div ref={track} className="history-scroll-track" style={{top:skin.width,height:length}} onPointerDown={event=>{if(event.target!==event.currentTarget||event.button!==0)return;const rect=event.currentTarget.getBoundingClientRect(),before=event.clientY<rect.top+rect.height*top/length;move(position.top+(before?-1:1)*Math.max(lineHeight,Math.floor(position.viewport/lineHeight)*lineHeight));}}>
   <div className="history-scroll-part history-scroll-thumb" style={{top,height:thumb}} onPointerDown={event=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();drag.current={id:event.pointerId,offset:event.clientY-event.currentTarget.getBoundingClientRect().top};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={dragTo} onPointerUp={event=>{if(drag.current?.id!==event.pointerId)return;dragTo(event);drag.current=null;event.currentTarget.releasePointerCapture(event.pointerId);}} onLostPointerCapture={()=>{drag.current=null;}}/>
  </div>
  <button className="history-scroll-part" aria-label={label+' ↓'} style={{bottom:0,height:skin.width}} onClick={()=>move(position.top+lineHeight)}>▼</button>
 </div>;
}
