#!/usr/bin/env node
import { Command } from 'commander'
import { printLogo } from './logo.js'
import chalk from 'chalk'
import { readLibPkgSync, shouldUseTypescript } from './utils.js'
import { getUserConfig } from './config.js'
import { createRequire } from 'module'

const pkg = readLibPkgSync()

const require = createRequire(import.meta.url)

function ensurePluffaCloudflareWorkerInstalled() {
  try {
    require.resolve('@pluffa/cloudflare-worker')
  } catch (_) {
    console.log(
      chalk.red(
        'Pluffa error you have to install the package:\n',
        '\n@pluffa/cloudflare-worker\n\n' +
          'to use the cloudflare-worker rutime\n'
      )
    )
    process.exit(1)
    return
  }
}

const program = new Command()
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description)

program.command('dev').action(async () => {
  printLogo()
  const config = await getUserConfig()
  const useTypescript = shouldUseTypescript()
  process.env.NODE_ENV = 'development'
  if (config.runtime === 'cloudflare-worker') {
    ensurePluffaCloudflareWorkerInstalled()
    const { startWorkerDevServer } = await import('@pluffa/cloudflare-worker')
    startWorkerDevServer({
      ...config,
      useTypescript,
    })
  } else {
    const { default: startDevServer } = await import('./startDevServer.js')
    startDevServer({
      ...config,
      useTypescript,
      compileNodeCommonJS: config.runtime === 'commonjs',
    })
  }
})

program.command('build').action(async () => {
  printLogo()
  const config = await getUserConfig()
  const useTypescript = shouldUseTypescript()
  process.env.NODE_ENV = 'production'
  if (config.runtime === 'cloudflare-worker') {
    ensurePluffaCloudflareWorkerInstalled()
    const { buildForWorker } = await import('@pluffa/cloudflare-worker')
    console.log()
    console.log('Creating an optimized build...')
    console.log()
    buildForWorker({
      ...config,
      useTypescript,
    })
  } else {
    const { default: build } = await import('./build.js')
    console.log()
    console.log('Creating an optimized build...')
    console.log()
    build({
      ...config,
      compileNodeCommonJS: config.runtime === 'commonjs',
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
    if (config.runtime === 'cloudflare-worker') {
      console.log(
        chalk.red(
          `Pluffa error the staticize command is not supported for runtime ${config.runtime}\n`
        )
      )
      process.exit(1)
      return
    }
    process.env.NODE_ENV = 'production'
    const { default: staticize } = await import('./staticize.js')
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
      compileNodeCommonJS: config.runtime === 'commonjs',
      outputDir: options.output ?? config.outputDir,
    })
  })

program.parse()
