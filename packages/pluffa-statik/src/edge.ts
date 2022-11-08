import {
  runStatik,
  configureStatikHandler,
  configureStatikServerBaseUrl,
} from './runtime'

interface RequestWithContext extends Request {
  $context?: Record<string, any>
}

export async function handleStatik(req: RequestWithContext) {
  let body = {}
  if (req.headers.get('content-type') === 'json') {
    try {
      body = await req.json()
    } catch (_) {}
  }
  const urlParsed = new URL(req.url)
  const url = urlParsed.pathname + urlParsed.search
  try {
    const data = await runStatik({
      url,
      method: req.method,
      body,
      $context: req.$context ?? {},
    })
    return new Response(JSON.stringify(data), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    })
  } catch (e: any) {
    if (Number.isInteger(e.status)) {
      return new Response(String(e), {
        status: e.status,
      })
    }
    throw e
  }
}

export { configureStatikHandler, configureStatikServerBaseUrl }
