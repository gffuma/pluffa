import chalk from 'chalk'
import { Express } from 'express'
import { createProxyMiddleware, Filter } from 'http-proxy-middleware'
import { createRequire } from 'module'
import path from 'path'
import { renderToString } from 'react-dom/server'
import { createBaseDevServer } from '@snext/build-tools'
import { fileURLToPath } from 'url'
import { Compiler, MultiCompiler } from 'webpack'
import { Worker } from 'worker_threads'
import ErrorPage from './components/ErrorPage.js'
import render from './render.js'
import runStatik from './runStatik.js'

const require = createRequire(import.meta.url)

export interface CreateDevServerOptions {
  compiler: Compiler | MultiCompiler
  publicDir: string | false
  registerStatik?: string
  compileNodeCommonJS: boolean
  proxyUrl?: string
}

export default function createDevServer({
  compiler,
  publicDir,
  registerStatik,
  compileNodeCommonJS,
  proxyUrl,
}: CreateDevServerOptions): Express {
  const app = createBaseDevServer({
    compiler,
    publicDir,
  })

  if (registerStatik) {
    if (compileNodeCommonJS) {
      app.use('/__snextstatik', async (req, res) => {
        try {
          const statikPath = path.join(
            process.cwd(),
            '.snext/node',
            'statik.js'
          )
          const { default: registerStatik } = require(statikPath)
          delete require.cache[require.resolve(statikPath)]
          const data = await runStatik(
            {
              method: req.method,
              body: req.body,
              url: req.url,
            },
            registerStatik
          )
          res.send(data)
        } catch (error: any) {
          if (error.status === 404) {
            res
              .status(404)
              .send(renderToString(<ErrorPage title="404 o.O" error={error} />))
            return
          }
          console.error(chalk.red('Error during render'))
          console.error(error)
          res
            .status(500)
            .send(
              renderToString(
                <ErrorPage title="Error during render" error={error as any} />
              )
            )
        }
      })
    } else {
      app.use('/__snextstatik', async (req, res) => {
        const statikPath = path.join(process.cwd(), '.snext/node', 'statik.mjs')
        const worker = new Worker(
          path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            './statikWorker.js'
          ),
          {
            execArgv: [...process.execArgv, '--unhandled-rejections=strict'],
            workerData: {
              statikPath,
              method: req.method,
              body: req.body,
              url: req.url,
            },
          }
        )

        worker.once('message', (data) => {
          res.send(data)
        })

        worker.on('error', (error: any) => {
          if (error.status === 404) {
            res
              .status(404)
              .send(renderToString(<ErrorPage title="404 o.O" error={error} />))
            return
          }
          console.error(chalk.red('Error in serving statik data'))
          console.error(error)
          res
            .status(500)
            .send(
              renderToString(
                <ErrorPage
                  title="500 Error in serving statik data"
                  error={error}
                />
              )
            )
        })
      })
    }
  }

  if (proxyUrl) {
    const filterPorxy: Filter = (_, req) => {
      return (
        req.method !== 'GET' ||
        Boolean(req.headers.accept && !req.headers.accept.includes('text/html'))
      )
    }
    app.use(
      createProxyMiddleware(filterPorxy, {
        logLevel: 'silent',
        target: proxyUrl,
        changeOrigin: true,
      })
    )
  }

  if (compileNodeCommonJS) {
    app.use(async (req, res) => {
      try {
        const appPath = path.join(process.cwd(), '.snext/node', 'App.js')
        delete require.cache[require.resolve(appPath)]
        // NOTE: Delete also require cache of statik
        if (registerStatik) {
          const statikPath = path.join(
            process.cwd(),
            '.snext/node',
            'statik.js'
          )
          delete require.cache[require.resolve(statikPath)]
        }
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
      } catch (error) {
        console.error(chalk.red('Error during render'))
        console.error(error)
        res
          .status(500)
          .send(
            renderToString(
              <ErrorPage title="Error during render" error={error as any} />
            )
          )
      }
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
          execArgv: [...process.execArgv, '--unhandled-rejections=strict'],
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

      worker.on('error', (error) => {
        console.error(chalk.red('Error during render'))
        console.error(error)
        res
          .status(500)
          .send(
            renderToString(
              <ErrorPage title="Error during render" error={error} />
            )
          )
      })
    })
  }

  return app
}
