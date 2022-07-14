import chalk from 'chalk'
import { readLibPkgSync, repeatString } from './utils'

export const logo = String.raw`
                        .---.
_________   _...._      |   |
\        |.'      '-.   |   |               _.._     _.._
 \        .'\./'.    '. |   |             .' .._|  .' .._|
  \      |       \     \|   |             | '      | '       __
   |     |        |    ||   |   _    _  __| |__  __| |__  .:--.'.
   |      \      /    . |   |  | '  / ||__   __||__   __|/ |   \ |
   |     |\`'-.-'   .'  |   | .' | .' |   | |      | |   '" __ | |
   |     | '-....-''    |   | /  | /  |   | |      | |    .'.''| |
  .'     '.             '---'|   ''.  |   | |      | |   / /   | |_
'-----------'                \   .'|  '/  | |      | |   \ \._.\ '/
                              '-'  '--'   |_|      |_|    '--'  '"
`

export function printLogo() {
  const pkg = readLibPkgSync()
  console.log(chalk.magenta(logo))
  console.log()
  console.log(
    repeatString(30, ' ') + chalk.greenBright(`Pluffa.js (${pkg.version})`)
  )
  console.log(
    repeatString(30, ' ') +
      chalk.white(`Build Sites \\w `) +
      chalk.cyan('React')
  )
  console.log()
}
