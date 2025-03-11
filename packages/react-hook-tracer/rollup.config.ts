import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import postcss from 'rollup-plugin-postcss'

// Pass --configIncludeDeclarationMap to rollup to enable declarationMap (enables cmd click to jump to source).
export default (args: { configIncludeDeclarationMap?: boolean }) => {
  const includeDeclarationMap = args.configIncludeDeclarationMap ?? false
  console.log(`Building package, declarationMap: ${includeDeclarationMap}`)

  const plugins = [
    resolve(),
    commonjs(),
    postcss(),
    typescript({
      declaration: true,
      declarationMap: includeDeclarationMap,
    }),
    // No terser, as rollup-plugin-terser has peer-dep warnings and seems unmaintained.
    // It also only reduces the tgz by 20%.
  ]

  return defineConfig({
    input: 'src/index.ts',
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    output: [
      { file: 'dist/index.esm.js', format: 'esm' },
      { file: 'dist/index.cjs.js', format: 'cjs' },
    ],
    watch: {
      include: 'src/**',
      clearScreen: false,
    },
    plugins,
  })
}
