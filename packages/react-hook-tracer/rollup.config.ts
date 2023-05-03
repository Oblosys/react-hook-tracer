import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import * as fs from 'fs'
import * as path from 'path'
import { defineConfig } from 'rollup'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'

// Importing JSON yields experimental-feature warnings and requires node >== 17, so we just read & parse the file.
const packageJson = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }))

// Pass --configIncludeDeclarationMap to rollup to enable declarationMap (enables cmd click to jump to source).
export default (args: { configIncludeDeclarationMap?: boolean }) => {
  const includeDeclarationMap = args.configIncludeDeclarationMap ?? false
  console.log(`Building '${packageJson.name}' package, declarationMap: ${includeDeclarationMap}`)

  const plugins = [
    external(),
    resolve(),
    commonjs(),
    postcss(),
    typescript({
      declaration: true,
      declarationMap: includeDeclarationMap,
      outDir: 'dist/types',
      // outDir 'dist/types' produces the same directory layout as 'types', as the 'dist' is stripped, but adds an extra
      // '../' to the sources path in the source maps.
      //
      // For example, in dist/types/src/Tracer.d.ts.map
      // outDir: 'types' yields the incorrect "sources":["../../src/Tracer.ts"]
      // whereas outDir: 'dist/types' yields "sources":["../../../src/Tracer.ts"]
      // The output js file is not affected as it is specified in defineConfig below.
    }),
    // No terser, as rollup-plugin-terser has peer-dep warnings and seems unmaintained.
    // It also only reduces the tgz by 20%.
  ]

  return defineConfig({
    input: 'src/index.ts',
    output: [
      { file: packageJson.module, format: 'esm' },
      { file: packageJson.main, format: 'cjs' },
    ],
    watch: {
      include: path.resolve('src/**'),
      clearScreen: false,
    },
    plugins,
  })
}
