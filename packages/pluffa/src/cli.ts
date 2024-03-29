#!/usr/bin/env node
import { Command } from 'commander'
import { printLogo } from './logo.js'
import chalk from 'chalk'
import {
  readLibPkgSync,
  shouldUseTypescript,
  getUserRawConfig,
} from './utils.js'

const pkg = readLibPkgSync()

const program = new Command()
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description)

program.command('dev').action(async () => {
  printLogo(pkg.version)
  process.env.NODE_ENV = 'development'
  const config = await getUserRawConfig('dev')
  const useTypescript = shouldUseTypescript()
  if (config.runtime === 'node') {
    const { runDevCommand } = await import('@pluffa/node')
    runDevCommand(config, {
      useTypescript,
    })
  } else if (config.runtime === 'cloudflare-workers') {
    const { runDevCommand } = await import('@pluffa/cloudflare-workers')
    runDevCommand(config, {
      useTypescript,
    })
  }
})

program.command('build').action(async () => {
  printLogo(pkg.version)
  process.env.NODE_ENV = 'production'
  const config = await getUserRawConfig('build')
  const useTypescript = shouldUseTypescript()
  console.log()
  console.log('Creating an optimized build...')
  console.log()
  if (config.runtime === 'node') {
    const { runBuildCommand } = await import('@pluffa/node')
    runBuildCommand(config, {
      useTypescript,
    })
  } else if (config.runtime === 'cloudflare-workers') {
    const { runBuildCommand } = await import('@pluffa/cloudflare-workers')
    runBuildCommand(config, {
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
    printLogo(pkg.version)
    process.env.NODE_ENV = 'production'
    const config = await getUserRawConfig('staticize')
    if (config.runtime !== 'node') {
      console.log(
        chalk.red(
          `Pluffa error the staticize command is not supported for runtime ${config.runtime}\n`
        )
      )
      process.exit(1)
      return
    }
    const { runStaticizeCommand } = await import('@pluffa/node')
    console.log()
    console.log('Exporting your build as a static website...')
    console.log()

    // NOTE: NOT 100% Good cause at this point
    // config is an unknown but keep this for backward compact...

    // When --no-crawl is specified disable crawl otherwise let config enable/disable crawl
    if (options.crawl === false) {
      config.crawlEnabled = false
    }
    // Override config urls ...
    if (options.urls) {
      config.urls = options.urls
    }
    // Override config output
    if (options.output) {
      config.outputDir = options.output
    }
    await runStaticizeCommand(config)
  })

program.command('start').action(async () => {
  printLogo(pkg.version)
  process.env.NODE_ENV = 'production'
  const config = await getUserRawConfig('start')
  if (config.runtime !== 'node') {
    console.log(
      chalk.red(
        `Pluffa error the start command is not supported for runtime ${config.runtime}\n`
      )
    )
    process.exit(1)
    return
  }
  const { runStartCommand } = await import('@pluffa/node')
  await runStartCommand(config)
})

program.parse()
