import webpack, { Configuration } from 'webpack'
import {
  getWebPackClientConfig,
  getWebPackNodeConfig,
} from '@pluffa/build-tools'
import createDevServer from './createDevServer.js'
import chalk from 'chalk'
import { setUpEnv } from '@pluffa/env'
import { WebPackConfigMapper } from './config'

type WebPackEntry = Configuration['entry']

const identity = <T>(a: T) => a

export interface StartDevServerOptions {
  clientEntry: WebPackEntry
  clientSourceMapEnabled?: boolean
  serverComponent: string
  skeletonComponent: string
  statikHandler?: string
  compileNodeCommonJS: boolean
  proxy?: string
  publicDir: string | false
  port: number
  useTypescript: boolean
  useSwc: boolean
  useHelpersForClientCode: boolean
  compileClientNodeModules: boolean
  configureWebpackClient?: WebPackConfigMapper
  configureWebpackServer?: WebPackConfigMapper
}

export default function startDevServer({
  clientEntry,
  clientSourceMapEnabled = true,
  serverComponent,
  skeletonComponent,
  statikHandler,
  compileNodeCommonJS,
  proxy: proxyUrl,
  port,
  publicDir,
  useTypescript,
  useSwc,
  useHelpersForClientCode,
  compileClientNodeModules,
  configureWebpackClient = identity,
  configureWebpackServer = identity,
}: StartDevServerOptions) {
  const isProd = false
  setUpEnv({ isProd })

  const compiler = webpack([
    configureWebpackClient(
      getWebPackClientConfig({
        isProd,
        useTypescript,
        clientEntry,
        statikDataUrl: false,
        sourceMapEnabled: clientSourceMapEnabled,
        useSwc,
        useHelpersForClientCode,
        compileClientNodeModules,
      })
    ),
    configureWebpackServer(
      getWebPackNodeConfig({
        isProd,
        useTypescript,
        compileNodeCommonJS,
        serverComponent,
        skeletonComponent,
        statikHandler,
        useSwc,
      })
    ),
  ])

  const app = createDevServer({
    compileNodeCommonJS,
    compiler,
    proxyUrl,
    statikEnabled: Boolean(statikHandler),
    publicDir,
  })

  app.listen(port, () => {
    console.log()
    console.log(chalk.green(`Pluffa.js Dev Server listen on port: ${port}`))
    console.log()
    console.log(`http://localhost:${port}`)
    console.log()
  })
}
