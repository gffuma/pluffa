import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { useSSRData } from '@pluffa/ssr'
import createCache from '@emotion/cache'
import App from './App'

export default function Server() {
  const { cache } = useSSRData()
  return (
    <CacheProvider value={cache}>
      <App />
    </CacheProvider>
  )
}

export function getServerData() {
  const cache = createCache({ key: 'pluffa' })
  const { renderStylesToNodeStream } = createEmotionServer(cache)
  return {
    data: {
      cache,
    },
    // NOTE: You can also skip at all and avoi extract critical CSS chunks:
    // https://emotion.sh/docs/ssr
    streamTransformers: [renderStylesToNodeStream()],
  }
}
