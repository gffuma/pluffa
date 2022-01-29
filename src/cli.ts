#!/usr/bin/env node
import { Command } from 'commander'
import fs from 'fs/promises'
import path from 'path'
import build from './build'
import devServer from './devServer'
import staticize from './staticize'
const program = new Command()

async function getUserPkg() {
  return JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
  )
}

program.command('dev').action(async () => {
  const userPkg = await getUserPkg()
  process.env.NODE_ENV = 'development'
  await devServer(userPkg.snext)
})

program.command('build').action(async () => {
  const userPkg = await getUserPkg()
  process.env.NODE_ENV = 'production'
  build(userPkg.snext)
})

program.command('staticize').action(async () => {
  const userPkg = await getUserPkg()
  await staticize(userPkg)
})

program.parse()
