import { createRequire } from 'module'
import chalk from 'chalk'
import { getUserJsonCfg, getUserPkg } from './utils'
import { Config } from './types'

const ConfigDefaults: Partial<Config> = {
  port: 7000,
  runtime: 'node',
  nodeModule: 'esm',
  outputDir: 'build',
  publicDir: 'public',
  urls: ['/'],
  crawlConcurrency: 4,
  statikDataDir: 'data',
  exitStaticizeOnError: false,
  crawlEnabled: true,
  productionServePublicAssets: true,
  productionServeStaticAssets: true,
  clientSourceMap: true,
}

const require = createRequire(import.meta.url)

export function ensureRuntimePkgsInstalled(runtime: string) {
  try {
    require.resolve(`@pluffa/${runtime}`)
  } catch (_) {
    console.log(
      chalk.red(
        'Pluffa error you have to install the package:\n',
        `\n@pluffa/${runtime}\n\n` + `to use the ${runtime} rutime\n`
      )
    )
    process.exit(1)
    return
  }
}

export async function getUserConfig(): Promise<Config> {
  const pkg = await getUserPkg()
  let cfg: Partial<Config> = pkg.pluffa
  if (!cfg) {
    try {
      cfg = await getUserJsonCfg()
    } catch (_) {}
  }

  if (!cfg) {
    console.log()
    console.log(
      chalk.red(
        'Pluffa.js configuration error.' +
          '\nTo configure Pluffa.js you need one ot theese options:\n' +
          '\n- A "pluffa" key in your package.json' +
          '\n- A pluffa.json file in your directory'
      )
    )
    process.exit(1)
  }

  cfg = { ...ConfigDefaults, ...cfg }

  if (cfg.runtime === 'node') {
    if (!(cfg.clientEntry && cfg.skeletonComponent && cfg.serverComponent)) {
      console.log(
        chalk.red(
          'Pluffa.js config error:' +
            '\nYou have to configure at least:\n\n' +
            '"clientEntry"\n' +
            '"skeletonComponent"\n' +
            '"serverComponent"\n\n' +
            `for "runtime": "${cfg.runtime}"\n` +
            'Check your configuration\n'
        )
      )
      process.exit(1)
    }
  } else if (cfg.runtime === 'cloudflare-workers') {
    if (!cfg.workerEntry || !cfg.clientEntry) {
      console.log(
        chalk.red(
          'Pluffa.js config error:' +
            '\nYou have to configure at least:\n\n' +
            '"clientEntry"\n' +
            '"workerEntry"\n\n' +
            `for "runtime": "${cfg.runtime}"\n` +
            'Check your configuration.\n'
        )
      )
      process.exit(1)
    }
  } else {
    console.log(
      chalk.red(
        'Pluffa.js config error. ' +
          `Invalid runtime "${cfg.runtime}".\n` +
          'Check your configuration.\n'
      )
    )
    process.exit(1)
  }

  ensureRuntimePkgsInstalled(cfg.runtime)

  return cfg as Config
}
