#!/usr/bin/env node
import { fileURLToPath } from 'url'
import { Command } from 'commander'
import { readFileSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import build from './build.js'
import devServer from './devServer.js'
import staticize from './staticize.js'
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
  await devServer(userPkg.snext)
})

program.command('build').action(async () => {
  console.log(logo)
  console.log()
  console.log('Creating an optimized build...')
  console.log()
  const userPkg = await getUserPkg()
  process.env.NODE_ENV = 'production'
  build(userPkg.snext)
})

program.command('staticize').action(async () => {
  console.log(logo)
  console.log()
  console.log('Export your build as a static website...')
  console.log()
  const userPkg = await getUserPkg()
  await staticize(userPkg)
})

program.command('hello').action(async () => {
  console.log('Hello asshole')
})

program.parse()
