import shebang from 'rollup-plugin-preserve-shebang'
import typescript from '@rollup/plugin-typescript'
import externals from 'rollup-plugin-node-externals'

function createSnextApp() {
  const baseDir = './packages/create-snext-app'
  return ['esm'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.ts`,
    },
    output: {
      dir: `${baseDir}/dist`,
      format,
      entryFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      chunkFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      exports: 'named',
    },
    plugins: [
      shebang(),
      externals({
        packagePath: `${baseDir}/package.json`,
      }),
      typescript({ tsconfig: `${baseDir}/tsconfig.json` }),
    ],
  }))
}

function snextBuildTools() {
  const baseDir = './packages/snext-build-tools'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.ts`,
    },
    output: {
      dir: `${baseDir}/dist`,
      format,
      entryFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      chunkFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      exports: 'named',
    },
    plugins: [
      externals({
        packagePath: `${baseDir}/package.json`,
      }),
      typescript({ tsconfig: `${baseDir}/tsconfig.json` }),
    ],
  }))
}

function snextEnv() {
  const baseDir = './packages/snext-env'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.ts`,
    },
    output: {
      dir: `${baseDir}/dist`,
      format,
      entryFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      chunkFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      exports: 'named',
    },
    plugins: [
      externals({
        packagePath: `${baseDir}/package.json`,
      }),
      typescript({ tsconfig: `${baseDir}/tsconfig.json` }),
    ],
  }))
}

function snextCloudflareWorker() {
  const baseDir = './packages/snext-cloudflare-worker'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.ts`,
      render: `${baseDir}/src/render.tsx`,
    },
    output: {
      dir: `${baseDir}/dist`,
      format,
      entryFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      chunkFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      exports: 'named',
    },
    plugins: [
      externals({
        packagePath: `${baseDir}/package.json`,
      }),
      typescript({ tsconfig: `${baseDir}/tsconfig.json` }),
    ],
  }))
}

function snext() {
  const baseDir = './packages/snext'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.ts`,
      cli: `${baseDir}/src/cli.ts`,
      render: `${baseDir}/src/render.tsx`,
      renderWorker: `${baseDir}/src/renderWorker.ts`,
      statikWorker: `${baseDir}/src/statikWorker.ts`,
      'lib/statik.browser': `${baseDir}/src/lib/statik.browser.ts`,
      'lib/statik.node': `${baseDir}/src/lib/statik.node.ts`,
    },
    output: {
      dir: `${baseDir}/dist`,
      format,
      entryFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      chunkFileNames: `[name].${format === 'cjs' ? format : 'js'}`,
      exports: 'named',
    },
    plugins: [
      shebang(),
      externals({
        packagePath: `${baseDir}/package.json`,
      }),
      typescript({ tsconfig: `${baseDir}/tsconfig.json` }),
    ],
  }))
}

export default [
  ...createSnextApp(),
  ...snextBuildTools(),
  ...snextEnv(),
  ...snextCloudflareWorker(),
  ...snext(),
]
