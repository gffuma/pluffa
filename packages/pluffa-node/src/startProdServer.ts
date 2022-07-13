import chalk from 'chalk'
import { setUpEnv } from '@pluffa/env'
import createProdServer from './createProdServer.js'

export interface StartProdServerOptions {
  statikEnabled: boolean
  statikDataDir: string | false
  compileNodeCommonJS: boolean
  serveStaticAssets?: boolean
  proxy?: string
  publicDir: string | false
  port: number
}

export default async function startProdServer({
  compileNodeCommonJS,
  statikEnabled,
  statikDataDir,
  serveStaticAssets,
  proxy: proxyUrl,
  port,
  publicDir,
}: StartProdServerOptions) {
  const isProd = true
  setUpEnv({ isProd })

  const app = await createProdServer({
    statikDataDir,
    serveStaticAssets,
    proxyUrl,
    compileNodeCommonJS,
    statikEnabled,
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
