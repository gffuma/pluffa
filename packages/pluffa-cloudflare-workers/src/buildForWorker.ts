import path from 'path'
import ncpCB from 'ncp'
import fs from 'fs/promises'
import util from 'util'
import webpack, { Configuration } from 'webpack'
import rimraf from 'rimraf'
import {
  getFlatEntrypointsFromWebPackStats,
  getWebPackClientConfig,
} from '@pluffa/build-tools'
import { getWebPackWorkerConfig } from './webpack'
import { setUpEnv } from '@pluffa/env'

const ncp = util.promisify(ncpCB)

type WebPackEntry = Configuration['entry']

export interface BuildForWorkerOptions {
  clientEntry: WebPackEntry
  clientSourceMapEnabled?: boolean
  workerEntry: string
  useTypescript: boolean
  outputDir: string
  publicDir: string | false
  useSwc?: boolean
}

export default async function buildForWorker({
  clientEntry,
  workerEntry,
  useTypescript,
  outputDir,
  publicDir,
  clientSourceMapEnabled = true,
  useSwc = false,
}: BuildForWorkerOptions) {
  const libOutPath = path.resolve(process.cwd(), '.pluffa')
  const buildOutPath = path.resolve(process.cwd(), outputDir)

  // Remove old stuff
  rimraf.sync(libOutPath)
  rimraf.sync(buildOutPath)

  const isProd = true
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
    getWebPackWorkerConfig({
      isProd,
      useTypescript,
      workerEntry,
      clientEntry,
      useSwc,
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
    if (stats!.hasErrors()) {
      console.log('Build failed.')
      for (const s of stats!.stats) {
        s.compilation.getErrors().forEach((e) => console.error(e))
      }
      process.exit(1)
    } else {
      // Renema output
      await fs.rename(libOutPath, buildOutPath)

      // Inject entry points in worker bundle
      const entrypoints = getFlatEntrypointsFromWebPackStats(stats!, 'client')
      await fs.appendFile(
        path.resolve(buildOutPath, 'runtime/worker.js'),
        `\nvar PLUFFA_BUNDLE_ENTRYPOINTS = ${JSON.stringify(entrypoints)};`,
        {
          encoding: 'utf-8',
        }
      )

      // Copy public stuff
      if (publicDir !== false) {
        try {
          const publicPath = path.resolve(process.cwd(), publicDir)
          await ncp(publicPath, path.join(buildOutPath, 'client'))
        } catch (e) {
          console.log(e)
        }
      }
    }
  })
}
