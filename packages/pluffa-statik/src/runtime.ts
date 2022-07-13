import itty from 'itty-router'

export interface StatikRequest<T = any> {
  method: string
  url: string
  body?: T
}

export type RegisterStatik<T = any> = (
  router: itty.Router<StatikRequest<T>>
) => void

export class StatikNotFound extends Error {
  status: 404
  constructor(message: any) {
    super(message)
    this.status = 404
  }
}

export interface StatikConfig {
  dataDir?: string
  register?: RegisterStatik
}

const StatikGlobalConfig: StatikConfig = {}

export function configureRegisterStatik(register: RegisterStatik) {
  StatikGlobalConfig.register = register
}

export function configureStatikDataDir(dataDir: string) {
  StatikGlobalConfig.dataDir = dataDir
}

export function getStatikDataDir() {
  return StatikGlobalConfig.dataDir
}

export async function runStatik<T = any>(
  req: StatikRequest
): Promise<T> {
  const router = itty.Router<StatikRequest>()
  if (!StatikGlobalConfig.register) {
    throw new Error(
      'You should call configureRegisterStatik() before calling runStatik().'
    )
  }
  StatikGlobalConfig.register(router)
  router.all('*', () => {
    throw new StatikNotFound(`No register statik handler for URL ${req.url}`)
  })
  const data = await router.handle({
    ...req,
    url: `http://pluffa${req.url}`,
  })
  return data
}
