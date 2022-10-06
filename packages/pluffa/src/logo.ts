import chalk from 'chalk'

function repeatString(n: number, str: string) {
  return Array.apply(null, { length: n } as any)
    .map((_) => str)
    .join('')
}

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

export function printLogo(version: string) {
  console.log(chalk.magenta(logo))
  console.log()
  console.log(
    repeatString(30, ' ') + chalk.greenBright(`Pluffa.js (${version})`)
  )
  console.log(
    repeatString(30, ' ') +
      chalk.white(`Build Sites \\w `) +
      chalk.cyan('React')
  )
  console.log()
}
