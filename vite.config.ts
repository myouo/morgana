import {defineConfig} from 'vite';
import {versionedMediaPlugin} from './tooling/versioned-media.js';
const production=process.env.FATA_PRODUCTION==='1',frontendOnly=process.env.FATA_FRONTEND_ONLY==='1';if(frontendOnly&&!production)throw Error('FATA_FRONTEND_ONLY requires production mode');
const modular=process.env.FATA_MODULES!=='0',root=process.env.FATA_PUBLICATION_ROOT??(modular?'generated/integrated':'generated/site');
export default defineConfig({
 cacheDir:modular?'node_modules/.vite-integrated':'node_modules/.vite-main',
 define:{'import.meta.env.VITE_FATA_MODULES':JSON.stringify(modular?'1':'0'),'import.meta.env.VITE_FATA_TEST_HOOKS':JSON.stringify(production?'0':'1')},
 plugins:[versionedMediaPlugin(root)],
 publicDir:frontendOnly?false:root,
 optimizeDeps:{entries:['index.html']},
 server:{host:'127.0.0.1',port:modular?4184:4180,strictPort:true,hmr:false,watch:{ignored:['**/galbox/**','**/private/**','**/artifacts/**','**/vendor/**','**/dist/**','**/generated/**','**/public/**']},fs:{deny:['.env','.env.*','**/galbox/**','**/private/**','**/artifacts/**','**/vendor/**']}},
 preview:{host:'127.0.0.1',port:4181,strictPort:true},
});
