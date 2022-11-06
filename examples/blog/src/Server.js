import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { useSSRData, useSSRRequest } from '@pluffa/ssr'
import { HelmetProvider } from 'react-helmet-async'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export default function Server() {
  const { queryClient, helmetContext } = useSSRData()
  const { url } = useSSRRequest()
  return (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export const getServerData = () => {
  const helmetContext = {}
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
        refetchOnMount: false,
        staleTime: Infinity,
        suspense: true,
      },
    },
  })
  return {
    data: {
      helmetContext,
      queryClient,
    },
    injectBeforeHeadClose: () =>
      ['title', 'meta', 'link']
        .map((k) => helmetContext.helmet[k].toString())
        .join(''),
    injectBeforeBodyClose: () =>
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
        dehydrate(queryClient)
      )};</script>`,
  }
}
