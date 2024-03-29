import { createSSRHandler } from '@pluffa/cloudflare-workers/runtime'
import { Router } from 'itty-router'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import Skeleton from './Skeleton'
import Server, { getServerData } from './Server'
import {
  handleStatik,
  configureStatikHandler,
  configureStatikServerBaseUrl,
} from '@pluffa/statik/edge'
import statikHandler from './fns'

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

// ___ STATIK ___
configureStatikHandler(statikHandler)
configureStatikServerBaseUrl('/x/fns')

router.all('/x/fns/*', handleStatik)

router.all(
  '*',
  createSSRHandler({
    Server,
    Skeleton,
    getServerData,
  })
)

addEventListener('fetch', async (event) => {
  event.respondWith(router.handle(event.request, event))
})
