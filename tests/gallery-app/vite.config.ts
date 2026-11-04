import path from 'node:path';
import {defineConfig} from 'vite';
import {versionedMediaPlugin} from '../../tooling/versioned-media.js';
const base=process.cwd(),root=process.env.FATA_EXTRA_ROOT??'generated/gallery-full';if(!['generated/gallery-full','generated/music-full'].includes(root))throw new Error('Native extra fixture root');
export default defineConfig({root:path.join(base,'tests/gallery-app'),publicDir:path.join(base,root),cacheDir:path.join(base,'node_modules/.vite-gallery'),plugins:[versionedMediaPlugin(root)],server:{host:'127.0.0.1',port:4208,strictPort:true,hmr:false,fs:{allow:[base],deny:['**/private/**','**/vendor/**','**/artifacts/**','**/.git/**']}}});
