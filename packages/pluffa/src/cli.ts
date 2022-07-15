#!/usr/bin/env node
import { Command } from 'commander'
import { printLogo } from './logo.js'
import chalk from 'chalk'
import { readLibPkgSync, shouldUseTypescript } from './utils.js'
import { getUserConfig } from './config.js'

const pkg = readLibPkgSync()

const program = new Command()
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description)

program.command('dev').action(async () => {
  printLogo()
  const config = await getUserConfig()
  const useTypescript = shouldUseTypescript()
  process.env.NODE_ENV = 'development'
  if (config.runtime === 'cloudflare-workers') {
    const { startWorkerDevServer } = await import('@pluffa/cloudflare-workers')
    startWorkerDevServer({
      ...config,
      clientSourceMapEnabled: config.clientSourceMap,
      useTypescript,
    })
  } else {
    const { startDevServer } = await import('@pluffa/node')
    startDevServer({
      ...config,
      useTypescript,
      clientSourceMapEnabled: config.clientSourceMap,
      compileNodeCommonJS: config.nodeModule === 'commonjs',
    })
  }
})

program.command('build').action(async () => {
  printLogo()
  const config = await getUserConfig()
  const useTypescript = shouldUseTypescript()
  process.env.NODE_ENV = 'production'
  if (config.runtime === 'cloudflare-workers') {
    const { buildForWorker } = await import('@pluffa/cloudflare-workers')
    console.log()
    console.log('Creating an optimized build...')
    console.log()
    buildForWorker({
      ...config,
      clientEntry: config.productionClientEntry ?? config.clientEntry,
      clientSourceMapEnabled:
        config.productionClientSourceMap ?? config.clientSourceMap,
      useTypescript,
    })
  } else {
    const { build } = await import('@pluffa/node')
    console.log()
    console.log('Creating an optimized build...')
    console.log()
    build({
      ...config,
      clientEntry: config.productionClientEntry ?? config.clientEntry,
      clientSourceMapEnabled:
        config.productionClientSourceMap ?? config.clientSourceMap,
      compileNodeCommonJS: config.nodeModule === 'commonjs',
      useTypescript,
    })
  }
})

program
  .command('staticize')
  .description('Export your Pluffa builded app as a static website')
  .option('-o, --output [output]', 'output directory')
  .option(
    '--no-crawl',
    'disable links crawling and explict crawling via pluffa/crawl'
  )
  .option('-u, --url [urls...]', 'urls to crawl')
  .action(async (options) => {
    printLogo()
    const config = await getUserConfig()
    if (config.runtime === 'cloudflare-workers') {
      console.log(
        chalk.red(
          `Pluffa error the staticize command is not supported for runtime ${config.runtime}\n`
        )
      )
      process.exit(1)
      return
    }
    process.env.NODE_ENV = 'production'
    const { staticize } = await import('@pluffa/node')
    console.log()
    console.log('Exporting your build as a static website...')
    console.log()
    await staticize({
      ...config,
      // When --no-crawl is specified disable crawl otherwise let config enable/disable crawl
      crawEnabled: options.crawl === false ? false : config.crawlEnabled,
      statikEnabled: Boolean(config.registerStatik),
      urls: options.url ?? config.urls,
      exitOnError: config.exitStaticizeOnError,
      compileNodeCommonJS: config.nodeModule === 'commonjs',
      outputDir: options.output ?? config.outputDir,
    })
  })

program.command('start').action(async () => {
  printLogo()
  const config = await getUserConfig()
  process.env.NODE_ENV = 'production'
  if (config.runtime === 'cloudflare-workers') {
    console.log(
      chalk.red(
        `Pluffa error the start command is not supported for runtime ${config.runtime}\n`
      )
    )
    process.exit(1)
    return
  } else {
    const { startProdServer } = await import('@pluffa/node')
    startProdServer({
      statikDataDir: config.statikDataDir,
      port: config.port,
      publicDir: config.productionServePublicAssets ? config.publicDir : false,
      compileNodeCommonJS: config.nodeModule === 'commonjs',
      statikEnabled: Boolean(config.registerStatik),
      proxy: config.productionProxy,
      serveStaticAssets: config.productionServeStaticAssets,
    })
  }
})

program.parse()
