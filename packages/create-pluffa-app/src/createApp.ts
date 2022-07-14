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

interface TemplateConfig {
  // Inject pkg json...
  package: Record<string, any>
  install?: {
    devDependencies?: string[]
    dependencies?: string[]
  }
}

export default async function createApp({
  appName,
  template,
}: {
  appName: string
  template: string
}) {
  const templatesPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../templates'
  )
  const templatePath = path.join(templatesPath, template)

  // Validate template name
  try {
    await fs.access(templatePath)
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.error(chalk.red(`Invalid template name: ${template}`))
      process.exit(1)
      return
    }
    throw err
  }

  const templateConfig = (await JSON.parse(
    await fs.readFile(path.join(templatePath, 'template.json'), 'utf-8')
  )) as TemplateConfig

  const baseDir = path.resolve(process.cwd(), appName)
  const appNameClean = path.basename(appName)

  console.log()
  console.log('Creating a new Pluffa App in ' + chalk.green(baseDir))
  console.log()

  await fs.mkdir(baseDir)

  const appPkg = {
    name: appNameClean,
    private: true,
    ...templateConfig?.package,
  } as Record<string, any>

  await fs.writeFile(
    path.join(baseDir, 'package.json'),
    JSON.stringify(appPkg, null, 2)
  )

  await ncp(templatePath, baseDir, {
    filter: /^(?!.*template\.json).*$/,
  })
  await fs.rename(
    path.resolve(baseDir, 'gitignore'),
    path.resolve(baseDir, '.gitignore')
  )

  console.log()
  console.log('Installing dependencies...')
  console.log()

  const deps = ['react', 'react-dom']
  if (templateConfig.install?.dependencies) {
    deps.push(...templateConfig.install.dependencies)
  }
  await install({
    cwd: baseDir,
    deps,
    dev: false,
  })
  const devDeps = ['pluffa']
  if (templateConfig.install?.devDependencies) {
    devDeps.push(...templateConfig.install.devDependencies)
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
  if (typeof appPkg?.scripts?.dev === 'string') {
    console.log(space(2) + chalk.blue(`${friendlyRunCmd} dev`))
    console.log(space(4) + 'Starts a development server with hot reload.')
    console.log()
  }
  if (typeof appPkg?.scripts?.build === 'string') {
    console.log(space(2) + chalk.blue(`${friendlyRunCmd} build`))
    console.log(
      space(4) +
        'Bundles the app into static and js runtimes files for production.'
    )
    console.log()
  }
  if (typeof appPkg?.scripts?.staticize === 'string') {
    console.log(space(2) + chalk.blue(`${friendlyRunCmd} staticize`))
    console.log(space(4) + 'Using your bundled app make a static site by')
    console.log(
      space(4) +
        'recursively crawling all links generated ' +
        'during server side rendering.'
    )
    console.log()
  }
  if (typeof appPkg?.scripts?.start === 'string') {
    console.log(space(2) + chalk.blue(`${friendlyRunCmd} start`))
    console.log(space(4) + 'Start a production server.')
    console.log()
  }
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
