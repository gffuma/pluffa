import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import webpack, { Configuration, EntryObject } from 'webpack'
import { getWebPackRules } from './rules.js'

// Map all native node packages to have empty fallback
const NodeNativeModulesFallbacks: { [index: string]: false } = {
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

type WebPackEntry = Configuration['entry']

export interface GetWebPackClientConfigOptions {
  clientEntry: WebPackEntry
  useTypescript: boolean
  isProd: boolean
  statikDataUrl: string | false
}

function injectHotMiddlewareInEntry(entry: WebPackEntry): WebPackEntry {
  if (entry === undefined) {
    return undefined
  }
  const devEntry =
    'webpack-hot-middleware/client?reload=true&name=client&quiet=true'
  if (typeof entry === 'string') {
    return [devEntry, entry]
  }
  if (Array.isArray(entry)) {
    return [devEntry].concat(devEntry)
  }
  if (typeof entry === 'object' && entry !== null) {
    return Object.keys(entry).reduce((newEntry, name) => {
      const innerEntry = entry[name]
      if (Array.isArray(innerEntry)) {
        newEntry[name] = [devEntry].concat(innerEntry)
      } else if (typeof innerEntry === 'string') {
        newEntry[name] = [devEntry, innerEntry]
      } else {
        newEntry[name] = innerEntry
      }
      return newEntry
    }, {} as EntryObject)
  }
  return entry
}

export function getWebPackClientConfig({
  clientEntry,
  useTypescript,
  isProd,
  statikDataUrl,
}: GetWebPackClientConfigOptions): Configuration {
  return {
    name: 'client',
    mode: isProd ? 'production' : 'development',
    target: 'web',
    entry: isProd ? clientEntry : injectHotMiddlewareInEntry(clientEntry),
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
    output: {
      path: isProd ? path.resolve(process.cwd(), '.snext/client') : undefined,
      filename: isProd
        ? 'static/js/bundle.[name].[contenthash:8].js'
        : 'bundle.[name].js',
      publicPath: '/',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
    },
    module: {
      rules: getWebPackRules({
        isClient: true,
        isProd,
        useTypescript,
      }),
    },
    plugins: [
      // PROD ONLY PLUGINS
      ...(isProd
        ? [
            new MiniCssExtractPlugin({
              filename: 'static/css/[name].[contenthash:8].css',
              chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
          ]
        : []),
      // DEV ONLY PLUGINS
      ...(isProd
        ? []
        : [
            new webpack.HotModuleReplacementPlugin(),
            new ReactRefreshWebpackPlugin(),
          ]),
      new webpack.DefinePlugin({
        'process.env.IS_SNEXT_SERVER': false,
        'process.env.SNEXT_STATIK_BASE_URL':
          statikDataUrl === false ? false : `'${statikDataUrl}'`,
        // Define only env process.env.REACT_APP_*
        ...Object.keys(process.env).reduce((def, key) => {
          if (key.startsWith('REACT_APP_')) {
            def[`process.env.${key}`] = `'${process.env[key]}'`
          }
          return def
        }, {} as Record<string, string>),
      }),
    ],
    optimization: isProd
      ? {
          minimizer: [new CssMinimizerPlugin(), '...'],
        }
      : undefined,
    resolve: {
      extensions: [
        ...['.js', '.mjs', '.jsx'],
        ...(useTypescript ? ['.ts', '.tsx'] : []),
      ],
      // Node modules should only be used server side
      fallback: NodeNativeModulesFallbacks,
    },
  }
}
