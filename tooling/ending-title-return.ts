import {instruction,literal} from 'galbox-sdk/port-kit';
import {bool} from 'galbox-sdk/protocol';
import type {Instruction} from 'galbox-sdk/protocol';
import {requireValue} from './kag.js';
/** Keep the old final-call successor address, including saves inside that call. */
export function endingTitleReturn(code:Instruction[]){const previous=code.at(-1);requireValue(previous?.op==='control.return','ENDING_TITLE_RETURN');code[code.length-1]=instruction('value.set',{at:previous.at,dest:'original.return-title',value:literal(bool(true))});code.push(instruction('control.return',{at:previous.at+'-title'}));}
