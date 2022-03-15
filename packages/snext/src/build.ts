import path from 'path'
import fs from 'fs/promises'
import webpack from 'webpack'
import rimraf from 'rimraf'
import {
  getFlatEntrypointsFromWebPackStats,
  getWebPackClientConfig,
  getWebPackNodeConfig,
} from '@snext/build-tools'
import { setUpEnv } from '@snext/env'

export interface BuildOptions {
  clientEntry: string
  serverComponent: string
  skeletonComponent: string
  registerStatik?: string
  compileNodeCommonJS: boolean
  useTypescript: boolean
  statikDataDir: string | false
}

export default function build({
  clientEntry,
  serverComponent,
  skeletonComponent,
  registerStatik,
  useTypescript,
  compileNodeCommonJS,
  statikDataDir,
}: BuildOptions) {
  rimraf.sync(path.resolve(process.cwd(), '.snext'))

  let statikDataUrl = ''
  if (statikDataDir !== false) {
    statikDataUrl = path.normalize(statikDataDir)
    statikDataUrl = statikDataUrl.startsWith('/')
      ? statikDataUrl
      : `/${statikDataUrl}`
  }

  const isProd = true
  setUpEnv({ isProd })

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
      const entrypoints = getFlatEntrypointsFromWebPackStats(info, 'client')
      await fs.writeFile(
        path.join(process.cwd(), '.snext/client', 'manifest.json'),
        JSON.stringify({ entrypoints }, null, 2)
      )
    }
  })
}
