import mkdirp from 'mkdirp'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { StatikReqConfig } from './statik.js'
import {
  getStatikDataDir,
  getStatikServerBaseUrl,
  runStatik,
} from './runtime.js'

export default async function statik(url: string, config?: StatikReqConfig) {
  const req = {
    url: getStatikServerBaseUrl() + url,
    method: config?.method ?? 'GET',
    body: config?.body,
    $context: config?.$context ?? {},
  }
  const data = await runStatik(req)
  const dataDir = getStatikDataDir()

  if (dataDir && req.method === 'GET') {
    const statikPath = path.join(dataDir, url) + '.json'
    mkdirp.sync(path.dirname(statikPath))
    if (!existsSync(statikPath)) {
      await fs.writeFile(statikPath, JSON.stringify(data))
    }
  }
  return data
}
