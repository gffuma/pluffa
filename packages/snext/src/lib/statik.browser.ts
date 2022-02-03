import { StatikReqConfig } from './statik'

export default async function statik(url: string, config?: StatikReqConfig) {
  const init: RequestInit = {}
  if (config) {
    if (config.method) {
      init.method = config.method
    }
    if (config.body) {
      init.body = JSON.stringify(config!.body)
      init.headers = {
        'content-type': 'application/json',
      }
    }
  }
  return fetch(`/__snextstatik${url}`, init).then((r) =>
    r.ok ? r.json() : Promise.reject({ status: r.status })
  )
}
