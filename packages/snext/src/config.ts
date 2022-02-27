import chalk from 'chalk'
import { getUserPkg } from './utils'

export type SNextConfig =
  | {
      clientEntry: string
      skeletonComponent: string
      serverComponent: string
      runtime: 'commonjs' | 'esm'
      port: number
      outputDir: string
      publicDir: string
      urls: string[]
      crawlConcurrency: number
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
    }

const SNextDefaults: Partial<SNextConfig> = {
  port: 7000,
  runtime: 'esm',
  outputDir: 'build',
  publicDir: 'public',
  urls: ['/'],
  crawlConcurrency: 4,
  statikDataDir: 'snextdata',
}

export async function getUserSNextConfig(): Promise<SNextConfig> {
  const pkg = await getUserPkg()
  let cfg: Partial<SNextConfig> = pkg.snext

  if (!cfg) {
    console.log()
    console.log(
      chalk.red(
        'SNext config error:\nMissing "snext" key configuration check your package.json\n'
      )
    )
    process.exit(1)
  }

  cfg = { ...SNextDefaults, ...cfg }

  if (cfg.runtime === 'commonjs' || cfg.runtime === 'esm') {
    if (!(cfg.clientEntry && cfg.skeletonComponent && cfg.serverComponent)) {
      console.log(
        chalk.red(
          'SNext config error:' +
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
          'SNext config error:' +
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
        'SNext config error:' +
          `Invalid "runtime": "${cfg.runtime}"\n` +
          'check your package.josn\n'
      )
    )
    process.exit(1)
  }

  return cfg as SNextConfig
}
