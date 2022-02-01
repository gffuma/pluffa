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
    libraryTarget: 'umd',
    libraryExport: 'default',
    publicPath: '/',
    assetModuleFilename: 'static/media/[name].[hash][ext]',
  },
}
