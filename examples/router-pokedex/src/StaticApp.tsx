import { GetServerData, AppProps } from '@pluffa/node-render'
import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { ServerRouter, RouterManager } from '@pluffa/router/server'
import App from './App'
import { routes } from './routes'

export default function StaticApp({
  routerManager,
  queryClient,
  url,
}: AppProps & {
  routerManager: RouterManager
  queryClient: QueryClient
}) {
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
    props: {
      routerManager,
      queryClient,
    },
    injectBeforeBodyClose: () =>
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
        dehydrate(queryClient)
      )};</script>`,
  }
}
