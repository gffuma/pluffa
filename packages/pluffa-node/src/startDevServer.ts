import webpack, { Configuration } from 'webpack'
import {
  getWebPackClientConfig,
  getWebPackNodeConfig,
} from '@pluffa/build-tools'
import createDevServer from './createDevServer.js'
import chalk from 'chalk'
import { setUpEnv } from '@pluffa/env'

type WebPackEntry = Configuration['entry']

export interface StartDevServerOptions {
  clientEntry: WebPackEntry
  clientSourceMapEnabled?: boolean
  serverComponent: string
  skeletonComponent: string
  registerStatik?: string
  compileNodeCommonJS: boolean
  proxy?: string
  publicDir: string | false
  port: number
  useTypescript: boolean
  useSwc?: boolean
}

export default function startDevServer({
  clientEntry,
  clientSourceMapEnabled = true,
  serverComponent,
  skeletonComponent,
  registerStatik,
  compileNodeCommonJS,
  proxy: proxyUrl,
  port,
  publicDir,
  useTypescript,
  useSwc = false,
}: StartDevServerOptions) {
  const isProd = false
  setUpEnv({ isProd })

  const compiler = webpack([
    getWebPackClientConfig({
      isProd,
      useTypescript,
      clientEntry,
      statikDataUrl: false,
      sourceMapEnabled: clientSourceMapEnabled,
      useSwc,
    }),
    getWebPackNodeConfig({
      isProd,
      useTypescript,
      compileNodeCommonJS,
      serverComponent,
      skeletonComponent,
      registerStatik,
      useSwc,
    }),
  ])

  const app = createDevServer({
    compileNodeCommonJS,
    compiler,
    proxyUrl,
    statikEnabled: Boolean(registerStatik),
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
