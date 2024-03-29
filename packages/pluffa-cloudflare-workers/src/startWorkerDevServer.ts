import path from 'path'
import chalk from 'chalk'
import { Configuration } from 'webpack'
import { Log, LogLevel, Miniflare, MiniflareOptions } from 'miniflare'
import { setUpEnv } from '@pluffa/env'
import createWorkerDevServer from './createWorkerDevServer'
import { WebPackConfigMapper } from './config'

type WebPackEntry = Configuration['entry']

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

const MINIFLARE_PORT = 8787

export default function startWorkerDevServer({
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
  configureWebpackClient,
  configureWebpackWorker,
}: StartWorkerDevServerOptions) {
  setUpEnv({ isProd: false })
  const app = createWorkerDevServer({
    port,
    clientEntry,
    clientSourceMapEnabled,
    workerEntry,
    publicDir,
    useSwc,
    useHelpersForClientCode,
    compileClientNodeModules,
    miniflareUrl: `http://localhost:${MINIFLARE_PORT}`,
    startMiniFlare: async () => {
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
          ...miniflareConfig.globals,
        },
      })
      const miniServer = await mf.createServer()
      miniServer.listen(MINIFLARE_PORT, () => {
        console.log(chalk.green(`Worker started on port: ${MINIFLARE_PORT}`))
        console.log()
        console.log(`http://localhost:${MINIFLARE_PORT}`)
      })
    },
    useTypescript,
    configureWebpackClient,
    configureWebpackWorker,
  })

  app.listen(port, () => {
    console.log()
    console.log(chalk.green(`Pluffa.js Dev Server listen on port: ${port}`))
    console.log()
    console.log(`http://localhost:${port}`)
    console.log()
    console.log('Waiting first compilation to start the worker....')
  })
}
