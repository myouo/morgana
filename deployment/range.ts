export function byteRange(header:string|null,size:number):{offset:number;length:number}|null|'invalid'{
 if(!header)return null;const match=/^bytes=(\d*)-(\d*)$/u.exec(header);if(!match||(!match[1]&&!match[2]))return 'invalid';
 const first=match[1]?Number(match[1]):null,last=match[2]?Number(match[2]):null;if(first!==null&&!Number.isSafeInteger(first)||last!==null&&!Number.isSafeInteger(last))return 'invalid';
 if(first===null){if(!last||last<0||!size)return 'invalid';const length=Math.min(last,size);return {offset:size-length,length};}
 if(first>=size||last!==null&&last<first)return 'invalid';const end=Math.min(last??size-1,size-1);return {offset:first,length:end-first+1};
}
