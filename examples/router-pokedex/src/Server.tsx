import { GetServerData } from '@pluffa/node-render'
import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { useSSRData, useSSRUrl } from '@pluffa/ssr'
import { ServerRouter, RouterManager } from '@pluffa/router/server'
import App from './App'
import { routes } from './routes'

export default function Server() {
  const url = useSSRUrl()
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

export const getServerData: GetServerData = async ({ url }) => {
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
  await routerManager.prefetchUrl(url)
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
