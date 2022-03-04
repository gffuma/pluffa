import path from 'path'
import chalk from 'chalk'
import { Log, LogLevel, Miniflare, MiniflareOptions } from 'miniflare'
import createWorkerDevServer from './createWorkerDevServer'

export interface StartWorkerDevServerOptions {
  clientEntry: string
  workerEntry: string
  publicDir: string | false
  port: number
  useTypescript: boolean
  miniflareConfig?: MiniflareOptions
}

const MINIFLARE_PORT = 8787

export default function startWokerDevServer({
  clientEntry,
  workerEntry,
  useTypescript,
  publicDir,
  port,
  miniflareConfig = {},
}: StartWorkerDevServerOptions) {
  const app = createWorkerDevServer({
    port,
    clientEntry,
    workerEntry,
    publicDir,
    miniflareUrl: `http://localhost:${MINIFLARE_PORT}`,
    startMiniFlare: async () => {
      const mf = new Miniflare({
        scriptPath: path.resolve(process.cwd(), './.snext/runtime/worker.js'),
        buildWatchPaths: [path.resolve(process.cwd(), './.snext/runtime')],
        sourceMap: true,
        watch: true,
        log: new Log(LogLevel.INFO),
        globals: {
          'process.env.NODE_ENV': "'development'",
          ...miniflareConfig.globals,
        },
        logUnhandledRejections: true,
        ...miniflareConfig,
      })
      const miniServer = await mf.createServer()
      miniServer.listen(MINIFLARE_PORT, () => {
        console.log(chalk.green(`Worker started on port: ${MINIFLARE_PORT}`))
        console.log()
        console.log(`http://localhost:${MINIFLARE_PORT}`)
      })
    },
    useTypescript,
  })

  app.listen(port, () => {
    console.log()
    console.log(chalk.green(`SNext.js Dev Server listen on port: ${port}`))
    console.log()
    console.log(`http://localhost:${port}`)
    console.log()
    console.log('Waiting first compilation to start the worker....')
  })
}
