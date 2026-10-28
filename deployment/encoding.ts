export function acceptsBrotli(header:string|null):boolean {
 for(const entry of header?.split(',')??[]){const [name,...parameters]=entry.trim().toLowerCase().split(';');if(name?.trim()!=='br')continue;const quality=parameters.find(p=>p.trim().startsWith('q=')),q=quality===undefined?1:Number(quality.trim().slice(2));return Number.isFinite(q)&&q>0&&q<=1;}
 return false;
}
