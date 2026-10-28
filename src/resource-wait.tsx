import {useEffect,useState} from 'react';
/** Keep brief cache misses invisible; explain a real foreground wait without covering the scene. */
export function ResourceWait({loading,label}:{loading:boolean;label:string}) {
 const [visible,setVisible]=useState(false);
 useEffect(()=>{setVisible(false);if(!loading)return;const timer=setTimeout(()=>setVisible(true),350);return()=>clearTimeout(timer);},[loading]);
 return loading&&visible?<div className="resource-wait" role="status" aria-live="polite"><span aria-hidden="true"/>{label}</div>:null;
}
