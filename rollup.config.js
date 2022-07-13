import shebang from 'rollup-plugin-preserve-shebang'
import typescript from '@rollup/plugin-typescript'
import externals from 'rollup-plugin-node-externals'

function createPluffaApp() {
  const baseDir = './packages/create-pluffa-app'
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

function pluffaBuildTools() {
  const baseDir = './packages/pluffa-build-tools'
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

function pluffaEnv() {
  const baseDir = './packages/pluffa-env'
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

function pluffaCrawl() {
  const baseDir = './packages/pluffa-crawl'
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

function pluffaCloudflareWorker() {
  const baseDir = './packages/pluffa-cloudflare-worker'
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

function pluffa() {
  const baseDir = './packages/pluffa'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.ts`,
      cli: `${baseDir}/src/cli.ts`,
      render: `${baseDir}/src/render.tsx`,
      'lib/statik.browser': `${baseDir}/src/lib/statik.browser.ts`,
      'lib/statik.node': `${baseDir}/src/lib/statik.node.ts`,
      'lib/crawl': `${baseDir}/src/lib/crawl.ts`,
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
  ...createPluffaApp(),
  ...pluffaBuildTools(),
  ...pluffaEnv(),
  ...pluffaCrawl(),
  ...pluffaCloudflareWorker(),
  ...pluffa(),
]
