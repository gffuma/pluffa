import chalk from 'chalk'

function repeatString(n: number, str: string) {
  return Array.apply(null, { length: n } as any)
    .map((_) => str)
    .join('')
}

export const logo = String.raw`
 ________  ___       ___  ___  ________ ________ ________
|\   __  \|\  \     |\  \|\  \|\  _____\\  _____\\   __  \
\ \  \|\  \ \  \    \ \  \\\  \ \  \__/\ \  \__/\ \  \|\  \
 \ \   ____\ \  \    \ \  \\\  \ \   __\\ \   __\\ \   __  \
  \ \  \___|\ \  \____\ \  \\\  \ \  \_| \ \  \_| \ \  \ \  \
   \ \__\    \ \_______\ \_______\ \__\   \ \__\   \ \__\ \__\
    \|__|     \|_______|\|_______|\|__|    \|__|    \|__|\|__|
`

export function printLogo(version: string) {
  console.log(chalk.cyanBright(logo))
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
