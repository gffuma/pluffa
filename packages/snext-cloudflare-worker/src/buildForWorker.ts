import path from 'path'
import ncpCB from 'ncp'
import fs from 'fs/promises'
import util from 'util'
import webpack from 'webpack'
import rimraf from 'rimraf'
import {
  getFlatEntrypointsFromWebPackStats,
  getWebPackClientConfig,
} from '@snext/build-tools'
import { getWebPackWorkerConfig } from './webpack'

const ncp = util.promisify(ncpCB)

export interface BuildForWorkerOptions {
  clientEntry: string
  workerEntry: string
  useTypescript: boolean
  outputDir: string
  publicDir: string
}

export default async function buildForWorker({
  clientEntry,
  workerEntry,
  useTypescript,
  outputDir,
  publicDir,
}: BuildForWorkerOptions) {
  const snextOutPath = path.resolve(process.cwd(), '.snext')
  const buildOutPath = path.resolve(process.cwd(), outputDir)
  const publicPath = path.resolve(process.cwd(), publicDir)

  // Remove old stuff
  rimraf.sync(snextOutPath)
  rimraf.sync(buildOutPath)

  const isProd = true

  const compiler = webpack([
    getWebPackClientConfig({
      isProd,
      useTypescript,
      clientEntry,
      statikDataUrl: false,
    }),
    getWebPackWorkerConfig({
      isProd,
      useTypescript,
      workerEntry,
      clientEntry,
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
      // Renema output
      await fs.rename(snextOutPath, buildOutPath)

      // Inject entry points in worker bundle
      const entrypoints = getFlatEntrypointsFromWebPackStats(info, 'client')
      await fs.appendFile(
        path.resolve(buildOutPath, 'runtime/worker.js'),
        `\nvar SNEXT_BUNDLE_ENTRYPOINTS = ${JSON.stringify(entrypoints)};`,
        {
          encoding: 'utf-8',
        }
      )

      // Copy public stuff
      try {
        await ncp(publicPath, path.join(buildOutPath, 'client'))
      } catch (e) {
        console.log(e)
      }
    }
  })
}
