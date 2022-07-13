import sourceMap from 'source-map-support'
import chalk from 'chalk'
import { Express } from 'express'
import { createProxyMiddleware, Filter } from 'http-proxy-middleware'
import { createRequire } from 'module'
import path from 'path'
import { renderToString } from 'react-dom/server'
import {
  createBaseDevServer,
  getFlatEntrypointsFromWebPackStats,
} from '@pluffa/build-tools'
import { Compiler, MultiCompiler } from 'webpack'
import ErrorPage from './components/ErrorPage.js'
import render from './render.js'
import importVm from './importVm.js'
import { RegisterStatik, StatikRequest } from './statikRuntime.js'

const require = createRequire(import.meta.url)

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
    ? async () => require('./statikRuntime.cjs')
    : async () => await import('./statikRuntime.js')

  const getFreshRegiterStatik = compileNodeCommonJS
    ? // Use require to have CommonJS version of register statik
      async () => {
        const statikPath = path.join(buildedNodeDir, 'statik.js')
        delete require.cache[require.resolve(statikPath)]
        const { default: registerStatik } = require(statikPath)
        return registerStatik
      }
    : // Use VM To have fresh ESM module
      async () => {
        const statikPath = path.join(buildedNodeDir, 'statik.mjs')
        const { default: registerStatik } = await importVm(statikPath)
        return registerStatik
      }

  // Serving Statik API
  if (statikEnabled) {
    app.use('/__pluffastatik', async (req, res) => {
      try {
        const { runStatik, configureRegisterStatik } = await getStatikRunTime()
        const registerStatik = await getFreshRegiterStatik()
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

  // Get user compiled pluffa runtime
  const getFreshRunTime = compileNodeCommonJS
    ? async () => {
        const appPath = path.join(buildedNodeDir, 'App.js')
        delete require.cache[require.resolve(appPath)]
        const {
          default: App,
          getStaticProps,
          getSkeletonProps,
        } = require(appPath)
        const skeletonPath = path.join(buildedNodeDir, 'Skeleton.js')
        delete require.cache[require.resolve(skeletonPath)]
        const { default: Skeleton } = require(skeletonPath)
        return {
          App,
          Skeleton,
          getStaticProps,
          getSkeletonProps,
        }
      }
    : async () => {
        const appPath = path.join(buildedNodeDir, 'App.mjs')
        const {
          default: App,
          getStaticProps,
          getSkeletonProps,
        } = await importVm(appPath)
        const skeletonPath = path.join(buildedNodeDir, 'Skeleton.mjs')
        const { default: Skeleton } = await importVm(skeletonPath)
        return {
          App,
          Skeleton,
          getStaticProps,
          getSkeletonProps,
        }
      }

  app.use(async (req, res) => {
    const { devMiddleware } = res.locals.webpack
    const entrypoints = getFlatEntrypointsFromWebPackStats(
      devMiddleware.stats.toJson(),
      'client'
    )
    try {
      if (statikEnabled) {
        const { configureRegisterStatik } = await getStatikRunTime()
        const registerStatik = await getFreshRegiterStatik()
        configureRegisterStatik(registerStatik)
      }
      const { App, Skeleton, getStaticProps, getSkeletonProps } =
        await getFreshRunTime()
      const html = await render(
        {
          App,
          getStaticProps,
          getSkeletonProps,
          Skeleton,
          onError: (renderingError) => {
            console.log(chalk.red('Error during server rendering'))
            console.log(renderingError)
          },
        },
        { url: req.url, entrypoints }
      )
      res.send(`<!DOCTYPE html>${html}`)
    } catch (error) {
      console.error(chalk.red('Fatal error while rendering'))
      console.error(error)
      const html = renderToString(
        <ErrorPage title="Fatal error while rendering" error={error as any} />
      )
      res.status(500).send(`<!DOCTYPE html>${html}`)
    }
  })
  return app
}
