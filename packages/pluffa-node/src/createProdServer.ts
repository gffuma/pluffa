import chalk from 'chalk'
import sourceMap from 'source-map-support'
import fs from 'fs/promises'
import path from 'path'
import { render } from '@pluffa/node-render'
import express, { Express } from 'express'

export interface CreateProdServerOptions {
  // compiler: Compiler | MultiCompiler
  publicDir: string | false
  // statikEnabled?: boolean
  compileNodeCommonJS: boolean
  serveStatic?: boolean
  createServer?: () => Express
  // proxyUrl?: string
}

function createDefaultServer() {
  const app = express()
  app.use(express.json())
  return app
}

export default async function createProdServer({
  createServer = createDefaultServer,
  publicDir,
  serveStatic = true,
  compileNodeCommonJS,
}: CreateProdServerOptions): Promise<Express> {
  sourceMap.install()

  const app = createServer()

  // Server plublic dir when needed
  if (publicDir) {
    app.use(express.static(path.resolve(process.cwd(), publicDir)))
  }

  const buildNodePath = path.resolve(process.cwd(), '.pluffa/node')
  const buildClientPath = path.resolve(process.cwd(), '.pluffa/client')
  const buildImportExt = `${compileNodeCommonJS ? '' : 'm'}js`

  if (serveStatic) {
    app.use('/static', express.static(path.resolve(buildClientPath, 'static')))
  }

  // Unifrom ESM vs CommonJS
  const uniformExport = (o: any) => (compileNodeCommonJS ? o.default : o)

  const appPath = path.join(buildNodePath, `App.${buildImportExt}`)

  const {
    default: App,
    getSkeletonProps,
    getStaticProps,
  } = await import(appPath).then(uniformExport)

  const skeletonPath = path.join(buildNodePath, `Skeleton.${buildImportExt}`)
  const { default: Skeleton } = await import(skeletonPath).then(uniformExport)

  // Read build manifest
  const manifest = JSON.parse(
    await fs.readFile(path.join(buildClientPath, 'manifest.json'), 'utf-8')
  )

  app.use(async (req, res) => {
    try {
      // if (statikEnabled) {
      //   const { configureRegisterStatik } = await getStatikRunTime()
      //   const registerStatik = await getFreshRegiterStatik()
      //   configureRegisterStatik(registerStatik)
      // }
      const html = await render(
        {
          App,
          getStaticProps,
          getSkeletonProps,
          Skeleton,
          onError: (renderingError) => {
            console.log(chalk.red('Error during server rendering'))
            console.log(renderingError)
          },
        },
        { url: req.url, entrypoints: manifest.entrypoints }
      )
      res.send(`<!DOCTYPE html>${html}`)
    } catch (error) {
      console.error(chalk.red('Fatal error while rendering'))
      console.error(error)
      res
        .status(500)
        .send(
          `<!DOCTYPE html><html><body>500 Internal Server Error</body></html>`
        )
    }
  })

  return app
}
