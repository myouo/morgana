import {requireValue} from './kag.js';
export interface CharacterPart {readonly storage:string;readonly x:number;readonly y:number;}
export interface CharacterImage {readonly width:number;readonly height:number;readonly animated:boolean;}
export type CharacterImageLookup=(storage:string)=>CharacterImage|null;
function coordinate(value:string):[number,number]{requireValue(/^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/u.test(value),'CHAR_COORDINATE_LITERAL');const [x,y]=value.split(',').map(Number);requireValue(x!==undefined&&y!==undefined&&Number.isFinite(x)&&Number.isFinite(y)&&Math.abs(x)<=4096&&Math.abs(y)<=4096,'CHAR_COORDINATE_RANGE');return [x,y];}
/** Finite CharLayers images/setPartProperty lowering. Not a TJS interpreter.
 * Each invocation owns a candidate; failed lookup cannot mutate earlier parts. */
export class CharacterParts {
 private readonly actors=new Map<string,CharacterPart[]>();
 constructor(private readonly lookup:CharacterImageLookup){}
 clear(name?:string):void {if(name===undefined)this.actors.clear();else this.actors.delete(name);}
 snapshot(name:string):CharacterPart[]{return (this.actors.get(name)??[]).map(p=>({...p}));}
 update(name:string,storage:string,coordinates?:string):CharacterPart[]{
  requireValue(name.length>0&&name.length<=128&&!/[\/\\\0]/u.test(name),'CHAR_NAME');const tokens=storage.split(' ');requireValue(tokens.length<=16,'CHAR_PART_LIMIT');const candidate=this.snapshot(name);
  const part=(i:number)=>candidate[i]??{storage:'',x:0,y:0};
  for(const [i,token]of tokens.entries()){requireValue(!/[\/\\\0]/u.test(token),'CHAR_STORAGE_NAME');const prior=part(i);let image=prior.storage;
   if(token&&token!=='='){if(token==='-')image='';else {const named=name+'_'+token;image=this.lookup(named)?named:this.lookup(token)?token:'';requireValue(image,'CHAR_IMAGE_MISSING '+name+':'+token);}}
   if(image){const info=this.lookup(image);requireValue(info&&!info.animated,'CHAR_ANIMATION_UNSUPPORTED '+image);requireValue(info.width>0&&info.height>0&&info.width<=4096&&info.height<=4096,'CHAR_IMAGE_SIZE');}
   candidate[i]={...prior,storage:image};
  }
  // In this verified base-only source profile the tail loop uses the number
  // of part groups (one), so a shortened nonempty list retains prior tail parts.
  if(coordinates!==undefined){const pairs=coordinates.split(' ');requireValue(pairs.length<=16,'CHAR_PART_LIMIT');for(const [i,pair]of pairs.entries()){const prior=part(i);if(!pair||pair==='='||pair==='-'){candidate[i]={...prior};continue;}const [x,y]=coordinate(pair);candidate[i]={...prior,x,y};}}
  requireValue(candidate[0]?.storage,'CHAR_BASE_REQUIRED');this.actors.set(name,candidate.map(p=>({...p})));return candidate.map(p=>({...p}));
 }
}
