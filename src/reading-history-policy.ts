import {historyPolicy} from 'galbox-sdk/player';

// Records, not native HistoryLayer lines. Keep the display within the existing
// 2048-record policy cap and validate Snapshot/module budgets at actual cuts.
export const storyHistoryLimit=512;
export const readingHistoryPolicy=historyPolicy({maxEntries:64,maxDisplayEntries:storyHistoryLimit,maxCharacters:500000,rollback:false,includeCurrentText:true});
