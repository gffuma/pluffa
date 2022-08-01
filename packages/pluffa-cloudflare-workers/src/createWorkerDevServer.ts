import webpack, { Configuration } from 'webpack'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { getWebPackClientConfig, createBaseDevServer } from '@pluffa/build-tools'
import { getWebPackWorkerConfig } from './webpack'

type WebPackEntry = Configuration['entry']

export interface createWorkerDevServerOptions {
  clientEntry: WebPackEntry
  clientSourceMapEnabled?: boolean
  workerEntry: string
  publicDir: string | false
  port: number
  useTypescript?: boolean
  miniflareUrl: string
  useSwc?: boolean,
  startMiniFlare(): void
}

export default function createWokerDevServer({
  clientEntry,
  workerEntry,
  useTypescript = false,
  publicDir,
  miniflareUrl,
  startMiniFlare,
  clientSourceMapEnabled = true,
  useSwc = false,
}: createWorkerDevServerOptions) {
  const isProd = false

  const compiler = webpack([
    getWebPackClientConfig({
      isProd,
      clientEntry,
      statikDataUrl: false,
      useTypescript,
      sourceMapEnabled: clientSourceMapEnabled,
      useSwc,
    }),
    getWebPackWorkerConfig({
      isProd,
      useTypescript,
      workerEntry,
      clientEntry,
      useSwc,
    }),
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
