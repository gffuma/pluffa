import webpack, { Configuration } from 'webpack'
import { createProxyMiddleware } from 'http-proxy-middleware'
import {
  getWebPackClientConfig,
  createBaseDevServer,
} from '@pluffa/build-tools'
import { getWebPackWorkerConfig } from './webpack'
import { WebPackConfigMapper } from './config'

type WebPackEntry = Configuration['entry']

const identity = <T>(a: T) => a

export interface createWorkerDevServerOptions {
  clientEntry: WebPackEntry
  clientSourceMapEnabled?: boolean
  workerEntry: string
  publicDir: string | false
  port: number
  useTypescript?: boolean
  miniflareUrl: string
  useSwc?: boolean
  useHelpersForClientCode: boolean
  compileClientNodeModules: boolean
  startMiniFlare(): void
  configureWebpackClient?: WebPackConfigMapper
  configureWebpackWorker?: WebPackConfigMapper
}

export default function createWorkerDevServer({
  clientEntry,
  workerEntry,
  useTypescript = false,
  publicDir,
  miniflareUrl,
  startMiniFlare,
  clientSourceMapEnabled = true,
  useSwc = false,
  useHelpersForClientCode,
  compileClientNodeModules,
  configureWebpackClient = identity,
  configureWebpackWorker = identity,
}: createWorkerDevServerOptions) {
  const isProd = false

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
      target: miniflareUrl,
      changeOrigin: true,
    })
  )

  let miniStarted = false

  compiler.compilers[1].hooks.done.tap('startMiniflare', () => {
    if (miniStarted) {
      return
    }
    miniStarted = true
    startMiniFlare()
  })

  return app
}
