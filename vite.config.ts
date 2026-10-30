import {defineConfig} from 'vite';
import {versionedMediaPlugin} from './tooling/versioned-media.js';
const modular=process.env.FATA_MODULES==='1',root=process.env.FATA_PUBLICATION_ROOT??(modular?'generated/integrated':'generated/site');
export default defineConfig({
 cacheDir:modular?'node_modules/.vite-integrated':'node_modules/.vite-main',
 define:{'import.meta.env.VITE_FATA_MODULES':JSON.stringify(modular?'1':'0')},
 plugins:[versionedMediaPlugin(root)],
 publicDir:root,
 optimizeDeps:{entries:['index.html']},
 server:{host:'127.0.0.1',port:modular?4184:4180,strictPort:true,hmr:false,watch:{ignored:['**/galbox/**','**/private/**','**/artifacts/**','**/vendor/**','**/dist/**']},fs:{deny:['.env','.env.*','**/galbox/**','**/private/**','**/artifacts/**','**/vendor/**']}},
 preview:{host:'127.0.0.1',port:4181,strictPort:true},
});
