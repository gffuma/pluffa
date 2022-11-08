export interface StatikReqConfig {
  method?: string
  body?: Record<string, any>
  $context?: Record<string, any>
}

export default function statik<T = any>(
  url: string,
  config?: StatikReqConfig
): Promise<T> {
  throw new Error()
}
