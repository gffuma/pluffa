import {
  createBaseDevServer,
  getWebPackClientConfig,
  getFlatEntrypointsFromWebPackStats,
} from '@pluffa/build-tools'
import { setUpEnv } from '@pluffa/env'
import chalk from 'chalk'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { Log, LogLevel, Miniflare, MiniflareOptions } from 'miniflare'
import path from 'path'
import webpack, { Configuration, ModuleGraph } from 'webpack'
import { getWebPackWorkerConfig } from './webpack'
import { WebPackConfigMapper } from './config'
import { BundleInformation } from '@pluffa/ssr'
import { AsyncSeriesHook } from 'tapable'

type WebPackEntry = Configuration['entry']

async function waitFirstTap(hook: AsyncSeriesHook<any>, name = 'waitFirstTap') {
  let called = false
  return new Promise<void>((resolve) => {
    hook.tap(name, () => {
      if (called) {
        return
      }
      called = true
      resolve()
    })
  })
}

const MINIFLARE_PORT = 8787

const identity = <T>(a: T) => a

export interface StartWorkerDevServerOptions {
  clientEntry: WebPackEntry
  clientSourceMapEnabled?: boolean
  workerEntry: string
  publicDir: string | false
  port: number
  useTypescript: boolean
  miniflareConfig?: MiniflareOptions
  useSwc?: boolean
  useHelpersForClientCode: boolean
  compileClientNodeModules: boolean
  configureWebpackClient?: WebPackConfigMapper
  configureWebpackWorker?: WebPackConfigMapper
}

export default async function startWorkerDevServer({
  clientEntry,
  workerEntry,
  useTypescript,
  publicDir,
  port,
  miniflareConfig = {},
  clientSourceMapEnabled = true,
  useSwc = false,
  useHelpersForClientCode,
  compileClientNodeModules,
  configureWebpackClient = identity,
  configureWebpackWorker = identity,
}: StartWorkerDevServerOptions) {
  const isProd = false
  setUpEnv({ isProd })

  const compiler = webpack([
    configureWebpackClient(
      getWebPackClientConfig({
        isProd,
        clientEntry,
        statikDataUrl: false,
        useTypescript,
        sourceMapEnabled: clientSourceMapEnabled,
        useSwc,
        useHelpersForClientCode,
        compileClientNodeModules,
      })
    ),
    configureWebpackWorker(
      getWebPackWorkerConfig({
        isProd,
        useTypescript,
        workerEntry,
        clientEntry,
        useSwc,
      })
    ),
  ])

  const app = createBaseDevServer({
    compiler,
    publicDir,
  })

  app.use(
    createProxyMiddleware({
      logLevel: 'silent',
      target: `http://localhost:${MINIFLARE_PORT}`,
      changeOrigin: true,
    })
  )
  const clientCompilationHook = compiler.compilers[0].hooks.done
  const serverCompilationHook = compiler.compilers[1].hooks.done

  // let bundleInfo: any
  // let miniStarted = false
  // compiler.compilers[0].hooks.afterDone.promise

  // compiler.compilers[0].hooks.done.tap('injectBundleInfo', async (x) => {
  //   console.log('CLIENT!!')
  // })
  // compiler.compilers[1].hooks.done.tap('startMiniflare', async (x) => {
  //   console.log('___COMPILE__SERVER___', x.compilation.name)
  //   if (bundleInfo) {
  //     bundleInfo.giova++
  //   }
  //   if (miniStarted) {
  //     return
  //   }
  //   miniStarted = true
  //   bundleInfo = { giova: 0 }
  //   const mf = new Miniflare({
  //     scriptPath: path.resolve(process.cwd(), './.pluffa/runtime/worker.js'),
  //     buildWatchPaths: [path.resolve(process.cwd(), './.pluffa/runtime')],
  //     sourceMap: true,
  //     watch: true,
  //     log: new Log(LogLevel.INFO),
  //     wranglerConfigPath: true,
  //     buildCommand: false,
  //     envPath: false,
  //     ...miniflareConfig,
  //     globals: {
  //       'process.env.NODE_ENV': "'development'",
  //       'PLUFFA_BUNDLE': bundleInfo,
  //       ...miniflareConfig.globals,
  //     },
  //   })
  //   const miniServer = await mf.createServer()
  //   miniServer.listen(MINIFLARE_PORT, () => {
  //     console.log(chalk.green(`Worker started on port: ${MINIFLARE_PORT}`))
  //     console.log()
  //     console.log(`http://localhost:${MINIFLARE_PORT}`)
  //   })
  // })

  let BundleInfoSharedGlobal: BundleInformation
  clientCompilationHook.tap('injectBundleInfo', (stats) => {
    const entrypoints = getFlatEntrypointsFromWebPackStats(stats)
    if (!BundleInfoSharedGlobal) {
      BundleInfoSharedGlobal = { entrypoints }
    } else {
      BundleInfoSharedGlobal.entrypoints = entrypoints
    }
  })

  app.listen(port, async () => {
    console.log()
    console.log(chalk.green(`Pluffa.js Dev Server listen on port: ${port}`))
    console.log()
    console.log(`http://localhost:${port}`)
    console.log()
    console.log('Waiting first compilation to start the worker....')
    // Wait first compilation of client and server
    await Promise.all([
      waitFirstTap(serverCompilationHook),
      waitFirstTap(clientCompilationHook),
    ])
    console.log('Client and server compile!!!')
    // Start Miniflare
    const mf = new Miniflare({
      scriptPath: path.resolve(process.cwd(), './.pluffa/runtime/worker.js'),
      buildWatchPaths: [path.resolve(process.cwd(), './.pluffa/runtime')],
      sourceMap: true,
      watch: true,
      log: new Log(LogLevel.INFO),
      wranglerConfigPath: true,
      buildCommand: false,
      envPath: false,
      ...miniflareConfig,
      globals: {
        'process.env.NODE_ENV': "'development'",
        PLUFFA_BUNDLE: BundleInfoSharedGlobal,
        ...miniflareConfig.globals,
      },
    })
    const miniServer = await mf.createServer()
    miniServer.listen(MINIFLARE_PORT, () => {
      console.log(chalk.green(`Worker started on port: ${MINIFLARE_PORT}`))
      console.log()
      console.log(`http://localhost:${MINIFLARE_PORT}`)
    })
  })
}
