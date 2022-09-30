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

function pluffaSSR() {
  const baseDir = './packages/pluffa-ssr'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.ts`,
      skeleton: `${baseDir}/src/skeleton.tsx`,
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

function pluffaNodeRender() {
  const baseDir = './packages/pluffa-node-render'
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

function pluffaEdgeRender() {
  const baseDir = './packages/pluffa-edge-render'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.tsx`,
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

function pluffaStatik() {
  const baseDir = './packages/pluffa-statik'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      runtime: `${baseDir}/src/runtime.ts`,
      'statik.browser': `${baseDir}/src/statik.browser.ts`,
      'statik.node': `${baseDir}/src/statik.node.ts`,
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

function pluffaNode() {
  const baseDir = './packages/pluffa-node'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.ts`,
      runtime: `${baseDir}/src/runtime.ts`,
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

function pluffaCloudflareWorkers() {
  const baseDir = './packages/pluffa-cloudflare-workers'
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

function pluffa() {
  const baseDir = './packages/pluffa'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      cli: `${baseDir}/src/cli.ts`,
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

function pluffaRouter() {
  const baseDir = './packages/pluffa-router'
  return ['esm', 'cjs'].map((format) => ({
    input: {
      index: `${baseDir}/src/index.ts`,
      client: `${baseDir}/src/client.tsx`,
      server: `${baseDir}/src/server.tsx`,
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
        include: ['@remix-run/router'],
        packagePath: `${baseDir}/package.json`,
      }),
      typescript({ tsconfig: `${baseDir}/tsconfig.json` }),
    ],
  }))
}

export default [
  ...createPluffaApp(),
  ...pluffaSSR(),
  ...pluffaNodeRender(),
  ...pluffaEdgeRender(),
  ...pluffaBuildTools(),
  ...pluffaEnv(),
  ...pluffaStatik(),
  ...pluffaCrawl(),
  ...pluffaNode(),
  ...pluffaCloudflareWorkers(),
  ...pluffaRouter(),
  ...pluffa(),
]
