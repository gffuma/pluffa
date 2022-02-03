import { createRequire } from 'module'
import path from 'path'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import webpack from 'webpack'
import rimraf from 'rimraf'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { NodeCommonJSConfiguration, NodeESMConfiguration } from './config.js'

const require = createRequire(import.meta.url)

export interface BuildOptions {
  clientEntry: string
  serverComponent: string
  skeletonComponent: string
  port: number
  compileNodeCommonJS: boolean
}

export default function build({
  clientEntry,
  serverComponent,
  skeletonComponent,
  compileNodeCommonJS = false,
}: BuildOptions) {
  rimraf.sync(path.resolve(process.cwd(), '.snext'))
  const useTypescript = existsSync(path.resolve(process.cwd(), 'tsconfig.json'))
  const resolveExtesions = [
    ...['.js', '.mjs', '.jsx'],
    ...(useTypescript ? ['.ts', '.tsx'] : []),
  ]
  const nodeConfiguration = compileNodeCommonJS
    ? NodeCommonJSConfiguration
    : NodeESMConfiguration
  const compiler = webpack([
    {
      name: 'client',
      mode: 'production',
      target: 'web',
      entry: clientEntry,
      devtool: 'source-map',
      output: {
        path: path.resolve(process.cwd(), '.snext/client'),
        filename: 'static/js/bundle.[contenthash:8].js',
        publicPath: '/',
        assetModuleFilename: 'static/media/[name].[hash][ext]',
      },
      module: {
        rules: [
          {
            test: useTypescript ? /\.(js|mjs|jsx|ts|tsx)$/ : /\.(js|mjs|jsx)$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    'react-app',
                    {
                      runtime: 'automatic',
                      flow: false,
                      typescript: useTypescript,
                    },
                  ],
                ],
              },
            },
          },
          {
            test: /\.module.css$/i,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              {
                loader: require.resolve('css-loader'),
                options: {
                  modules: true,
                },
              },
            ],
          },
          {
            test: /\.css$/i,
            exclude: /\.module.css$/i,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              'css-loader',
            ],
          },
          {
            test: /\.svg$/,
            use: [
              {
                loader: require.resolve('@svgr/webpack'),
                options: {
                  prettier: false,
                  svgo: false,
                  svgoConfig: {
                    plugins: [{ removeViewBox: false }],
                  },
                  titleProp: true,
                  ref: true,
                },
              },
              {
                loader: require.resolve('file-loader'),
                options: {
                  name: 'static/media/[name].[hash].[ext]',
                },
              },
            ],
            issuer: {
              and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
            },
          },
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 10000,
              },
            },
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
        new webpack.DefinePlugin({
          'process.env.IS_SNEXT_SERVER': false,
        }),
      ],
      optimization: {
        minimizer: [new CssMinimizerPlugin()],
      },
      resolve: {
        extensions: resolveExtesions,
        // Node modules should only be used server side
        fallback: {
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
        },
      },
    },
    {
      name: 'server',
      mode: 'production',
      target: 'node',
      entry: {
        App: serverComponent,
        Skeleton: skeletonComponent,
      },
      ...nodeConfiguration,
      module: {
        rules: [
          {
            test: useTypescript ? /\.(js|mjs|jsx|ts|tsx)$/ : /\.(js|mjs|jsx)$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  useTypescript && '@babel/preset-typescript',
                  [
                    '@babel/preset-react',
                    {
                      runtime: 'automatic',
                    },
                  ],
                ].filter(Boolean),
              },
            },
          },
          {
            test: /\.module.css$/i,
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                exportOnlyLocals: true,
              },
            },
          },
          {
            test: /\.css$/i,
            exclude: /\.module.css$/i,
            loader: 'css-loader',
            options: {
              modules: {
                exportOnlyLocals: true,
              },
            },
          },
          {
            test: /\.svg$/,
            use: [
              {
                loader: require.resolve('@svgr/webpack'),
                options: {
                  prettier: false,
                  svgo: false,
                  svgoConfig: {
                    plugins: [{ removeViewBox: false }],
                  },
                  titleProp: true,
                  ref: true,
                },
              },
              {
                loader: require.resolve('file-loader'),
                options: {
                  emitFile: false,
                  name: 'static/media/[name].[hash].[ext]',
                },
              },
            ],
            issuer: {
              and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
            },
          },
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            type: 'asset',
            generator: {
              emit: false,
            },
            parser: {
              dataUrlCondition: {
                maxSize: 10000,
              },
            },
          },
        ],
      },
      resolve: {
        extensions: resolveExtesions,
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.IS_SNEXT_SERVER': true,
        }),
      ],
    },
  ])

  compiler.run(async (err, stats) => {
    if (err) {
      console.error(err.stack || err)
      if ((err as any).details) {
        console.error((err as any).details)
      }
      process.exit(1)
      return
    }
    const info = stats!.toJson()
    if (stats!.hasErrors()) {
      console.log('Build failed.')
      info.errors!.forEach((e) => console.error(e))
      process.exit(1)
    } else {
      const entrypoints =
        info.children![0]!.entrypoints!['main'].assets?.map((a) => a.name) ?? []
      await fs.writeFile(
        path.join(process.cwd(), '.snext/client', 'manifest.json'),
        JSON.stringify({ entrypoints }, null, 2)
      )
    }
  })
}
