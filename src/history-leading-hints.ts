export function historyLeadingHints(input:unknown):Map<string,number>{
 if(input===undefined)return new Map();if(!Array.isArray(input)||input.length>256)throw Error('HISTORY_LEADING_HINTS');const out=new Map<string,number>();
 for(const row of input){if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).length!==2||!Object.hasOwn(row,'at')||!Object.hasOwn(row,'lines')||typeof row.at!=='string'||!/^[a-zA-Z][a-zA-Z0-9_.:@/-]{0,127}$/u.test(row.at)||!Number.isInteger(row.lines)||row.lines<1||row.lines>256||out.has(row.at))throw Error('HISTORY_LEADING_HINT');out.set(row.at,row.lines);}
 return out;
}
