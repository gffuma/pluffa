import path from 'path'
import fs from 'fs/promises'
import webpack from 'webpack'
import rimraf from 'rimraf'
import { getWebPackClientConfig } from './webpack/client.js'
import { shouldUseTypescript } from './utils.js'
import { getWebPackNodeConfig } from './webpack/node.js'

export interface BuildOptions {
  clientEntry: string
  serverComponent: string
  skeletonComponent: string
  registerStatik?: string
  port: number
  compileNodeCommonJS: boolean
  statikDataDir?: string | false
}

export default function build({
  clientEntry,
  serverComponent,
  skeletonComponent,
  registerStatik,
  compileNodeCommonJS = false,
  statikDataDir = 'snextdata',
}: BuildOptions) {
  rimraf.sync(path.resolve(process.cwd(), '.snext'))

  const useTypescript = shouldUseTypescript()

  let statikDataUrl = ''
  if (statikDataDir !== false) {
    statikDataUrl = path.normalize(statikDataDir)
    statikDataUrl = statikDataUrl.startsWith('/')
      ? statikDataUrl
      : `/${statikDataUrl}`
  }

  const isProd = true

  const compiler = webpack([
    getWebPackClientConfig({
      isProd,
      useTypescript,
      clientEntry,
      statikDataUrl,
    }),
    getWebPackNodeConfig({
      compileNodeCommonJS,
      isProd,
      serverComponent,
      skeletonComponent,
      useTypescript,
      registerStatik,
    }),
  ])

  compiler.run(async (err, stats) => {
    if (err) {
      console.error(err.stack || err)
      if ((err as any).details) {
        console.error((err as any).details)
      }
      process.exit(1)
      return
    }
    const info = stats!.toJson()
    if (stats!.hasErrors()) {
      console.log('Build failed.')
      info.errors!.forEach((e) => console.error(e))
      process.exit(1)
    } else {
      const entrypoints =
        info.children![0]!.entrypoints!['main'].assets?.map((a) => a.name) ?? []
      await fs.writeFile(
        path.join(process.cwd(), '.snext/client', 'manifest.json'),
        JSON.stringify({ entrypoints }, null, 2)
      )
    }
  })
}
