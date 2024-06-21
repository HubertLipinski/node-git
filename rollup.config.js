import path from 'path'

import { defineConfig } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

const __dirname = path.resolve()

const outDir = (name) => {
  return path.resolve(__dirname, 'build', name)
}

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: outDir('index.min.js'),
      format: 'es',
      plugins: [terser()],
    },
  ],
  plugins: [typescript(), commonjs()],
})
