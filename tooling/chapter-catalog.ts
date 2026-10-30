/** Source boundaries are chapter/replay entry labels, never translated line numbers. */
export const chapters = [
 {id:'prologue',file:'scenario.ks',start:'prologstart',end:'scenario1start'},
 {id:'door1',file:'scenario.ks',start:'scenario1start',end:'zero3'},
 {id:'interlude1',file:'scenario.ks',start:'zero3'},
 {id:'memory1',file:'memory1.ks',start:'手を伸ばした'},
 ...[2,3,4].map(n=>({id:`door${n}`,file:`scenario${n}.ks`,start:'start'})),
 ...[5,6,7,8,9].map(n=>({id:`scenario${n}`,file:`scenario${n}.ks`,start:'start'})),
 {id:'search',file:'search.ks',start:'start'},
 {id:'search2',file:'search2.ks',start:'start'},
] as const;
export interface ChapterSpec {readonly id:string;readonly file:string;readonly start:string;readonly end?:string;}
