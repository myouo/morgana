/** Fit the game to the visible viewport, including browser chrome and keyboards. */
export function bindViewport(root:HTMLElement):()=>void {
 const viewport=window.visualViewport,keys=['--viewport-width','--viewport-height','--viewport-left','--viewport-top'],previous=keys.map(key=>root.style.getPropertyValue(key));let frame=0;
 const update=()=>{frame=0;const width=viewport?.width??window.innerWidth,height=viewport?.height??window.innerHeight;if(width<=0||height<=0)return;for(const [key,value]of [['--viewport-width',width],['--viewport-height',height],['--viewport-left',viewport?.offsetLeft??0],['--viewport-top',viewport?.offsetTop??0]] as const)root.style.setProperty(key,`${value}px`);};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 update();window.addEventListener('resize',schedule);viewport?.addEventListener('resize',schedule);viewport?.addEventListener('scroll',schedule);document.addEventListener('fullscreenchange',schedule);
 return ()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);viewport?.removeEventListener('resize',schedule);viewport?.removeEventListener('scroll',schedule);document.removeEventListener('fullscreenchange',schedule);keys.forEach((key,i)=>{const value=previous[i];if(value)root.style.setProperty(key,value);else root.style.removeProperty(key);});};
}
/** Called synchronously from a reader gesture; unsupported/denied fullscreen keeps the fitted layout. */
export function enterMobileFullscreen():void {
 const root=document.getElementById('root');if(!root||document.fullscreenElement||!document.fullscreenEnabled||typeof root.requestFullscreen!=='function'||!window.matchMedia('(pointer: coarse)').matches&&navigator.maxTouchPoints===0)return;
 try{void root.requestFullscreen({navigationUI:'hide'}).catch(()=>{});}catch{/* Older implementations can throw synchronously; gameplay still proceeds. */}
}
