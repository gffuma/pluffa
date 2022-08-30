import { AppProps, GetStaticProps, GetSkeletonProps } from '@pluffa/node-render'
import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import { PagesManager, PagesManagerProvider } from './lib'
import { routes } from './routes'

export default function StaticApp({
  pagesManager,
  queryClient,
  url,
}: AppProps & {
  pagesManager: PagesManager
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <PagesManagerProvider manager={pagesManager}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </PagesManagerProvider>
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
  const pagesManager = new PagesManager(routes, { queryClient })
  await pagesManager.prefetchUrl(url)
  return {
    props: {
      pagesManager,
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
