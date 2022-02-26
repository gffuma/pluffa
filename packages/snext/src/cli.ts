#!/usr/bin/env node
import { Command } from 'commander'
import logo from './logo.js'
import chalk from 'chalk'
import { readLibPkgSync, getUserPkg, shouldUseTypescript } from './utils.js'
import { getUserSNextConfig } from './config.js'
import { createRequire } from 'module'

const pkg = readLibPkgSync()

const require = createRequire(import.meta.url)

function ensureSNextCloudflareWorkerInstalled() {
  try {
    require.resolve('@snext/cloudflare-worker')
  } catch (_) {
    console.log(
      chalk.red(
        'SNext error you have to install the package:\n',
        '\n@snext/cloudflare-worker\n\n' +
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
  console.log(chalk.magenta(logo))
  const config = await getUserSNextConfig()
  const useTypescript = shouldUseTypescript()
  process.env.NODE_ENV = 'development'
  if (config.runtime === 'cloudflare-worker') {
    ensureSNextCloudflareWorkerInstalled()
    const { startWorkerDevServer } = await import('@snext/cloudflare-worker')
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
  console.log(chalk.magenta(logo))
  const userPkg = await getUserPkg()
  process.env.NODE_ENV = 'production'
  const { default: build } = await import('./build.js')
  console.log()
  console.log('Creating an optimized build...')
  console.log()
  build(userPkg.snext)
})

program.command('staticize').action(async () => {
  console.log(chalk.magenta(logo))
  const userPkg = await getUserPkg()
  process.env.NODE_ENV = 'production'
  const { default: staticize } = await import('./staticize.js')
  console.log()
  console.log('Exporting your build as a static website...')
  console.log()
  await staticize(userPkg.snext)
})

program.parse()
