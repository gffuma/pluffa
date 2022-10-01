import { promisify } from 'node:util'
import fs from 'fs/promises'
import { nodeFileTrace } from '@vercel/nft'
import { moduleResolve } from 'import-meta-resolve'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import { Module, MultiStats, Stats } from 'webpack'
import type { StartProdServerOptions } from './startProdServer'
import { NodeConfig } from './types'
import rimrafCB from 'rimraf'

const rimraf = promisify(rimrafCB)

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

export async function exportStandAlone(
  multiStats: MultiStats,
  config: NodeConfig
) {
  const stats = multiStats.stats.find((s) => s.compilation.name === 'server')!

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

  // ... Now find all related shit!
  const { fileList } = await nodeFileTrace(Array.from(externalsFiles))

  const standAloneDir = path.join(process.cwd(), '.pluffa/standalone')

  await rimraf(standAloneDir)
  await fs.mkdir(standAloneDir)

  await copyNodeModules(standAloneDir, Array.from(fileList))

  // FIXME: Unify this part .....
  const serverProdOptions: StartProdServerOptions = {
    statikDataDir: config.statikDataDir,
    port: config.port,
    publicDir: config.productionServePublicAssets ? config.publicDir : false,
    compileNodeCommonJS: config.nodeModule === 'commonjs',
    statikEnabled: Boolean(config.registerStatik),
    proxy: config.productionProxy,
    serveStaticAssets: config.productionServeStaticAssets,
  }

  let runTimeTemplateJS: string
  if (config.nodeModule === 'commonjs') {
    runTimeTemplateJS = `const { startProdServer } = require('@pluffa/node/runtime');`
  } else {
    runTimeTemplateJS = `import { startProdServer } from '@pluffa/node/runtime';`
  }
  runTimeTemplateJS +=
    '\n' + `startProdServer(${JSON.stringify(serverProdOptions)});`

  await fs.writeFile(
    path.join(
      process.cwd(),
      `.pluffa/standalone/server.${config.nodeModule === 'esm' ? 'm' : ''}js`
    ),
    runTimeTemplateJS
  )
}
