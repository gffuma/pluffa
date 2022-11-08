// FIXME: We should unify the Pluffa http stack ....
// But for now we keep a the StatikRequest here.
// Re-use the other layer has some cross platform issues
export interface StatikRequest<T = any> {
  method: string
  url: string
  body?: T
  // NOTE: I am not dub or a PHP Fan lol
  // but in CF 'context' is required so... yes i can use another
  // name but the $ means such special or internal...
  // maybe in the future should find a better way for dependency injection
  // but for now stick on this lol
  $context: Record<string, any>
}

export type StatikHandler<T = any> = (req: StatikRequest<T>) => any

export class StatikError extends Error {
  status: number
  constructor(message: any, status: number = 500) {
    super(message)
    this.status = status
  }
}
export class StatikNotFound extends StatikError {
  constructor(message: any = 'Not Found') {
    super(message, 404)
  }
}

export interface StatikConfig {
  baseUrl: string
  dataDir?: string
  handler?: StatikHandler
}

const StatikGlobalConfig: StatikConfig = {
  baseUrl: '',
}

export function configureStatikHandler(handler: StatikHandler) {
  StatikGlobalConfig.handler = handler
}

export function configureStatikDataDir(dataDir: string) {
  StatikGlobalConfig.dataDir = dataDir
}

export function getStatikDataDir() {
  return StatikGlobalConfig.dataDir
}

export function configureStatikServerBaseUrl(url: string) {
  StatikGlobalConfig.baseUrl = url
}

export function getStatikServerBaseUrl() {
  return StatikGlobalConfig.baseUrl
}

export async function runStatik<T = any>(req: StatikRequest): Promise<T> {
  if (!StatikGlobalConfig.handler) {
    throw new Error(
      'You should call configureStatikHandler() before calling runStatik().'
    )
  }
  const data = await StatikGlobalConfig.handler({
    ...req,
    url: `http://pluffa${req.url}`,
  })
  if (data === undefined) {
    throw new StatikNotFound()
  }
  return data
}
