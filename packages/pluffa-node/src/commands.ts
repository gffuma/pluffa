import chalk from 'chalk'
import build from './build'
import { exportStandAlone } from './exportStandAlone'
import { NodeConfig } from './types'

const ConfigDefaults: Partial<NodeConfig> = {
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
  experimentalUseSwc: false,
}

function validateConfig(rawConfig: Record<string, any>): NodeConfig {
  if (
    !(
      rawConfig.clientEntry &&
      rawConfig.skeletonComponent &&
      rawConfig.serverComponent
    )
  ) {
    console.log(
      chalk.red(
        'Pluffa.js config error:' +
          '\nYou have to configure at least:\n\n' +
          '"clientEntry"\n' +
          '"skeletonComponent"\n' +
          '"serverComponent"\n\n' +
          `for "runtime": "node"\n` +
          'Check your configuration\n'
      )
    )
    process.exit(1)
  }

  return {
    ...ConfigDefaults,
    ...rawConfig,
  } as NodeConfig
}

export interface CommandOptions {
  useTypescript: boolean
}

export async function runDevCommand(rawConfig: Record<string, any>) {}

export async function runStartCommand(rawConfig: Record<string, any>) {}

export async function runBuildCommand(
  rawConfig: Record<string, any>,
  { useTypescript }: CommandOptions
) {
  const config = validateConfig(rawConfig)
  const stats = await build({
    ...config,
    clientEntry: config.productionClientEntry ?? config.clientEntry,
    clientSourceMapEnabled:
      config.productionClientSourceMap ?? config.clientSourceMap,
    compileNodeCommonJS: config.nodeModule === 'commonjs',
    useTypescript,
    useSwc: config.experimentalUseSwc,
  })
  if (config.buildOutput === 'standalone') {
    console.log('Exporting standalone version...')
    await exportStandAlone(stats, config)
  }
}

export async function runStaticizeCommand(rawConfig: Record<string, any>) {
  const config = validateConfig(rawConfig)
}
