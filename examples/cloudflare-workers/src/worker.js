import { renderToEdgeResponse } from '@pluffa/edge-render'
import { Router } from 'itty-router'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import StaticApp, { getServerData } from './StaticApp'
import Skeleton from './Skeleton'

const router = Router()

router.get('/static/*', async (_, event) => {
  try {
    return await getAssetFromKV(event, {
      cacheControl: {
        browserTTL: 30 * 60 * 60 * 24, // 30 days
        edgeTTL: 2 * 60 * 60 * 24, // 2 days
        bypassCache: false,
      },
    })
  } catch (e) {
    const pathname = new URL(event.request.url).pathname
    return new Response(`"${pathname}" not found`, {
      status: 404,
      statusText: 'not found',
    })
  }
})

router.all('*', async (req) => {
  return renderToEdgeResponse(req, {
    App: StaticApp,
    getServerData,
    Skeleton,
  })
})

addEventListener('fetch', async (event) => {
  event.respondWith(router.handle(event.request, event))
})
