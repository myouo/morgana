import {readFile} from 'node:fs/promises';
/** Decodes known plaintext script encodings only. No bytecode or evaluation. */
export async function nativeSource(file:string):Promise<string>{const bytes=await readFile(file);return new TextDecoder(bytes[0]===255&&bytes[1]===254?'utf-16le':'utf-8',{fatal:true}).decode(bytes);}
