import { promisify } from 'node:util'
import fs from 'fs/promises'
import { nodeFileTrace } from '@vercel/nft'
import { moduleResolve } from 'import-meta-resolve'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import { Module, MultiStats, Stats } from 'webpack'
import type { StartProdServerOptions } from './startProdServer'
import { NodeConfigWithDefaults } from './config'
import rimrafCB from 'rimraf'
import ncpCB from 'ncp'

const rimraf = promisify(rimrafCB)
const ncp = promisify(ncpCB)

const require = createRequire(import.meta.url)

type ExtType = 'node-commonjs' | 'module'

function getExternalImports(stats: Stats) {
  const externals = new Map<string, ExtType>()

  function recursiveGrabVendors(modules: Module[]) {
    for (const m of modules) {
      const childModules = (m as any).modules as Module[]
      if (Array.isArray(childModules)) {
        recursiveGrabVendors(childModules)
      }
      if (typeof (m as any).externalType === 'string') {
        externals.set((m as any).request, (m as any).externalType)
      }
    }
  }

  for (const chunk of stats.compilation.chunks) {
    recursiveGrabVendors(stats.compilation.chunkGraph.getChunkModules(chunk))
  }

  return externals
}

function getExternalFiles(stats: Stats) {
  // Find externa ES:. import { find } from 'lodash' ... in server code ...
  // using compilation stats
  const externalsLibs = getExternalImports(stats)

  // Resolve external library to correct path ESM vs CommonJS
  const externalsFiles = new Set<string>()
  const sourceNodeModulesPath = path.join(process.cwd(), 'node_modules')

  for (const [ext, type] of externalsLibs.entries()) {
    if (type === 'module') {
      const url = moduleResolve(
        ext,
        new URL(`file://${sourceNodeModulesPath}`),
        new Set(['node', 'import']),
        true
      )
      externalsFiles.add(fileURLToPath(url))
    } else {
      const file = require.resolve(ext, {
        paths: [sourceNodeModulesPath],
      })
      externalsFiles.add(file)
    }
  }

  const nodeRunTimeUrl = moduleResolve(
    '@pluffa/node/runtime',
    new URL(`file://${sourceNodeModulesPath}`),
    new Set(['node', 'import']),
    true
  )
  const nodeRunTimeFile = fileURLToPath(nodeRunTimeUrl)
  externalsFiles.add(nodeRunTimeFile)
  return Array.from(externalsFiles)
}

type TreeMap = Map<string, TreeMap>

export async function copyNodeModules(to: string, nodeModules: string[]) {
  const tree: TreeMap = new Map()
  const flatCopy: { from: string; to: string }[] = []

  nodeModules.forEach((m) => {
    const i = m.indexOf(`node_modules${path.sep}`)
    if (i !== -1) {
      let normalized = m.slice(i)
      if (path.parse(normalized).ext) {
        flatCopy.push({ from: m, to: normalized })
        normalized = path.dirname(normalized)
      }

      let iterTree: TreeMap = tree
      normalized.split(path.sep).forEach((segment, i) => {
        if (i === 0) {
          return
        }
        if (!iterTree.has(segment)) {
          iterTree.set(segment, new Map())
        }
        iterTree = iterTree.get(segment)!
      })
    }
  })

  const nodeModulesTo = path.join(to, 'node_modules')
  await fs.mkdir(nodeModulesTo)

  async function createDirTree(tree: TreeMap, pk?: string) {
    const keys = Array.from(tree.keys())
    const dirs = keys.map((k) => (pk ? path.join(pk, k) : k))

    await Promise.all(dirs.map((d) => fs.mkdir(path.join(nodeModulesTo, d))))

    await Promise.all(
      keys.map((k) => createDirTree(tree.get(k)!, pk ? path.join(pk, k) : k))
    )
  }
  await createDirTree(tree)
  await Promise.all(flatCopy.map((d) => fs.cp(d.from, path.join(to, d.to))))
}

async function createServerRutimeBootstrapFile(
  config: NodeConfigWithDefaults,
  baseDir: string
) {
  // TODO: Unify map user config to start config.
  const serverProdOptions: StartProdServerOptions = {
    // SERVER
    port: config.port,
    proxy: config.useProxyInProd ? config.proxy : undefined,
    publicDir: config.publicDir,
    serveStaticAssets: config.serveStaticAssets,
    // STATIK?
    statikEnabled: Boolean(config.registerStatik),
    statikDataDir: config.statikDataDir,
    // BUNDLING
    compileNodeCommonJS: config.nodeModule === 'commonjs',
  }

  let runTimeTemplateJS: string
  if (config.nodeModule === 'commonjs') {
    runTimeTemplateJS =
      "const { startProdServer } = require('@pluffa/node/runtime');"
    runTimeTemplateJS += '\n' + "const path = require('path');"
  } else {
    runTimeTemplateJS =
      "import { startProdServer } from '@pluffa/node/runtime';"
    runTimeTemplateJS += '\n' + "import path from 'path';"
    runTimeTemplateJS += '\n' + "import { fileURLToPath } from 'url';"
  }
  if (config.nodeModule === 'commonjs') {
    runTimeTemplateJS += '\n' + 'const __standalonedir = __dirname;'
  } else {
    runTimeTemplateJS +=
      '\n' +
      `const __standalonedir = path.dirname(fileURLToPath(import.meta.url));`
  }
  runTimeTemplateJS +=
    '\n' + `const __config = ${JSON.stringify(serverProdOptions)};`
  runTimeTemplateJS +=
    '\n' + `__config.buildDir = path.join(__standalonedir, 'build');`
  runTimeTemplateJS += '\n' + `startProdServer(__config);`

  await fs.writeFile(
    path.join(baseDir, `server.${config.nodeModule === 'esm' ? 'm' : ''}js`),
    runTimeTemplateJS
  )
}

export async function exportStandAlone(
  multiStats: MultiStats,
  config: NodeConfigWithDefaults
) {
  const stats = multiStats.stats.find((s) => s.compilation.name === 'server')!

  // Get all external files from compilation stats
  const externalsFiles = getExternalFiles(stats)

  // ... Now find all related shit!
  const { fileList } = await nodeFileTrace(externalsFiles)

  // Create Base dir structure
  const standAloneDir = path.join(process.cwd(), '.pluffa/standalone')
  const standAloneBuildedDir = path.join(standAloneDir, 'build')

  const nodeBuildedDir = path.join(process.cwd(), '.pluffa/node')
  const clientBuildedDir = path.join(process.cwd(), '.pluffa/client')

  await rimraf(standAloneDir)
  await fs.mkdir(standAloneDir)
  await fs.mkdir(standAloneBuildedDir)
  await ncp(nodeBuildedDir, path.join(standAloneBuildedDir, 'node'))
  await ncp(clientBuildedDir, path.join(standAloneBuildedDir, 'client'))

  // Copy all fucking node_modules tree ... in i think lol optmized way..
  await copyNodeModules(standAloneDir, Array.from(fileList))

  // Finally create the bootstra standalone file!
  await createServerRutimeBootstrapFile(config, standAloneDir)
}
