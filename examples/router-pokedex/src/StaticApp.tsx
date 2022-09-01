import { AppProps, GetStaticProps, GetSkeletonProps } from '@pluffa/node-render'
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

export const getStaticProps: GetStaticProps = async ({ url }) => {
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
  }
}

export const getSkeletonProps: GetSkeletonProps<{
  queryClient: QueryClient
}> = (appProps, { queryClient }) => {
  return {
    props: {
      initialData: dehydrate(queryClient),
    },
  }
}
