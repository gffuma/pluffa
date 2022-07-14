import path from 'path'
import { getWebPackRules } from '@pluffa/build-tools'
import webpack, { Configuration } from 'webpack'

type WebPackEntry = Configuration['entry']

interface GetWebPackWorkerConfigOptions {
  isProd: boolean
  useTypescript: boolean
  workerEntry: string
  clientEntry: WebPackEntry
}

// NOTE: For now we stick to this very ugly workaround we calculate
// the clientEntry we handle only simple case ... in future we can expose
// an api with webpack stats and read it from worker ...
// but for now ... Meglio Fatto Che Perfetto
function naiveCalculateEntryPoints(
  clientEntry: WebPackEntry
): Record<string, string[]> {
  if (typeof clientEntry === 'string') {
    return {
      main: ['bundle.main.js'],
    }
  }
  if (typeof clientEntry === 'object' && clientEntry !== null) {
    return Object.keys(clientEntry).reduce((flat, name) => {
      flat[name] = [`bundle.${name}.js`]
      return flat
    }, {} as Record<string, string[]>)
  }
  throw new Error(`Can't calculate entrypoints for entry configuration`)
}

export function getWebPackWorkerConfig({
  isProd,
  useTypescript,
  workerEntry,
  clientEntry,
}: GetWebPackWorkerConfigOptions): Configuration {
  return {
    name: 'server',
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'cheap-module-source-map',
    target: 'webworker',
    entry: {
      worker: workerEntry,
    },
    output: {
      path: path.join(process.cwd(), '.pluffa/runtime'),
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
      extensions: [
        ...['.js', '.mjs', '.jsx'],
        ...(useTypescript ? ['.ts', '.tsx'] : []),
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          IS_PLUFFA_SERVER: true,
          // Define only env process.env.REACT_APP_*
          ...Object.keys(process.env).reduce((def, key) => {
            if (key.startsWith('REACT_APP_')) {
              def[key] = JSON.stringify(process.env[key])
            }
            return def
          }, {} as Record<string, string>),
        },
        ...(isProd
          ? {}
          : {
              PLUFFA_BUNDLE_ENTRYPOINTS: JSON.stringify(
                naiveCalculateEntryPoints(clientEntry)
              ),
            }),
      }),
    ],
  }
}
