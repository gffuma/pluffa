import path from 'path'
import fs from 'fs/promises'
import webpack from 'webpack'
import rimraf from 'rimraf'
import { getWebPackClientConfig } from 'snext'
import { getWebPackWorkerConfig } from './webpack'

export interface BuildForWorkerOptions {
  clientEntry: string
  workerEntry: string
  useTypescript: boolean
  outputDir: string
}

export default function buildForWorker({
  clientEntry,
  workerEntry,
  useTypescript,
  outputDir,
}: BuildForWorkerOptions) {
  const snextOutPath = path.resolve(process.cwd(), '.snext')
  const buildOutPath = path.resolve(process.cwd(), outputDir)
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
      await fs.rename(snextOutPath, buildOutPath)
      const entrypoints =
        info.children![0]!.entrypoints!['main'].assets?.map((a) => a.name) ?? []

      await fs.appendFile(
        path.resolve(buildOutPath, 'runtime/worker.js'),
        `\nvar SNEXT_BUNDLE_ENTRYPOINTS = ${JSON.stringify(entrypoints)};`,
        {
          encoding: 'utf-8',
        }
      )
    }
  })
}
