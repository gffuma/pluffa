// Share common webpack configurations
import nodeExternals from 'webpack-node-externals'
import { Configuration } from 'webpack'
import path from 'path'

export const NodeESMConfiguration: Configuration = {
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [
    nodeExternals({
      importType: 'module' as any,
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

export const NodeCommonJSConfiguration: Configuration = {
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
