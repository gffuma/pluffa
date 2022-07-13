import chalk from 'chalk'
import { setUpEnv } from '@pluffa/env'
import createProdServer from './createProdServer.js'

export interface StartProdServerOptions {
  clientEntry: string
  serverComponent: string
  skeletonComponent: string
  registerStatik?: string
  compileNodeCommonJS: boolean
  proxy?: string
  publicDir: string | false
  port: number
}

export default async function startProdServer({
  clientEntry,
  serverComponent,
  skeletonComponent,
  registerStatik,
  compileNodeCommonJS,
  proxy: proxyUrl,
  port,
  publicDir,
}: StartProdServerOptions) {
  const isProd = true
  setUpEnv({ isProd })

  const app = await createProdServer({
    compileNodeCommonJS,
    // proxyUrl,
    // statikEnabled: Boolean(registerStatik),
    publicDir,
  })

  app.listen(port, () => {
    console.log()
    console.log(
      chalk.green(`Pluffa.js Production Server listen on port: ${port}`)
    )
    console.log()
    console.log(`http://localhost:${port}`)
    console.log()
  })
}
