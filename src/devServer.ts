import fs from 'fs'
import path from 'path'
import express from 'express'
import webpack from 'webpack'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { createRequire } from 'module'
import { Worker } from 'worker_threads'
import { fileURLToPath } from 'url'
import { NodeCommonJSConfiguration, NodeESMConfiguration } from './config.js'
import render from './render.js'

const require = createRequire(import.meta.url)
export interface DevServerOptions {
  clientEntry: string
  serverComponent: string
  skeletonComponent: string
  publicDir: string
  port: number
  compileNodeCommonJS: boolean
}

export default async function devServer({
  clientEntry,
  serverComponent,
  skeletonComponent,
  port = 7000,
  publicDir = 'public',
  compileNodeCommonJS = false,
}: DevServerOptions) {
  const useTypescript = fs.existsSync(
    path.resolve(process.cwd(), 'tsconfig.json')
  )
  const nodeConfiguration = compileNodeCommonJS
    ? NodeCommonJSConfiguration
    : NodeESMConfiguration

  const resolveExtesions = [
    ...['.js', '.mjs', '.jsx'],
    ...(useTypescript ? ['.ts', '.tsx'] : []),
  ]

  const compiler = webpack([
    {
      name: 'client',
      mode: 'development',
      target: 'web',
      entry: [
        'webpack-hot-middleware/client?reload=true&name=client&quiet=true',
        clientEntry,
      ],
      devtool: 'eval-cheap-module-source-map',
      output: {
        filename: 'bundle.js',
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
                plugins: [require.resolve('react-refresh/babel')],
              },
            },
          },
          {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
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
        new webpack.HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin(),
        new webpack.DefinePlugin({
          'process.env.IS_SNEXT_SERVER': false,
        }),
      ],
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
      mode: 'development',
      target: 'node',
      entry: {
        App: serverComponent,
        Skeleton: skeletonComponent,
      },
      ...nodeConfiguration,
      module: {
        rules: [
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
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

  const app = express()

  app.use(express.static(path.resolve(process.cwd(), publicDir)))

  const instance = webpackDevMiddleware(compiler, {
    writeToDisk: (target) => {
      if (path.relative(process.cwd(), target).startsWith('.snext')) {
        return true
      }
      return false
    },
  })

  app.use(webpackHotMiddleware(compiler))

  app.use(instance)

  if (compileNodeCommonJS) {
    app.use(async (req, res) => {
      const appPath = path.join(process.cwd(), '.snext/node', 'App.js')
      delete require.cache[require.resolve(appPath)]
      const {
        default: App,
        getStaticProps,
        getSkeletonProps,
      } = require(appPath)

      const skeletonPath = path.join(
        process.cwd(),
        '.snext/node',
        'Skeleton.js'
      )
      delete require.cache[require.resolve(skeletonPath)]
      const { default: Skeleton } = require(skeletonPath)
      const html = await render(
        {
          App,
          getStaticProps,
          getSkeletonProps,
          Skeleton,
        },
        { url: req.url, entrypoints: ['bundle.js'] }
      )
      res.send(html)
    })
  } else {
    app.use(async (req, res) => {
      const appPath = path.join(process.cwd(), '.snext/node', 'App.mjs')
      const skeletonPath = path.join(
        process.cwd(),
        '.snext/node',
        'Skeleton.mjs'
      )

      const worker = new Worker(
        path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          './renderWorker.js'
        ),
        {
          workerData: {
            appPath,
            skeletonPath,
            url: req.url,
            entrypoints: ['bundle.js'],
          },
        }
      )

      worker.once('message', (html) => {
        res.send(html)
      })

      worker.once('error', (error) => {
        console.error(error)
      })
    })
  }

  app.listen(port, () => {
    console.log()
    console.log(`SNext.js Dev Server listen on port: ${port}`)
    console.log()
    console.log(`http://localhost:${port}`)
    console.log()
  })
}
