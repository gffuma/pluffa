import path from 'path'
import fs from 'fs/promises'
import webpack, { Configuration } from 'webpack'
import rimraf from 'rimraf'
import {
  getFlatEntrypointsFromWebPackStats,
  getWebPackClientConfig,
  getWebPackNodeConfig,
} from '@pluffa/build-tools'
import { setUpEnv } from '@pluffa/env'

type WebPackEntry = Configuration['entry']

export interface BuildOptions {
  clientEntry: WebPackEntry
  clientSourceMapEnabled?: boolean
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
  clientSourceMapEnabled = true
}: BuildOptions) {
  rimraf.sync(path.resolve(process.cwd(), '.pluffa'))

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
      sourceMapEnabled: clientSourceMapEnabled
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
        path.join(process.cwd(), '.pluffa/client', 'manifest.json'),
        JSON.stringify({ entrypoints }, null, 2)
      )
    }
  })
}
