import type { GetServerData } from '@pluffa/node'
import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { useSSRData, useSSRRequest } from '@pluffa/ssr'
import { ServerRouter, RouterManager } from '@pluffa/router/server'
import App from './App'
import { routes } from './routes'

export default function Server() {
  const { url } = useSSRRequest()
  const { queryClient, routerManager } = useSSRData<{
    queryClient: QueryClient
    routerManager: RouterManager
  }>()
  return (
    <QueryClientProvider client={queryClient}>
      <ServerRouter location={url} manager={routerManager}>
        <App />
      </ServerRouter>
    </QueryClientProvider>
  )
}

export const getServerData: GetServerData = async ({ request }) => {
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
  const routerManager = new RouterManager(routes, { queryClient })
  await routerManager.prefetchUrl(request.url)
  return {
    data: {
      routerManager,
      queryClient,
    },
    injectBeforeBodyClose: () =>
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
        dehydrate(queryClient)
      )};</script>`,
  }
}
