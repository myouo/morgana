import {readFile, writeFile, rename, realpath} from 'node:fs/promises';
import path from 'node:path';
import {brotliCompressSync, constants} from 'node:zlib';
import {decodeWire, encodeWire} from 'galbox-sdk/wire';
import {readUI} from './po.js';
import {languages, hash} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {requireValue} from './kag.js';

/** Regenerate only UI catalogs; story programs and their save identities stay intact. */
export async function refreshInterfaceText(root = 'generated/integrated') {
  const base = await realpath('.'), target = await realpath(root);
  requireValue(target.startsWith(base + path.sep) &&
    /^(?:generated\/|dist(?:\.production)?$)/u.test(path.relative(base, target)), 'UI_PUBLICATION_ROOT');
  const prepared = await Promise.all(languages.map(async locale => {
    const file = path.join(target, 'text', `${locale}.ui.pb`);
    const previous = new Uint8Array(await readFile(file));
    requireValue(decodeWire('InterfaceTextCatalog', previous).locale === localeInfo[locale].html, 'UI_LOCALE');
    const bytes = encodeWire('InterfaceTextCatalog', await readUI(localeInfo[locale].html));
    const compressed = brotliCompressSync(bytes, {params: {[constants.BROTLI_PARAM_QUALITY]: 7}});
    return {locale, file, bytes, compressed, before: hash(previous), after: hash(bytes)};
  }));
  for (const item of prepared) {
    await writeFile(item.file + '.next', item.bytes);
    await writeFile(item.file + '.br.next', item.compressed);
    await rename(item.file + '.next', item.file);
    await rename(item.file + '.br.next', item.file + '.br');
  }
  return prepared.map(({locale, before, after, compressed}) => ({locale, before, after, brotliSha256: hash(compressed)}));
}

if (process.argv[1]?.endsWith('/refresh-interface-text.ts')) {
  console.log('Interface catalogs refreshed', await refreshInterfaceText(process.argv[2]));
}
