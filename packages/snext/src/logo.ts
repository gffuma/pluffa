import chalk from 'chalk'
import { readLibPkgSync, repeatString } from './utils'

export const logo = String.raw`
        _                 _                   _        _      _             _
       / /\              /\ \     _          /\ \    /_/\    /\ \          /\ \
      / /  \            /  \ \   /\_\       /  \ \   \ \ \   \ \_\         \_\ \
     / / /\ \__        / /\ \ \_/ / /      / /\ \ \   \ \ \__/ / /         /\__ \
    / / /\ \___\      / / /\ \___/ /      / / /\ \_\   \ \__ \/_/         / /_ \ \
    \ \ \ \/___/     / / /  \/____/      / /_/_ \/_/    \/_/\__/\        / / /\ \ \
     \ \ \          / / /    / / /      / /____/\        _/\/__\ \      / / /  \/_/
 _    \ \ \        / / /    / / /      / /\____\/       / _/_/\ \ \    / / /
/_/\__/ / /       / / /    / / /      / / /______      / / /   \ \ \  / / /
\ \/___/ /       / / /    / / /      / / /_______\    / / /    /_/ / /_/ /
 \_____\/        \/_/     \/_/       \/__________/    \/_/     \_\/  \_\/
`

export function printLogo() {
  const pkg = readLibPkgSync()
  console.log(chalk.magenta(logo))
  console.log()
  console.log(
    repeatString(30, ' ') + chalk.greenBright(`SNext.js (${pkg.version})`)
  )
  console.log(
    repeatString(30, ' ') +
      chalk.white(`Build Sites \\w `) +
      chalk.cyan('React')
  )
  console.log()
}
