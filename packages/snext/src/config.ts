// Share common webpack configurations
import nodeExternals from 'webpack-node-externals'
import { Configuration } from 'webpack'
import path from 'path'
import { createRequire } from 'module'
import { existsSync } from 'fs'
import { pathToFileURL } from 'url'

export function getNodeConfiguration(
  compileNodeCommonJS: boolean
): Configuration {
  if (compileNodeCommonJS) {
    return {
      externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
      externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
      output: {
        path: path.join(process.cwd(), '.snext/node'),
        filename: '[name].js',
        libraryTarget: 'commonjs',
        publicPath: '/',
        assetModuleFilename: 'static/media/[name].[hash][ext]',
      },
    }
  }
  const PreferModuleCache = new Map<string, boolean>()
  const userRequire = createRequire(
    pathToFileURL(path.join(process.cwd(), 'index.js')).href
  )

  // Try to find pkg json path using resolved file path and request string
  function findPkgJsonPath(filePath: string, request: string): string | false {
    const startNodeModules = filePath.lastIndexOf(`node_modules${path.sep}`)
    if (startNodeModules === -1) {
      return false
    }
    const startModules =
      filePath.substring(0, startNodeModules) + 'node_modules'
    let search = path.join(startModules, request)
    if (path.extname(search)) {
      search = path.dirname(search)
    }
    while (search !== startModules) {
      const pkgPath = path.join(search, 'package.json')
      if (existsSync(pkgPath)) {
        return pkgPath
      }
      search = path.dirname(search)
    }
    return false
  }

  return {
    externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
    externals: [
      nodeExternals({
        importType: (request) => {
          let preferModuleImport: boolean
          if (PreferModuleCache.has(request)) {
            preferModuleImport = PreferModuleCache.get(request)!
          } else {
            try {
              // Grab the resolved file path from the dev prespective
              const filePath = userRequire.resolve(request)
              // Return if the type of file requested is explicit
              if (filePath.endsWith('.mjs')) {
                preferModuleImport = true
              } else if (filePath.endsWith('.cjs')) {
                preferModuleImport = false
              } else {
                // Try to locate request pkg
                const pkgPath = findPkgJsonPath(filePath, request)
                if (pkgPath === false) {
                  preferModuleImport = false
                } else {
                  const pkgData = userRequire(pkgPath)
                  preferModuleImport = pkgData?.type === 'module'
                  delete userRequire.cache[pkgPath]
                }
              }
              PreferModuleCache.set(request, preferModuleImport)
            } catch (e: any) {
              if (e.code === 'MODULE_NOT_FOUND') {
                preferModuleImport = false
              } else {
                console.error('SNext error during importType detection')
                console.log(e)
                throw e
              }
            }
          }
          if (preferModuleImport) {
            return 'module ' + request
          } else {
            return 'node-commonjs ' + request
          }
        },
      }),
    ], // in order to ignore all modules in node_modules folder
    externalsType: 'module',
    output: {
      chunkFormat: 'module',
      path: path.join(process.cwd(), '.snext/node'),
      filename: '[name].mjs',
      libraryTarget: 'module',
      publicPath: '/',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
      environment: { module: true },
    },
    experiments: {
      outputModule: true,
    },
  }
}

// Map all native node packages to have empty fallback
export const NodeNativeModulesFallbacks: { [index: string]: false } = {
  fs: false,
  assert: false,
  buffer: false,
  console: false,
  constants: false,
  crypto: false,
  domain: false,
  events: false,
  http: false,
  https: false,
  os: false,
  path: false,
  punycode: false,
  process: false,
  querystring: false,
  stream: false,
  string_decoder: false,
  sys: false,
  timers: false,
  tty: false,
  url: false,
  util: false,
  vm: false,
  zlib: false,
}
