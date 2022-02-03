import { StatikReqConfig } from './statik'

export default async function statik(url: string, config?: StatikReqConfig) {
  return fetch(`/__snextstatik${url}`, {
    ...config,
    body: config
      ? config.body
        ? JSON.stringify(config.body)
        : undefined
      : undefined,
  }).then((r) => r.json())
}
