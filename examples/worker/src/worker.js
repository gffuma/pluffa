import render from 'snext/render'
import { Router } from 'itty-router'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import StaticApp, { getStaticProps } from './StaticApp'
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
  const urlParsed = new URL23(req.url)
  const html = await render(
    {
      App: StaticApp,
      Skeleton,
      getStaticProps,
    },
    {
      entrypoints: SNEXT_BUNDLE_ENTRYPOINTS,
      url: urlParsed.pathname,
    }
  )
  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
})

addEventListener('fetch', async (event) => {
  event.respondWith(router.handle(event.request, event))
})
