import mkdirp from 'mkdirp'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import runStatik from '../runStatik.js'
import { StatikReqConfig } from './statik.js'

export default async function statik(url: string, config?: StatikReqConfig) {
  const statikPath = path.join(
    process.cwd(),
    `.snext/node/statik.${process.env.SNEXT_COMPILE_NODE_COMMONJS ? '' : 'm'}js`
  )
  const { default: registerStatik } = await import(statikPath)
  const req = {
    method: config?.method ?? 'GET',
    body: config?.body,
    url,
  }
  const data = await runStatik(req, registerStatik)
  if (process.env.SNEXT_STATIK_DATA_DIR && req.method === 'GET') {
    const statikPath =
      path.join(process.env.SNEXT_STATIK_DATA_DIR, url) + '.json'
    mkdirp.sync(path.dirname(statikPath))
    if (!existsSync(statikPath)) {
      await fs.writeFile(statikPath, JSON.stringify(data))
    }
  }
  return data
}
