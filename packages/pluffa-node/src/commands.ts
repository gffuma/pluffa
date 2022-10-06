import chalk from 'chalk'
import build from './build'
import { exportStandAlone } from './exportStandAlone'
import startDevServer from './startDevServer'
import startProdServer from './startProdServer'
import staticize from './staticize'
import { NodeConfig } from './types'

export type NodeConfigDefaults = Required<
  Pick<
    NodeConfig,
    | 'port'
    | 'runtime'
    | 'outputDir'
    | 'publicDir'
    | 'clientSourceMap'
    | 'experimentalUseSwc'
    | 'nodeModule'
    | 'urls'
    | 'crawlConcurrency'
    | 'statikDataDir'
    | 'exitStaticizeOnError'
    | 'crawlEnabled'
    | 'serveStaticAssets'
  >
>

const ConfigDefaults: NodeConfigDefaults = {
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
  serveStaticAssets: true,
  clientSourceMap: true,
  experimentalUseSwc: false,
}

export type NodeConfigWithDefaults = NodeConfig & NodeConfigDefaults

function validateConfig(
  rawConfig: Record<string, any>
): NodeConfigWithDefaults {
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
  } as NodeConfigWithDefaults
}

export interface EnvBuildCommandOptions {
  useTypescript: boolean
}

export async function runDevCommand(
  rawConfig: Partial<NodeConfig>,
  { useTypescript }: EnvBuildCommandOptions
) {
  const config = validateConfig(rawConfig)
  startDevServer({
    // MAIN
    serverComponent: config.serverComponent,
    skeletonComponent: config.skeletonComponent,
    clientEntry: config.clientEntry,
    // SERVER
    port: config.port,
    proxy: config.proxy,
    publicDir: config.publicDir,
    // STATIK?
    registerStatik: config.registerStatik,
    // BUNDLING
    useTypescript,
    clientSourceMapEnabled: config.clientSourceMap,
    compileNodeCommonJS: config.nodeModule === 'commonjs',
    useSwc: config.experimentalUseSwc,
  })
}

export async function runStartCommand(rawConfig: Partial<NodeConfig>) {
  const config = validateConfig(rawConfig)
  await startProdServer({
    // SERVER
    port: config.port,
    proxy: config.useProxyInProd ? config.proxy : undefined,
    publicDir: config.publicDir,
    serveStaticAssets: config.serveStaticAssets,
    // STATIK?
    statikEnabled: Boolean(config.registerStatik),
    statikDataDir: config.statikDataDir,
    // BUNDLING
    compileNodeCommonJS: config.nodeModule === 'commonjs',
  })
}

export async function runBuildCommand(
  rawConfig: Partial<NodeConfig>,
  { useTypescript }: EnvBuildCommandOptions
) {
  const config = validateConfig(rawConfig)
  const stats = await build({
    // MAIN
    serverComponent: config.serverComponent,
    skeletonComponent: config.skeletonComponent,
    clientEntry: config.clientEntry,
    // STATIK?
    registerStatik: config.registerStatik,
    statikDataDir: config.statikDataDir,
    compileNodeCommonJS: config.nodeModule === 'commonjs',
    // BUNDLING
    useTypescript,
    clientSourceMapEnabled: config.clientSourceMap,
    useSwc: config.experimentalUseSwc,
  })
  if (config.experimentalBuildOutput === 'standalone') {
    console.log('Exporting standalone version...')
    await exportStandAlone(stats, config)
  }
}

export async function runStaticizeCommand(rawConfig: Partial<NodeConfig>) {
  const config = validateConfig(rawConfig)
  await staticize({
    crawlConcurrency: config.crawlConcurrency,
    publicDir: config.publicDir,
    statikDataDir: config.statikDataDir,
    crawlEnabled: config.crawlEnabled,
    statikEnabled: Boolean(config.registerStatik),
    urls: config.urls,
    exitOnError: config.exitStaticizeOnError,
    compileNodeCommonJS: config.nodeModule === 'commonjs',
    outputDir: config.outputDir,
  })
}
