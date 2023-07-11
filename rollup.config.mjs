import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/cli.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
  plugins: [
    copy({
      targets: [
        { src: 'src/pack_configs/*', dest: 'dist/pack_configs' },
        { src: 'src/yamls/*', dest: 'dist/yamls' },
      ],
    }),
    typescript(),
    commonjs(),
    json(),
    // terser(),
  ],
  external: ['commander', 'colors', 'archiver', 'js-yaml', 'fs', 'path'],
};
