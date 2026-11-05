import type {ProgramModule} from 'galbox-sdk/protocol';
import {storyHistoryLimit} from '../src/reading-history-policy.js';

/** Upgrade the old converter's reading window; explicit menu resets stay intact. */
export function retainStoryHistory(module:Pick<ProgramModule,'functions'>):number {
 let count=0;
 for(const fn of module.functions)for(const op of fn.code){
  if(op.op!=='state.collect'||op.historyLimit===1||op.historyLimit===storyHistoryLimit)continue;
  if(op.historyLimit!==64&&op.historyLimit!==128)throw Error('STORY_HISTORY_COLLECT_LIMIT '+op.at);
  op.historyLimit=storyHistoryLimit;count++;
 }
 return count;
}
