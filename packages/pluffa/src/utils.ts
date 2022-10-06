import chalk from 'chalk'
import path from 'path'
import fs from 'fs/promises'
import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export function readLibPkgSync() {
  return JSON.parse(
    readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '../package.json'
      ),
      'utf-8'
    )
  )
}

export async function getUserPkg() {
  return JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
  )
}

export async function getUserJsonCfg() {
  return JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'pluffa.json'), 'utf-8')
  )
}

// TODO:
// export function getUserJsConfig() {
//   const config = require(path.join(process.cwd(), 'pluffa.config.js'))
// }

export function getUserPkgSync() {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
  )
}

export function shouldUseTypescript() {
  return existsSync(path.resolve(process.cwd(), 'tsconfig.json'))
}

export function repeatString(n: number, str: string) {
  return Array.apply(null, { length: n } as any)
    .map((_) => str)
    .join('')
}

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

export type CommandName = 'dev' | 'build' | 'staticize' | 'start'

const PLUFFA_RUNTIMES = ['node', 'cloudflare-workers'] as const

export type PluffaRutimes = typeof PLUFFA_RUNTIMES[number]

type MakeRuntimeConfig<U> = U extends any
  ? { runtime: U; [key: string]: any }
  : never

export type MinimalConfig = MakeRuntimeConfig<PluffaRutimes>

export async function getUserRawConfig(): Promise<MinimalConfig> {
  const pkg = await getUserPkg()
  let cfg: MinimalConfig = pkg.pluffa
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
  // Default runtime is NodeJS
  cfg.runtime = cfg.runtime ?? 'node'

  if (!PLUFFA_RUNTIMES.includes(cfg.runtime)) {
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

  return cfg
}
