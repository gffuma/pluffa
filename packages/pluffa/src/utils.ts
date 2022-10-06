import chalk from 'chalk'
import path from 'path'
import fs from 'fs/promises'
import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { CommandName, MinimalConfig, PLUFFA_RUNTIMES } from './config'

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

export function shouldUseTypescript() {
  return existsSync(path.resolve(process.cwd(), 'tsconfig.json'))
}

async function readJSONFile(filePath: string) {
  return JSON.parse(await fs.readFile(filePath, 'utf-8'))
}

async function extractConfigFromJs(value: unknown, cmd: CommandName) {
  let cfg: any
  if (typeof value === 'function') {
    cfg = await value(cmd)
  } else if (typeof value === 'object' && value !== null) {
    cfg = value
  }
  return cfg
}

export async function getUserRawConfig(
  cmd: CommandName
): Promise<MinimalConfig> {
  // ... Try to grab config from package.json
  const usePkgPath = path.join(process.cwd(), 'package.json')
  const pkg = await readJSONFile(usePkgPath)
  let cfg: MinimalConfig = pkg.pluffa
  if (cfg) {
    console.log(chalk.green(`● Loaded config from: ${usePkgPath}`))
  }

  // ... Try to grab config from pluffa.json
  if (!cfg) {
    const jsonConfigPath = path.join(process.cwd(), 'pluffa.json')
    try {
      if (existsSync(jsonConfigPath)) {
        cfg = await readJSONFile(jsonConfigPath)
        console.log(chalk.green(`● Loaded config from: ${jsonConfigPath}`))
      }
    } catch (_) {}
  }

  // ... Try to grab config from pluffa.config.js
  if (!cfg) {
    const jsConfigPath = path.join(process.cwd(), 'pluffa.config.js')
    if (existsSync(jsConfigPath)) {
      try {
        cfg = await extractConfigFromJs(require(jsConfigPath), cmd)
        console.log(chalk.green(`● Loaded config from: ${jsConfigPath}`))
      } catch (_) {}
    }
  }

  // ... Try to grab config from pluffa.config.mjs
  if (!cfg) {
    const jsConfigPath = path.join(process.cwd(), 'pluffa.config.mjs')
    if (existsSync(jsConfigPath)) {
      try {
        const value = await import(jsConfigPath).then((m) => m.default)
        cfg = await extractConfigFromJs(value, cmd)
        console.log(chalk.green(`● Loaded config from: ${jsConfigPath}`))
      } catch (_) {}
    }
  }

  if (!cfg) {
    console.log()
    console.log(
      chalk.red(
        'Pluffa.js configuration error.' +
          '\nTo configure Pluffa.js you need one of the following options:\n' +
          '\n- A "pluffa" key in your package.json' +
          '\n- A pluffa.json file in your directory' +
          '\n- A pluffa.config.js file in your directory' +
          '\n- A pluffa.config.mjs file in your directory'
      )
    )
    process.exit(1)
  }
  // Default runtime is NodeJS
  cfg.runtime = cfg.runtime ?? 'node'

  // Is Runtime valid?
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

  // Is Runtime installed?
  try {
    require.resolve(`@pluffa/${cfg.runtime}`)
  } catch (_) {
    console.log(
      chalk.red(
        'Pluffa error you have to install the package:\n',
        `\n@pluffa/${cfg.runtime}\n\n` + `to use the ${cfg.runtime} rutime\n`
      )
    )
    process.exit(1)
  }

  return cfg
}
