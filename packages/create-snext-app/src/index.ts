#!/usr/bin/env node
import { Command } from 'commander'
import { fileURLToPath } from 'url'
import path from 'path'
import { readFileSync } from 'fs'
import createApp from './createApp.js'
import chalk from 'chalk'

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
  .argument('<app_name>', 'The name of your app')
  .option('-ts --typescript', 'Use Typescript', false)
  .action(async (appName) => {
    try {
      await createApp({
        ...program.opts(),
        appName,
      })
    } catch (err) {
      console.log(chalk.red('Troubles while creating snext app:'))
      console.error(err)
      process.exit(1)
    }
  })

program.parse()
