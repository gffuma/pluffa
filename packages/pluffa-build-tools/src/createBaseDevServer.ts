import path from 'path'
import express, { Express } from 'express'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { Compiler, MultiCompiler } from 'webpack'

export interface CreateBaseDevServerOptions {
  app?: Express,
  compiler: Compiler | MultiCompiler
  publicDir: string | false
}

export default function createBaseDevServer({
  app: baseApp,
  compiler,
  publicDir,
}: CreateBaseDevServerOptions): Express {
  const app = baseApp ?? express()

  if (publicDir) {
    app.use(express.static(path.resolve(process.cwd(), publicDir)))
  }

  app.use(webpackHotMiddleware(compiler))

  app.use(
    webpackDevMiddleware(compiler, {
      serverSideRender: true,
      writeToDisk: (target) => {
        if (path.relative(process.cwd(), target).startsWith('.pluffa')) {
          return true
        }
        return false
      },
    })
  )

  return app
}
