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

export default async function runStatik<T = any>(
  req: StatikRequest,
  registerStatik: RegisterStatik
): Promise<T> {
  const router = itty.Router<StatikRequest>()
  registerStatik(router)
  router.all('*', () => {
    throw new StatikNotFound(`No register statik handler for URL ${req.url}`)
  })
  const data = await router.handle({
    ...req,
    url: `http://snext${req.url}`,
  })
  return data
}
