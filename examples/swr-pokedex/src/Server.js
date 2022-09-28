import { SWRConfig } from 'swr'
import { StaticRouter } from 'react-router-dom/server'
import { useSSRUrl, useSSRData } from '@pluffa/ssr'
import App from './App'
import fetcher from './fetcher'

export default function Server() {
  const url = useSSRUrl()
  const { cache } = useSSRData()
  return (
    <SWRConfig
      value={{
        suspense: true,
        provider: () => cache,
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        dedupingInterval: 0,
        focusThrottleInterval: 0,
        loadingTimeout: 0,
        errorRetryInterval: 0,
        errorRetryCount: 0,
        fetcher,
      }}
    >
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </SWRConfig>
  )
}

export const getServerData = () => {
  const cache = new Map()
  return {
    data: {
      cache,
    },
    injectBeforeBodyClose: () =>
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
        Array.from(cache.entries())
      )};</script>`,
  }
}