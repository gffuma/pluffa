import path from 'path'
import fs from 'fs/promises'
import webpack from 'webpack'
import rimraf from 'rimraf'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import nodeExternals from 'webpack-node-externals'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'

export interface BuildOptions {
  clientEntry: string
  serverComponent: string
  skeletonComponent: string
  port: number
}

export default function build({
  clientEntry,
  serverComponent,
  skeletonComponent,
}: BuildOptions) {
  rimraf.sync(path.resolve(process.cwd(), '.snext'))
  const compiler = webpack([
    {
      name: 'client',
      mode: 'production',
      target: 'web',
      entry: clientEntry,
      output: {
        path: path.resolve(process.cwd(), '.snext/client'),
        filename: 'static/js/bundle.[contenthash:8].js',
        publicPath: '/',
        assetModuleFilename: 'static/media/[name].[hash][ext]',
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    'react-app',
                    {
                      runtime: 'automatic',
                    },
                  ],
                ],
              },
            },
          },
          {
            test: /\.css$/i,
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
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-react',
                    {
                      runtime: 'automatic',
                    },
                  ],
                ],
              },
            },
          },
          {
            test: /\.css$/i,
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
