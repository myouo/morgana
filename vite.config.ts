import {defineConfig} from 'vite';
import {versionedMediaPlugin} from './tooling/versioned-media.js';
export default defineConfig({
 plugins:[versionedMediaPlugin()],
 publicDir:'generated/site',
 optimizeDeps:{entries:['index.html']},
 server:{host:'127.0.0.1',port:4180,strictPort:true,hmr:false,watch:{ignored:['**/galbox/**','**/private/**','**/artifacts/**','**/vendor/**','**/dist/**']},fs:{deny:['.env','.env.*','**/galbox/**','**/private/**','**/artifacts/**','**/vendor/**']}},
 preview:{host:'127.0.0.1',port:4181,strictPort:true},
});
