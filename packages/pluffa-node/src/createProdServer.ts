import chalk from 'chalk'
import { createProxyMiddleware, Filter } from 'http-proxy-middleware'
import sourceMap from 'source-map-support'
import fs from 'fs/promises'
import path from 'path'
import { render } from '@pluffa/node-render'
import express, { Express } from 'express'
import { RegisterStatik, StatikRequest } from '@pluffa/statik/runtime'

export interface CreateProdServerOptions {
  publicDir: string | false
  statikEnabled?: boolean
  compileNodeCommonJS: boolean
  serveStaticAssets?: boolean
  createServer?: () => Express
  statikDataDir: string | false
  proxyUrl?: string
}

function createDefaultServer() {
  const app = express()
  app.use(express.json())
  return app
}

function informMissingBuildStep() {
  console.error(
    chalk.red(
      'Pluffa.js error you need to build your project before start production server.\n'
    )
  )
}

function handleImportError(err: any): never {
  if (err.code === 'ERR_MODULE_NOT_FOUND') {
    informMissingBuildStep()
  }
  throw err
}

function handleFileNotFoundError(err: any): never {
  if (err.code === 'ENOENT') {
    informMissingBuildStep()
  }
  throw err
}

export default async function createProdServer({
  createServer = createDefaultServer,
  publicDir,
  statikDataDir,
  proxyUrl,
  statikEnabled = false,
  serveStaticAssets = true,
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

  if (serveStaticAssets) {
    app.use('/static', express.static(path.resolve(buildClientPath, 'static')))
  }

  // NOTE: Ok, this should be do better but for now as workaround
  // expose them as env var...
  process.env.PLUFFA_BUILD_CLIENT_PATH = buildClientPath

  // Unifrom ESM vs CommonJS
  const uniformExport = (o: any) => (compileNodeCommonJS ? o.default : o)

  const appPath = path.join(buildNodePath, `App.${buildImportExt}`)

  const {
    default: App,
    getSkeletonProps,
    getStaticProps,
  } = await import(appPath).catch(handleImportError).then(uniformExport)

  const skeletonPath = path.join(buildNodePath, `Skeleton.${buildImportExt}`)
  const { default: Skeleton } = await import(skeletonPath)
    .catch(handleImportError)
    .then(uniformExport)

  // Read build manifest
  const manifest = JSON.parse(
    await fs
      .readFile(path.join(buildClientPath, 'manifest.json'), 'utf-8')
      .catch(handleFileNotFoundError)
  )

  // NOTE: We Inject the current user code for registerStatik
  // to inject into the correct version CommonJS vs ESM
  // we also import the correct version of statik runtime
  const getStatikRunTime: () => Promise<{
    runStatik<T = any>(req: StatikRequest): Promise<T>
    configureRegisterStatik(register: RegisterStatik): void
  }> = compileNodeCommonJS
    ? async () => require('@pluffa/statik/runtime')
    : async () => await import('@pluffa/statik/runtime')

  if (statikEnabled && statikDataDir) {
    // Register stuff for run time in server rendering
    const { configureRegisterStatik, runStatik } = await getStatikRunTime()
    const { default: registerStatik } = await import(
      path.join(buildNodePath, `statik.${buildImportExt}`)
    )
      .catch(handleImportError)
      .then(uniformExport)
    configureRegisterStatik(registerStatik)

    const statikDaraUrl = statikDataDir.startsWith('/')
      ? statikDataDir
      : `/${statikDataDir}`
    // Serve API
    app.use(statikDaraUrl, async (req, res) => {
      try {
        // Run them!
        const data = await runStatik({
          method: req.method,
          body: req.body,
          // NOTE: Note not perfect solution lol
          url: req.url.replace('.json', ''),
        })
        res.send(data)
      } catch (error: any) {
        if (error.status === 404) {
          res
            .status(404)
            .send(
              `<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>`
            )
          return
        }
        console.error(chalk.red('Error during processing statik handler'))
        console.error(error)
        res
          .status(500)
          .send(
            `<!DOCTYPE html><html><body><h1>500 Internal Server Error</h1></body></html>`
          )
      }
    })
  }

  // Set Up Proxy
  if (proxyUrl) {
    const filterPorxy: Filter = (_, req) => {
      return (
        req.method !== 'GET' ||
        Boolean(req.headers.accept && !req.headers.accept.includes('text/html'))
      )
    }
    app.use(
      createProxyMiddleware(filterPorxy, {
        logLevel: 'silent',
        target: proxyUrl,
        changeOrigin: true,
      })
    )
  }

  app.use(async (req, res) => {
    try {
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
          `<!DOCTYPE html><html><body><h1>500 Internal Server Error</h1></body></html>`
        )
    }
  })

  return app
}
