import { StatikReqConfig } from './statik.js'
import { getStatikServerBaseUrl, runStatik } from './runtime.js'

export default function statik(url: string, config?: StatikReqConfig) {
  return runStatik({
    url: getStatikServerBaseUrl() + url,
    method: config?.method ?? 'GET',
    body: config?.body,
    $context: config?.$context ?? {},
  })
}
