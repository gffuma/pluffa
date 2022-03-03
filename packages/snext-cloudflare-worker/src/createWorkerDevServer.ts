import path from 'path'
import chalk from 'chalk'
import { Log, LogLevel, Miniflare } from 'miniflare'
import webpack from 'webpack'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { getWebPackClientConfig, createBaseDevServer } from '@snext/build-tools'
import { getWebPackWorkerConfig } from './webpack'

export interface createWorkerDevServerOptions {
  clientEntry: string
  workerEntry: string
  publicDir: string | false
  port: number
  useTypescript?: boolean
  miniflareUrl: string
  startMiniFlare(): void
}

export default function createWokerDevServer({
  clientEntry,
  workerEntry,
  useTypescript = false,
  publicDir,
  miniflareUrl,
  startMiniFlare,
}: createWorkerDevServerOptions) {
  const isProd = false

  const compiler = webpack([
    getWebPackClientConfig({
      isProd,
      clientEntry,
      statikDataUrl: false,
      useTypescript,
    }),
    getWebPackWorkerConfig({
      isProd,
      useTypescript,
      workerEntry,
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
