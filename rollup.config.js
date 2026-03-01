import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import fs from 'fs';
import path from 'path';

const dev = process.env.ROLLUP_WATCH;
const HA_DEST = 'Z:/www/community/dist/shelly-dashboard-card.js';

function autoDeploy() {
  return {
    name: 'auto-deploy',
    writeBundle(options) {
      const src = options.file;
      try {
        fs.mkdirSync(path.dirname(HA_DEST), { recursive: true });
        fs.copyFileSync(src, HA_DEST);
        console.log(`\x1b[32m[auto-deploy] → ${HA_DEST}\x1b[0m`);
      } catch (e) {
        console.warn(`\x1b[33m[auto-deploy] skipped: ${e.message}\x1b[0m`);
      }
    },
  };
}

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/shelly-dashboard-card.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: dev ? true : false,
  },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    !dev && terser({ format: { comments: false } }),
    autoDeploy(),
  ].filter(Boolean),
};
