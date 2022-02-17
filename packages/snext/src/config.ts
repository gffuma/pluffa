// Share common webpack configurations
import nodeExternals from 'webpack-node-externals'
import { Configuration } from 'webpack'
import path from 'path'
import { createRequire } from 'module'
import { existsSync, readFileSync } from 'fs'
import { pathToFileURL } from 'url'

interface FoundPkg {
  content: any
  path: string
}

function findPkgInPath(request: string, modulePath: string): FoundPkg | false {
  let search = path.join(modulePath, request)
  if (path.extname(search)) {
    search = path.dirname(search)
  }

  while (search !== modulePath) {
    const pkgPath = path.join(search, 'package.json')
    if (existsSync(pkgPath)) {
      return {
        content: JSON.parse(readFileSync(pkgPath, 'utf-8')),
        path: pkgPath,
      }
    }
    search = path.dirname(search)
  }

  return false
}

function findPkgJson(
  request: string,
  modulesPaths: string[]
): FoundPkg | false {
  for (let modulePath of modulesPaths) {
    const pkg = findPkgInPath(request, modulePath)
    if (pkg !== false) {
      return pkg
    }
  }
  return false
}

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
  // ESM Configuration

  // Lookup of request import and ESM preference
  const PreferModuleCache = new Map<string, boolean>()

  const userRequire = createRequire(
    pathToFileURL(path.join(process.cwd(), 'index.js')).href
  )

  return {
    externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
    externals: [
      nodeExternals({
        importType: (request) => {
          let preferModuleImport: boolean
          if (PreferModuleCache.has(request)) {
            preferModuleImport = PreferModuleCache.get(request)!
          } else {
            const modulesPath = userRequire.resolve.paths(request)
            if (modulesPath === null) {
              preferModuleImport = true
            } else {
              // Prefer ESM when pkg is an ESM module only
              const foundPkg = findPkgJson(request, modulesPath)
              if (foundPkg === false) {
                preferModuleImport = false
              } else {
                preferModuleImport = foundPkg.content.type === 'module'
              }
            }
            PreferModuleCache.set(request, preferModuleImport)
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
