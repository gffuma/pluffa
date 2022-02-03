import itty from 'itty-router'

export interface StatikRequest {
  method: string
  url: string
}

export type RegisterStatik = (router: itty.Router<StatikRequest>) => void

export default async function runStatik<T = any>(
  req: StatikRequest,
  registerStatik: RegisterStatik
): Promise<T> {
  const router = itty.Router<StatikRequest>()
  registerStatik(router)
  const data = await router.handle({
    ...req,
    url: `http://snext${req.url}`,
  })
  return data
}
