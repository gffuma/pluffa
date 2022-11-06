import path from 'path'
import fs from 'fs/promises'
import webpack, { Configuration, MultiStats } from 'webpack'
import rimraf from 'rimraf'
import {
  getFlatEntrypointsFromWebPackStats,
  getWebPackClientConfig,
  getWebPackNodeConfig,
} from '@pluffa/build-tools'
import { setUpEnv } from '@pluffa/env'
import { WebPackConfigMapper } from './config'

type WebPackEntry = Configuration['entry']

const identity = <T>(a: T) => a

export interface BuildOptions {
  clientEntry: WebPackEntry
  clientSourceMapEnabled?: boolean
  serverComponent: string
  skeletonComponent: string
  registerStatik?: string
  compileNodeCommonJS: boolean
  useTypescript: boolean
  statikDataDir: string | false
  useSwc?: boolean
  useHelpersForClientCode: boolean
  compileClientNodeModules: boolean
  configureWebpackClient?: WebPackConfigMapper
  configureWebpackServer?: WebPackConfigMapper
}

export default function build({
  clientEntry,
  serverComponent,
  skeletonComponent,
  registerStatik,
  useTypescript,
  compileNodeCommonJS,
  statikDataDir,
  useSwc = false,
  clientSourceMapEnabled = true,
  useHelpersForClientCode,
  compileClientNodeModules,
  configureWebpackClient = identity,
  configureWebpackServer = identity,
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
    configureWebpackClient(
      getWebPackClientConfig({
        isProd,
        useTypescript,
        clientEntry,
        statikDataUrl,
        sourceMapEnabled: clientSourceMapEnabled,
        useSwc,
        useHelpersForClientCode,
        compileClientNodeModules,
      })
    ),
    configureWebpackServer(
      getWebPackNodeConfig({
        compileNodeCommonJS,
        isProd,
        serverComponent,
        skeletonComponent,
        useTypescript,
        registerStatik,
        useSwc,
      })
    ),
  ])

  return new Promise<MultiStats>((resolve) => {
    compiler.run(async (err, stats) => {
      if (err) {
        console.error(err.stack || err)
        if ((err as any).details) {
          console.error((err as any).details)
        }
        process.exit(1)
        return
      }
      if (stats!.hasErrors()) {
        for (const s of stats!.stats) {
          s.compilation.getErrors().forEach((e) => console.error(e))
        }
        process.exit(1)
      } else {
        const entrypoints = getFlatEntrypointsFromWebPackStats(stats!, 'client')
        await fs.writeFile(
          path.join(process.cwd(), '.pluffa/client', 'manifest.json'),
          JSON.stringify({ entrypoints }, null, 2)
        )
        resolve(stats!)
      }
    })
  })
}
