#!/usr/bin/env node
import { Command } from 'commander'
import logo from './logo.js'
import chalk from 'chalk'
import { readLibPkgSync, getUserPkg } from './utils.js'

const pkg = readLibPkgSync()

const program = new Command()
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description)

program.command('dev').action(async () => {
  console.log(chalk.magenta(logo))
  const userPkg = await getUserPkg()
  process.env.NODE_ENV = 'development'
  const { default: devServer } = await import('./devServer.js')
  await devServer(userPkg.snext)
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
