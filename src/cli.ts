#!/usr/bin/env node
import { Command } from 'commander'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import build from './build'
import devServer from './devServer'
import staticize from './staticize'
import logo from './logo'

const pkg = JSON.parse(
  fsSync.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
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
  console.log('Creating an optmized build...')
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

program.parse()
