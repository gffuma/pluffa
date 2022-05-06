import chalk from 'chalk'
import { Express } from 'express'
import { createProxyMiddleware, Filter } from 'http-proxy-middleware'
import { createRequire } from 'module'
import path from 'path'
import { renderToString } from 'react-dom/server'
import {
  createBaseDevServer,
  getFlatEntrypointsFromWebPackStats,
} from '@snext/build-tools'
import { fileURLToPath } from 'url'
import { Compiler, MultiCompiler } from 'webpack'
import { Worker } from 'worker_threads'
import ErrorPage from './components/ErrorPage.js'
import render from './render.js'
import runStatik from './runStatik.js'
import vm from 'vm'
import { readFileSync } from 'fs'

async function importVm(path: string) {
  // TODO: Improve use module lol
  const content = readFileSync(path, 'utf-8')
  console.log('co', content)
  const SourceTextModule = (vm as any).SourceTextModule
  const SyntheticModule = (vm as any).SyntheticModule
  const mod = new SourceTextModule(content, {
    initializeImportMeta(meta: any) {
      // Note: this object is created in the top context. As such,
      // Object.getPrototypeOf(import.meta.prop) points to the
      // Object.prototype in the top context rather than that in
      // the contextified object.
      meta.url = path
    },
  })

  await mod.link(async (specifier: any, referencingModule: any) => {
    return new Promise(async (resolve, reject) => {
      const module = await import(specifier)
      const exportNames = Object.keys(module)
      // console.log('N', exportNames)
      console.log('What?', specifier)

      const syntheticModule = new SyntheticModule(exportNames, function (
        this: any
      ) {
        // console.log('SET!')
        // this.setExport('default', { createElement: () => 'Kulo' })
        exportNames.forEach((key) => {
          // console.log('Set', key)
          this.setExport(key, module[key])
        })
      })

      resolve(syntheticModule)
    })
  })
  await mod.evaluate()
  return mod.namespace
}

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
      const { devMiddleware } = res.locals.webpack
      const entrypoints = getFlatEntrypointsFromWebPackStats(
        devMiddleware.stats.toJson(),
        'client'
      )
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
          { url: req.url, entrypoints }
        )
        res.send(`<!DOCTYPE html>${html}`)
      } catch (error) {
        console.error(chalk.red('Error during render'))
        console.error(error)
        const html = renderToString(
          <ErrorPage title="Error during render" error={error as any} />
        )
        res.status(500).send(`<!DOCTYPE html>${html}`)
      }
    })
  } else {
    app.use(async (req, res) => {
      // const SourceTextModule = (vm as any).SourceTextModule
      // const SyntheticModule = (vm as any).SyntheticModule
      // const bar = new SourceTextModule(
      //   `
      //     import React from 'react'
      //     export default function() { return React.createElement('div'); }
      //   `
      // )
      // // // const x = await bar.evalutate()
      // console.log('--->', bar)
      // // await bar.link(() => {})
      // await bar.link(async (specifier: any, referencingModule: any) => {
      //   return new Promise(async (resolve, reject) => {
      //     const module = await import(specifier)
      //     const exportNames = Object.keys(module)
      //     // console.log('N', exportNames)

      //     const syntheticModule = new SyntheticModule(exportNames, function (
      //       this: any
      //     ) {
      //       // console.log('SET!')
      //       // this.setExport('default', { createElement: () => 'Kulo' })
      //       exportNames.forEach((key) => {
      //         // console.log('Set', key)
      //         this.setExport(key, module[key])
      //       })
      //     })

      //     resolve(syntheticModule)
      //   })
      // })
      // await bar.evaluate()
      // // const gang = await bar.evaluate()
      // console.log(bar.namespace.default())
      // // const bar = new vm.Script(`export default function() { return 23; }`)
      // // bar.ev

      const { devMiddleware } = res.locals.webpack
      const entrypoints = getFlatEntrypointsFromWebPackStats(
        devMiddleware.stats.toJson(),
        'client'
      )

      const appPath = path.join(process.cwd(), '.snext/node', 'App.mjs')
      const skeletonPath = path.join(
        process.cwd(),
        '.snext/node',
        'Skeleton.mjs'
      )

      const {
        default: App,
        getStaticProps,
        getSkeletonProps,
      } = await importVm(appPath)
      // console.log('?', App)
      const { default: Skeleton } = await importVm(skeletonPath)
      const html = await render(
        {
          App,
          getStaticProps,
          getSkeletonProps,
          Skeleton,
        },
        { url: req.url, entrypoints }
      )
      res.send(`<!DOCTYPE html>${html}`)

      // res.send('X')

      // const worker = new Worker(
      //   path.resolve(
      //     path.dirname(fileURLToPath(import.meta.url)),
      //     './renderWorker.js'
      //   ),
      //   {
      //     execArgv: [...process.execArgv, '--unhandled-rejections=strict'],
      //     workerData: {
      //       appPath,
      //       skeletonPath,
      //       url: req.url,
      //       entrypoints,
      //     },
      //   }
      // )

      // worker.once('message', (html) => {
      //   res.send(`<!DOCTYPE html>${html}`)
      // })

      // worker.on('error', (error) => {
      //   console.error(chalk.red('Error during render'))
      //   console.error(error)
      //   const html = renderToString(
      //     <ErrorPage title="Error during render" error={error} />
      //   )
      //   res.status(500).send(`<!DOCTYPE html>${html}`)
      // })
    })
  }

  return app
}
