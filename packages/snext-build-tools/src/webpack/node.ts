import path from 'path'
import { createRequire } from 'module'
import { pathToFileURL } from 'url'
import webpack, { Configuration, EntryObject } from 'webpack'
import nodeExternals from 'webpack-node-externals'
import { getWebPackRules } from './rules.js'
import { findPkgJson } from './utils.js'

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

export interface GetWebPackNodeConfigOptions {
  serverComponent: string
  skeletonComponent: string
  registerStatik?: string
  compileNodeCommonJS: boolean
  useTypescript: boolean
  isProd: boolean
}

export function getWebPackNodeConfig({
  useTypescript,
  serverComponent,
  skeletonComponent,
  registerStatik,
  compileNodeCommonJS,
  isProd,
}: GetWebPackNodeConfigOptions): Configuration {
  const entry: EntryObject = {
    App: serverComponent,
    Skeleton: skeletonComponent,
  }
  if (registerStatik) {
    entry.statik = registerStatik
  }
  return {
    name: 'server',
    mode: isProd ? 'production' : 'development',
    // TODO: Check node support for source map in prod ....
    devtool: isProd ? false : 'eval-cheap-module-source-map',
    target: 'node',
    entry,
    ...getNodeConfiguration(compileNodeCommonJS),
    module: {
      rules: getWebPackRules({
        useTypescript,
        isClient: false,
        isProd,
      }),
    },
    resolve: {
      extensions: [
        ...['.js', '.mjs', '.jsx'],
        ...(useTypescript ? ['.ts', '.tsx'] : []),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.IS_SNEXT_SERVER': true,
      }),
    ],
  }
}
