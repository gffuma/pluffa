import sourceMap from 'source-map-support'
import chalk from 'chalk'
import { Express, Response } from 'express'
import { createProxyMiddleware, Filter } from 'http-proxy-middleware'
import { createRequire } from 'module'
import path from 'path'
import { renderToString } from 'react-dom/server'
import {
  createBaseDevServer,
  getFlatEntrypointsFromWebPackStats,
} from '@pluffa/build-tools'
import type { ServerComponent, SkeletonComponent } from '@pluffa/ssr'
import { Compiler, MultiCompiler, MultiStats } from 'webpack'
import ErrorPage from './components/ErrorPage'
import { RegisterStatik, StatikRequest } from '@pluffa/statik/runtime'
import { createHotModule, HotModule } from './hotModule'
import type { GetServerData } from './types'
import { handleSSR } from './handleSSR'

const require = createRequire(import.meta.url)

function handleFatalSSRError(error: any, res: Response) {
  console.error(chalk.red('Fatal server error'))
  console.error(error)
  const html = renderToString(
    <ErrorPage title="Fatal server error" error={error as any} />
  )
  if (!res.headersSent) {
    res.status(500)
  }
  res.write(`<!DOCTYPE html>${html}`)
  res.end()
}

export interface CreateDevServerOptions {
  compiler: Compiler | MultiCompiler
  publicDir: string | false
  statikEnabled?: boolean
  compileNodeCommonJS: boolean
  proxyUrl?: string
}

export default function createDevServer({
  compiler,
  publicDir,
  statikEnabled = false,
  compileNodeCommonJS,
  proxyUrl,
}: CreateDevServerOptions): Express {
  sourceMap.install({ emptyCacheBetweenOperations: true })

  const app = createBaseDevServer({
    compiler,
    publicDir,
  })

  // The ouput dir where bundler write user node code
  const buildedNodeDir = path.join(process.cwd(), '.pluffa/node')

  // NOTE: We Inject the current user code for registerStatik
  // to inject into the correct version CommonJS vs ESM
  // we also import the correct version of statik runtime
  const getStatikRunTime: () => Promise<{
    runStatik<T = any>(req: StatikRequest): Promise<T>
    configureRegisterStatik(register: RegisterStatik): void
  }> = compileNodeCommonJS
    ? async () => require('@pluffa/statik/runtime')
    : async () => await import('@pluffa/statik/runtime')

  // User's modules thath should hot reloaded during dev
  const statikHotModule = createHotModule<{
    default: RegisterStatik
  }>(buildedNodeDir, 'statik', compileNodeCommonJS)

  const serverHotModule = createHotModule<{
    default: ServerComponent
    getServerData?: GetServerData
  }>(buildedNodeDir, 'Server', compileNodeCommonJS)

  const skeletonHotModule = createHotModule<{
    default: SkeletonComponent
  }>(buildedNodeDir, 'Skeleton', compileNodeCommonJS)

  const serverCompiler = (compiler as MultiCompiler).compilers.find(
    (c) => c.name === 'server'
  )
  // Refresh hot modules when compiler emit them!
  if (serverCompiler) {
    const hotModules: HotModule<unknown>[] = [
      serverHotModule,
      skeletonHotModule,
    ]
    if (statikEnabled) {
      hotModules.push(statikHotModule)
    }
    serverCompiler.hooks.afterDone.tap('realodServerCode', (stats) => {
      const emittedAssets = stats.compilation.emittedAssets
      hotModules.forEach((m) => {
        if (emittedAssets.has(m.name)) {
          m.refresh()
        }
      })
    })
  }

  // Serving Statik API
  if (statikEnabled) {
    app.use('/__pluffastatik', async (req, res) => {
      try {
        const { runStatik, configureRegisterStatik } = await getStatikRunTime()
        const { default: registerStatik } = await statikHotModule.get()
        // Configure global statik hook
        configureRegisterStatik(registerStatik)
        // Run them!
        const data = await runStatik({
          method: req.method,
          body: req.body,
          url: req.url,
        })
        res.send(data)
      } catch (error: any) {
        if (error.status === 404) {
          const html = renderToString(
            <ErrorPage title="404 o.O" error={error} />
          )
          res.status(404).send(`<!DOCTYPE html>${html}`)
          return
        }
        const html = renderToString(
          <ErrorPage
            title="Error during processing statik handler"
            error={error as any}
          />
        )
        console.error(chalk.red('Error during processing statik handler'))
        console.error(error)
        res.status(500).send(`<!DOCTYPE html>${html}`)
      }
    })
  }

  // Set Up Proxy
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

  // Finally Server Rendering React App
  app.use(async (req, res) => {
    const { devMiddleware } = res.locals.webpack
    const multiStats = devMiddleware.stats as MultiStats
    const entrypoints = getFlatEntrypointsFromWebPackStats(multiStats, 'client')
    const bundle = { entrypoints }
    try {
      if (statikEnabled) {
        const { configureRegisterStatik } = await getStatikRunTime()
        const { default: registerStatik } = await statikHotModule.get()
        configureRegisterStatik(registerStatik)
      }
      const { default: Server, getServerData } = await serverHotModule.get()
      const { default: Skeleton } = await skeletonHotModule.get()
      await handleSSR(
        req,
        res,
        {
          Server,
          Skeleton,
          getServerData,
          bundle,
        },
        {
          handleFatalSSRError,
        }
      )
    } catch (error) {
      // Compilation error or run time error before rendering
      console.error(chalk.red('Uncaught Exception when handle ssr request'))
      console.error(error)
      handleFatalSSRError(error, res)
    }
  })
  return app
}
