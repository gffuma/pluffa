#!/usr/bin/env node
import { fileURLToPath } from 'url'
import { Command } from 'commander'
import { readFileSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import logo from './logo.js'

const pkg = JSON.parse(
  readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../package.json'
    ),
    'utf-8'
  )
)
const program = new Command()
  .name(pkg.name)
  .version(pkg.version)
  .description(pkg.description)

async function getUserPkg() {
  return JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
  )
}

program.command('dev').action(async () => {
  console.log(logo)
  const userPkg = await getUserPkg()
  process.env.NODE_ENV = 'development'
  const { default: devServer } = await import('./devServer.js')
  await devServer(userPkg.snext)
})

program.command('build').action(async () => {
  console.log(logo)
  const userPkg = await getUserPkg()
  process.env.NODE_ENV = 'production'
  const { default: build } = await import('./build.js')
  console.log()
  console.log('Creating an optimized build...')
  console.log()
  build(userPkg.snext)
})

program.command('staticize').action(async () => {
  console.log(logo)
  const userPkg = await getUserPkg()
  process.env.NODE_ENV = 'production'
  const { default: staticize } = await import('./staticize.js')
  console.log()
  console.log('Exporting your build as a static website...')
  console.log()
  await staticize(userPkg.snext)
})

program.parse()
