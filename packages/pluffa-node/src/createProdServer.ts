import chalk from 'chalk'
import { createProxyMiddleware, Filter } from 'http-proxy-middleware'
import sourceMap from 'source-map-support'
import fs from 'fs/promises'
import path from 'path'
import express, { Express, Response } from 'express'
import { renderExpressResponse } from '@pluffa/node-render'
import { RegisterStatik, StatikRequest } from '@pluffa/statik/runtime'

export interface CreateProdServerOptions {
  publicDir: string | false
  statikEnabled?: boolean
  compileNodeCommonJS: boolean
  serveStaticAssets?: boolean
  createServer?: () => Express
  statikDataDir: string | false
  proxyUrl?: string
  buildDir?: string
}

function handleFatalSSRError(error: any, res: Response) {
  console.error(chalk.red('Fatal server error'))
  console.error(error)
  if (!res.headersSent) {
    res.status(500)
  }
  const html = `<!DOCTYPE html><html><body><h1>500 Internal Server Error</h1></body></html>`
  res.write(html)
  res.end()
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
  buildDir: overrideBuildDir,
}: CreateProdServerOptions): Promise<Express> {
  sourceMap.install()

  const app = createServer()

  // Server plublic dir when needed
  if (publicDir) {
    app.use(express.static(path.resolve(process.cwd(), publicDir)))
  }

  const buildDir = overrideBuildDir ?? path.resolve(process.cwd(), '.pluffa')
  const buildNodePath = path.join(buildDir, 'node')
  const buildClientPath = path.join(buildDir, 'client')
  const buildImportExt = `${compileNodeCommonJS ? '' : 'm'}js`

  if (serveStaticAssets) {
    app.use('/static', express.static(path.resolve(buildClientPath, 'static')))
  }

  // NOTE: Ok, this should be do better but for now as workaround
  // expose them as env var...
  process.env.PLUFFA_BUILD_CLIENT_PATH = buildClientPath

  // Unifrom ESM vs CommonJS
  const uniformExport = (o: any) => (compileNodeCommonJS ? o.default : o)

  // Import user compiled Server file
  const serverPath = path.join(buildNodePath, `Server.${buildImportExt}`)
  const { default: Server, getServerData } = await import(serverPath)
    .catch(handleImportError)
    .then(uniformExport)

  // Import user compiled Skeleton file
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
      await renderExpressResponse(req, res, {
        Server,
        Skeleton,
        getServerData,
        entrypoints: manifest.entrypoints,
        onError: (renderingError) => {
          console.log(chalk.red('Error during server rendering'))
          console.log(renderingError)
        },
        onFatalError(error) {
          handleFatalSSRError(error, res)
        },
      })
    } catch (error) {
      console.error(chalk.red('Fatal error while rendering'))
      console.error(error)
      handleFatalSSRError(error, res)
    }
  })

  return app
}
