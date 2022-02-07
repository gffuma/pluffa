import shebang from 'rollup-plugin-preserve-shebang'
import typescript from '@rollup/plugin-typescript'
import externals from 'rollup-plugin-node-externals'

export default ['esm', 'cjs'].map((format) => ({
  input: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    renderWorker: 'src/renderWorker.ts',
    statikWorker: 'src/statikWorker.ts',
    'lib/statik.browser': 'src/lib/statik.browser.ts',
    'lib/statik.node': 'src/lib/statik.node.ts',
  },
  output: {
    dir: 'dist',
    format,
    entryFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
    chunkFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
    exports: 'named',
  },
  plugins: [shebang(), externals(), typescript()],
}))
