import path from 'path'
import { getWebPackRules } from '@snext/build-tools'
import { createRequire } from 'module'
import webpack, { Configuration } from 'webpack'

const require = createRequire(import.meta.url)

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
    devtool: isProd ? false : 'cheap-module-source-map',
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
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
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
        // process: require.resolve('process/browser'),
        // util: require.resolve('util/'),
      },
      alias: {
        'react-dom/server': 'react-dom/server.node',
      },
      extensions: [
        ...['.js', '.mjs', '.jsx'],
        ...(useTypescript ? ['.ts', '.tsx'] : []),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.IS_SNEXT_SERVER': true,
        ...(isProd
          ? {}
          : {
              SNEXT_BUNDLE_ENTRYPOINTS: "['bundle.js']",
            }),
      }),
      new webpack.ProvidePlugin({
        process: 'process',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  }
}
