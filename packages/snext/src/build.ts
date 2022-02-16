import { createRequire } from 'module'
import path from 'path'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import webpack, { EntryObject } from 'webpack'
import rimraf from 'rimraf'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { getNodeConfiguration, NodeNativeModulesFallbacks } from './config.js'

const require = createRequire(import.meta.url)

export interface BuildOptions {
  clientEntry: string
  serverComponent: string
  skeletonComponent: string
  registerStatik?: string
  port: number
  compileNodeCommonJS: boolean
  statikDataDir?: string | false
}

export default function build({
  clientEntry,
  serverComponent,
  skeletonComponent,
  registerStatik,
  compileNodeCommonJS = false,
  statikDataDir = 'snextdata',
}: BuildOptions) {
  rimraf.sync(path.resolve(process.cwd(), '.snext'))
  const useTypescript = existsSync(path.resolve(process.cwd(), 'tsconfig.json'))
  const resolveExtesions = [
    ...['.js', '.mjs', '.jsx'],
    ...(useTypescript ? ['.ts', '.tsx'] : []),
  ]
  const nodeConfiguration = getNodeConfiguration(compileNodeCommonJS)
  const nodeEntry: EntryObject = {
    App: serverComponent,
    Skeleton: skeletonComponent,
  }
  if (registerStatik) {
    nodeEntry.statik = registerStatik
  }
  let statikDataUrl = ''
  if (statikDataDir !== false) {
    statikDataUrl = path.normalize(statikDataDir)
    statikDataUrl = statikDataUrl.startsWith('/')
      ? statikDataUrl
      : `/${statikDataUrl}`
  }

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
            oneOf: [
              {
                test: useTypescript
                  ? /\.(js|mjs|jsx|ts|tsx)$/
                  : /\.(js|mjs|jsx)$/,
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
                test: /\.module\.s[ac]ss$/i,
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
                  'sass-loader',
                ],
              },
              {
                test: /\.s[ac]ss$/i,
                exclude: /\.module\.s[ac]ss$/i,
                use: [
                  {
                    loader: MiniCssExtractPlugin.loader,
                  },
                  'css-loader',
                  'sass-loader',
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
              {
                exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                resourceQuery: { not: [/raw/] },
                type: 'asset/resource',
              },
              {
                exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                resourceQuery: /raw/,
                type: 'asset/source',
              },
            ],
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
          'process.env.SNEXT_STATIK_BASE_URL': `'${statikDataUrl}'`,
        }),
      ],
      optimization: {
        minimizer: [new CssMinimizerPlugin()],
      },
      resolve: {
        extensions: resolveExtesions,
        // Node modules should only be used server side
        fallback: NodeNativeModulesFallbacks,
      },
    },
    {
      name: 'server',
      mode: 'production',
      target: 'node',
      entry: nodeEntry,
      ...nodeConfiguration,
      module: {
        rules: [
          {
            oneOf: [
              {
                test: useTypescript
                  ? /\.(js|mjs|jsx|ts|tsx)$/
                  : /\.(js|mjs|jsx)$/,
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
                    plugins: ['macros'],
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
                test: /\.module\.s[ac]ss$/i,
                use: [
                  {
                    loader: require.resolve('css-loader'),
                    options: {
                      modules: {
                        mode: 'local',
                        exportOnlyLocals: true,
                      },
                    },
                  },
                  'sass-loader',
                ],
              },
              {
                test: /\.s[ac]ss$/i,
                exclude: /\.module\.s[ac]ss$/i,
                use: [
                  {
                    loader: require.resolve('css-loader'),
                    options: {
                      modules: {
                        exportOnlyLocals: true,
                      },
                    },
                  },
                  'sass-loader',
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
              {
                exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                resourceQuery: { not: [/raw/] },
                type: 'asset/resource',
                generator: {
                  emit: false,
                },
              },
              {
                exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                resourceQuery: /raw/,
                type: 'asset/source',
              },
            ],
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
