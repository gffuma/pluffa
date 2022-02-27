import path from 'path'
import chalk from 'chalk'
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
    sourceMap: true,
    watch: true,
    log: new Log(LogLevel.INFO),
    globals: {
      'process.env.NODE_ENV': "'development'",
    },
    logUnhandledRejections: true,
  })
  const server = await mf.createServer()
  server.listen(MINIFLARE_PORT, () => {
    console.log(chalk.green(`Worker started on port: ${MINIFLARE_PORT}`))
    console.log()
    console.log(`http://localhost:${MINIFLARE_PORT}`)
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

  let miniStarted = false

  app.listen(port, () => {
    console.log()
    console.log(chalk.green(`SNext.js Dev Server listen on port: ${port}`))
    console.log()
    console.log(`http://localhost:${port}`)
    console.log()
    if (!miniStarted) {
      console.log('Waiting first compilation to start the worker....')
    }
  })

  compiler.compilers[1].hooks.done.tap('startMiniflare', () => {
    if (miniStarted) {
      return
    }
    miniStarted = true
    startMiniFlare()
  })
}
