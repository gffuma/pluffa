import path from 'path'
import express, { Express } from 'express'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { Compiler, MultiCompiler } from 'webpack'

export interface CreateBaseDevServerOptions {
  compiler: Compiler | MultiCompiler
  publicDir: string | false
}

export default function createBaseDevServer({
  compiler,
  publicDir,
}: CreateBaseDevServerOptions): Express {
  const app = express()

  app.use(express.json())

  if (publicDir) {
    app.use(express.static(path.resolve(process.cwd(), publicDir)))
  }

  app.use(webpackHotMiddleware(compiler))

  app.use(
    webpackDevMiddleware(compiler, {
      writeToDisk: (target) => {
        if (path.relative(process.cwd(), target).startsWith('.snext')) {
          return true
        }
        return false
      },
    })
  )

  return app
}
