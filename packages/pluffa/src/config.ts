import chalk from 'chalk'
import { getUserPkg } from './utils'

export type Config =
  | {
      clientEntry: string
      skeletonComponent: string
      serverComponent: string
      runtime: 'commonjs' | 'esm'
      port: number
      outputDir: string
      publicDir: string
      urls: string[]
      exitStaticizeOnError: boolean
      crawlConcurrency: number
      crawlEnabled: boolean
      statikDataDir: string | false
      registerStatik?: string
      proxy?: string
    }
  | {
      workerEntry: string
      runtime: 'cloudflare-worker'
      port: number
      clientEntry: string
      outputDir: string
      publicDir: string
      miniflareConfig?: Record<string, any>
    }

const ConfigDefaults: Partial<Config> = {
  port: 7000,
  runtime: 'esm',
  outputDir: 'build',
  publicDir: 'public',
  urls: ['/'],
  crawlConcurrency: 4,
  statikDataDir: 'data',
  exitStaticizeOnError: false,
  crawlEnabled: true,
}

export async function getUserConfig(): Promise<Config> {
  const pkg = await getUserPkg()
  let cfg: Partial<Config> = pkg.pluffa

  if (!cfg) {
    console.log()
    console.log(
      chalk.red(
        'Pluffa config error:\nMissing "pluffa" key configuration check your package.json\n'
      )
    )
    process.exit(1)
  }

  cfg = { ...ConfigDefaults, ...cfg }

  if (cfg.runtime === 'commonjs' || cfg.runtime === 'esm') {
    if (!(cfg.clientEntry && cfg.skeletonComponent && cfg.serverComponent)) {
      console.log(
        chalk.red(
          'Pluffa config error:' +
            '\nYou have to configure at least:\n\n' +
            '"clientEntry"\n' +
            '"skeletonComponent"\n' +
            '"serverComponent"\n\n' +
            `for "runtime": "${cfg.runtime}"\n` +
            'check your package.josn\n'
        )
      )
      process.exit(1)
    }
  } else if (cfg.runtime === 'cloudflare-worker') {
    if (!cfg.workerEntry || !cfg.clientEntry) {
      console.log(
        chalk.red(
          'Pluffa config error:' +
            '\nYou have to configure at least:\n\n' +
            '"clientEntry"\n' +
            '"workerEntry"\n\n' +
            `for "runtime": "${cfg.runtime}"\n` +
            'check your package.josn\n'
        )
      )
      process.exit(1)
    }
  } else {
    console.log(
      chalk.red(
        'Pluffa config error:' +
          `Invalid "runtime": "${cfg.runtime}"\n` +
          'check your package.josn\n'
      )
    )
    process.exit(1)
  }

  return cfg as Config
}
