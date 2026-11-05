/** Verification metrics for already captured JSON; this does not validate a save. */
export function jsonFootprint(value:unknown){
 let nodes=0,depth=0;const pending:[unknown,number][]=[[value,0]];
 while(pending.length){const [item,level]=pending.pop()!;nodes++;depth=Math.max(depth,level);if(item!==null&&typeof item==='object')for(const child of Object.values(item))pending.push([child,level+1]);}
 return {nodes,depth,characters:JSON.stringify(value).length};
}
