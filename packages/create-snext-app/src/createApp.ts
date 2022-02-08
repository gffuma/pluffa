import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import ncpCB from 'ncp'
import path from 'path'
import util from 'util'
import spawn from 'cross-spawn'
import chalk from 'chalk'

const ncp = util.promisify(ncpCB)

function space(n: number) {
  return Array.apply(null, { length: n } as any)
    .map((_) => ' ')
    .join('')
}

function isUsingYarn() {
  return (process.env.npm_config_user_agent || '').indexOf('yarn') === 0
}

function install({
  cwd,
  deps,
  dev = false,
}: {
  cwd: string
  deps: string[]
  dev?: boolean
}): Promise<void> {
  const useYarn = isUsingYarn()
  const command = useYarn ? 'yarn' : 'npm'

  let args: string[] = []
  if (useYarn) {
    args.push('add')
  } else {
    args.push('install')
  }
  args.push(...deps)

  if (dev) {
    if (useYarn) {
      args.push('--dev')
    } else {
      args.push('--save-dev')
    }
  } else {
    if (!useYarn) {
      args.push('--save-prod')
    }
  }

  const p = spawn(command, args, {
    stdio: 'inherit',
    cwd,
  })

  return new Promise((resolve, reject) => {
    p.on('close', (code) => {
      if (code !== 0) {
        reject(`Error while running ${command} ${args.join(' ')}`)
      } else {
        resolve()
      }
    })
  })
}

export default async function createApp({
  appName,
  typescript: useTypescript,
}: {
  appName: string
  typescript: boolean
}) {
  const baseDir = path.resolve(process.cwd(), appName)
  const appNameClean = path.basename(appName)
  console.log(path.resolve(baseDir, 'gitignore'))

  console.log()
  console.log('Creating a new SNext App in ' + chalk.green(baseDir))
  console.log()

  await fs.mkdir(baseDir)
  const fileExt = useTypescript ? 'tsx' : 'js'

  await fs.writeFile(
    path.join(baseDir, 'package.json'),
    JSON.stringify(
      {
        name: appNameClean,
        private: true,
        scripts: {
          dev: 'snext dev',
          build: 'snext build',
          staticize: 'snext staticize',
        },
        snext: {
          clientEntry: `./src/index.${fileExt}`,
          serverComponent: `./src/App.${fileExt}`,
          skeletonComponent: `./src/Skeleton.${fileExt}`,
        },
      },
      null,
      2
    )
  )

  let templatePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../templates'
  )
  if (useTypescript) {
    templatePath = path.join(templatePath, 'typescript')
  } else {
    templatePath = path.join(templatePath, 'default')
  }

  await ncp(templatePath, baseDir)
  await fs.rename(
    path.resolve(baseDir, 'gitignore'),
    path.resolve(baseDir, '.gitignore')
  )

  console.log()
  console.log('Installing dependencies...')
  console.log()

  await install({
    cwd: baseDir,
    deps: ['react@rc', 'react-dom@rc'],
    dev: false,
  })
  const devDeps = ['snext']
  if (useTypescript) {
    devDeps.push('@types/react', '@types/node', '@types/react-dom')
  }
  await install({
    cwd: baseDir,
    deps: devDeps,
    dev: true,
  })

  const friendlyRunCmd = isUsingYarn() ? 'yarn' : 'npm run'
  console.log()
  console.log(`G4ng! created ${appNameClean} at ${baseDir}`)
  console.log('Some hints to beat the dragon:')
  console.log()
  console.log(space(2) + chalk.blue(`${friendlyRunCmd} dev`))
  console.log(space(4) + 'Starts the development server.')
  console.log()
  console.log(space(2) + chalk.blue(`${friendlyRunCmd} build`))
  console.log(
    space(4) + 'Bundles the app into static and node files for production.'
  )
  console.log()
  console.log(space(2) + chalk.blue(`${friendlyRunCmd} staticize`))
  console.log(space(4) + 'Using your bundled app make a static site by')
  console.log(
    space(4) +
      'recursively crawling all links generated ' +
      'during server side rendering.'
  )
  console.log()
  console.log('"oh shit here we go again"')
  console.log()
  console.log(space(2) + `${chalk.blue('cd')} ${appName}`)
  console.log(space(2) + chalk.blue(`${friendlyRunCmd} dev`))
  console.log()
  console.log()
  console.log(`while (${chalk.red('daysLeft')}) {`)
  console.log(chalk.greenBright('  hackTheWorld()'))
  console.log(`  ${chalk.red('daysLeft')}--`)
  console.log('}')
}
