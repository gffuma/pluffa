import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export default function StaticApp({ queryClient, url }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </QueryClientProvider>
  )
}

export const getStaticProps = () => {
  return {
    props: {
      queryClient: new QueryClient({
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
      }),
    },
  }
}

export const getSkeletonProps = (config, { queryClient }) => {
  return {
    props: {
      initialData: dehydrate(queryClient),
    }
  }
}
