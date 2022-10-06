import chalk from 'chalk'
import buildForWorker from './buildForWorker'
import startWorkerDevServer from './startWorkerDevServer'
import {
  CloudFlareWorkersConfig,
  CloudFlareWorkersConfigDefaultsValues,
  CloudFlareWorkersConfigWithDefaults,
} from './config'

function validateConfig(
  rawConfig: Record<string, any>
): CloudFlareWorkersConfigWithDefaults {
  if (!rawConfig.workerEntry || !rawConfig.clientEntry) {
    console.log(
      chalk.red(
        'Pluffa.js config error:' +
          '\nYou have to configure at least:\n\n' +
          '"clientEntry"\n' +
          '"workerEntry"\n\n' +
          `for "runtime": "${rawConfig.runtime}"\n` +
          'Check your configuration.\n'
      )
    )
    process.exit(1)
  }

  return {
    ...CloudFlareWorkersConfigDefaultsValues,
    ...rawConfig,
  } as CloudFlareWorkersConfigWithDefaults
}

export interface EnvBuildCommandOptions {
  useTypescript: boolean
}

export async function runDevCommand(
  rawConfig: Partial<CloudFlareWorkersConfig>,
  { useTypescript }: EnvBuildCommandOptions
) {
  const config = validateConfig(rawConfig)
  startWorkerDevServer({
    // MAIN
    workerEntry: config.workerEntry,
    clientEntry: config.clientEntry,
    // SERVER
    port: config.port,
    publicDir: config.publicDir,
    // BUNDLER
    clientSourceMapEnabled: config.clientSourceMap,
    useTypescript,
    useSwc: config.experimentalUseSwc,
    // CF
    miniflareConfig: config.miniflareConfig,
  })
}

export async function runBuildCommand(
  rawConfig: Partial<CloudFlareWorkersConfig>,
  { useTypescript }: EnvBuildCommandOptions
) {
  const config = validateConfig(rawConfig)
  buildForWorker({
    // MAIN
    workerEntry: config.workerEntry,
    clientEntry: config.clientEntry,
    // BUNDLER
    outputDir: config.outputDir,
    publicDir: config.publicDir,
    clientSourceMapEnabled: config.clientSourceMap,
    useTypescript,
    useSwc: config.experimentalUseSwc,
  })
}
