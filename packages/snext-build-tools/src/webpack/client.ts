import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import webpack, { Configuration } from 'webpack'
import { getWebPackRules } from './rules.js'
import { B } from './utils.js'

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

export interface GetWebPackClientConfigOptions {
  clientEntry: string
  useTypescript: boolean
  isProd: boolean
  statikDataUrl: string | false
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
    entry: [
      !isProd &&
        'webpack-hot-middleware/client?reload=true&name=client&quiet=true',
      clientEntry,
    ].filter(B),
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
    output: {
      path: isProd ? path.resolve(process.cwd(), '.snext/client') : undefined,
      filename: isProd ? 'static/js/bundle.[contenthash:8].js' : 'bundle.js',
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
      }),
    ],
    optimization: isProd
      ? {
          minimizer: [new CssMinimizerPlugin()],
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