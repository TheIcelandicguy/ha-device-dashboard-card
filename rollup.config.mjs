import resolve   from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser     from '@rollup/plugin-terser';
import fs         from 'fs';
import path       from 'path';
import { spawnSync } from 'child_process';

const dev = process.env.ROLLUP_WATCH === 'true';

const HA_DEST = 'Z:/www/community/ha-device-dashboard/ha-device-dashboard.js';

function autoDeploy() {
  return {
    name: 'auto-deploy',
    writeBundle(options) {
      const src = options.file;
      try {
        fs.mkdirSync(path.dirname(HA_DEST), { recursive: true });
        fs.copyFileSync(src, HA_DEST);
        console.log(`\x1b[32m[auto-deploy] → ${HA_DEST}\x1b[0m`);
        // Copying the file is only half a deploy: HA's resource URL pins a `?v=`
        // cache-buster, so without this the browser keeps serving the build it
        // cached under the same URL. Not in watch mode — a rebuild per keystroke
        // does not need a WebSocket round trip to HA each time.
        if (!dev) {
          spawnSync(process.execPath, ['scripts/bump-resource.mjs'], { stdio: 'inherit' });
        }
      } catch (e) {
        console.warn(`\x1b[33m[auto-deploy] skipped: ${e.message}\x1b[0m`);
      }
    },
  };
}

export default {
  input:  'src/index.ts',
  output: {
    file:      'dist/ha-device-dashboard.js',
    format:    'es',
    sourcemap: dev,
  },
  plugins: [
    resolve({ browser: true }),
    typescript({ tsconfig: './tsconfig.json' }),
    !dev && terser({
      format:   { comments: false },
      compress: { drop_console: false },
    }),
    autoDeploy(),
  ].filter(Boolean),
};