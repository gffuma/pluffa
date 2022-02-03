import path from 'path'
import runStatik from '../runStatik.js'
import { StatikReqConfig } from './statik.js'

export default async function statik(url: string, config?: StatikReqConfig) {
  const statikPath = path.join(process.cwd(), '.snext/node/statik.mjs')
  const { default: registerStatik } = await import(statikPath)
  const req = {
    method: config?.method ?? 'GET',
    body: config?.body,
    url,
  }
  return runStatik(req, registerStatik)
}
