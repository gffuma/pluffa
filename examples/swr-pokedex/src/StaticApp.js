import { SWRConfig } from 'swr'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import fetcher from './fetcher'

export default function StaticApp({ cache, url }) {
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

export const getStaticProps = () => {
  return {
    props: {
      cache: new Map(),
    },
  }
}

export const getSkeletonProps = (staticProps, { cache }) => {
  return {
    props: {
      initialData: Array.from(cache.entries()),
    },
  }
}
