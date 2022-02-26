import render from 'snext/render'
import StaticApp, { getStaticProps } from './StaticApp'
import Skeleton from './Skeleton'

async function handler() {
  const html = await render(
    {
      App: StaticApp,
      Skeleton,
      getStaticProps,
    },
    {
      entrypoints: ['bundle.js'],
      url: '/',
    }
  )
  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
}

addEventListener('fetch', async (event) => {
  event.respondWith(handler())
})
