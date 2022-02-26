import path from 'path'
import { Log, LogLevel, Miniflare } from 'miniflare'
import webpack from 'webpack'
import proxy from 'express-http-proxy'
import { getWebPackClientConfig, createBaseDevServer } from 'snext'
import { getWebPackWorkerConfig } from './webpack'

export interface StartWorkerDevServerOptions {
  clientEntry: string
  workerEntry: string
  publicDir: string | false
  port: number
  useTypescript: boolean
}

const MINIFLARE_PORT = 8787

async function startMiniFlare() {
  const mf = new Miniflare({
    scriptPath: path.resolve(process.cwd(), './.snext/runtime/worker.js'),
    buildWatchPaths: [path.resolve(process.cwd(), './.snext/runtime')],
    watch: true,
    log: new Log(LogLevel.INFO),
    globals: {
      'process.env.NODE_ENV': "'development'",
    },
    logUnhandledRejections: true,
  })
  const server = await mf.createServer()
  server.listen(MINIFLARE_PORT, () => {
    console.log(`Listening on http://localhost:${MINIFLARE_PORT}`)
  })
}

export default function startWokerDevServer({
  clientEntry,
  workerEntry,
  useTypescript,
  publicDir,
  port,
}: StartWorkerDevServerOptions) {
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

  app.use(proxy(`http://localhost:${MINIFLARE_PORT}`))

  app.listen(port, () => {
    console.log('~.~')
  })

  let miniStarted = false
  compiler.compilers[1].hooks.done.tap('startMiniflare', () => {
    if (miniStarted) {
      return
    }
    miniStarted = true
    startMiniFlare()
  })
}
