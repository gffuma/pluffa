import webpack from 'webpack'
import {
  getWebPackClientConfig,
  getWebPackNodeConfig,
} from '@snext/build-tools'
import createDevServer from './createDevServer.js'
import chalk from 'chalk'

export interface StartDevServerOptions {
  clientEntry: string
  serverComponent: string
  skeletonComponent: string
  registerStatik?: string
  compileNodeCommonJS: boolean
  proxyUrl?: string
  publicDir: string | false
  port: number
  useTypescript: boolean
}

export default function startDevServer({
  clientEntry,
  serverComponent,
  skeletonComponent,
  registerStatik,
  compileNodeCommonJS,
  proxyUrl,
  port,
  publicDir,
  useTypescript
}: StartDevServerOptions) {
  process.env.SNEXT_COMPILE_NODE_COMMONJS = compileNodeCommonJS ? '1' : ''
  const isProd = false

  const compiler = webpack([
    getWebPackClientConfig({
      isProd,
      useTypescript,
      clientEntry,
      statikDataUrl: false,
    }),
    getWebPackNodeConfig({
      isProd,
      useTypescript,
      compileNodeCommonJS,
      serverComponent,
      skeletonComponent,
      registerStatik,
    }),
  ])

  const app = createDevServer({
    compileNodeCommonJS,
    compiler,
    proxyUrl,
    registerStatik,
    publicDir,
  })

  app.listen(port, () => {
    console.log()
    console.log(chalk.green(`SNext.js Dev Server listen on port: ${port}`))
    console.log()
    console.log(`http://localhost:${port}`)
    console.log()
  })
}
