import path from 'path'
import { getWebPackRules } from 'snext'
import webpack, { Configuration } from 'webpack'

interface GetWebPackWorkerConfigOptions {
  isProd: boolean
  useTypescript: boolean
  workerEntry: string
}

export function getWebPackWorkerConfig({
  isProd,
  useTypescript,
  workerEntry,
}: GetWebPackWorkerConfigOptions): Configuration {
  return {
    name: 'server',
    mode: isProd ? 'production' : 'development',
    // TODO: Check source maps 4 worker....
    devtool: false,
    target: 'webworker',
    entry: {
      // NOTE: Polyfill setImmediate for React
      worker: ['setimmediate', workerEntry],
    },
    output: {
      path: path.join(process.cwd(), '.snext/runtime'),
      filename: '[name].js',
      publicPath: '/',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
    },
    module: {
      rules: getWebPackRules({
        useTypescript,
        isClient: false,
        isProd,
      }),
    },
    resolve: {
      fallback: {
        stream: 'stream-browserify',
      },
      alias: {
      'react-dom/server.js': 'react-dom/server.node.js',
      },
      extensions: [
        ...['.js', '.mjs', '.jsx'],
        ...(useTypescript ? ['.ts', '.tsx'] : []),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.IS_SNEXT_SERVER': true,
      }),
      new webpack.ProvidePlugin({
        process: 'process',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  }
}
