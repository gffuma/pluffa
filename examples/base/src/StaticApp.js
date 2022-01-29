import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export default function StaticApp({ queryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StaticRouter>
        <App />
      </StaticRouter>
    </QueryClientProvider>
  )
}

StaticApp.getStaticProps = () => {
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

StaticApp.getInitialData = (config, { queryClient }) => {
  return {
    initialData: dehydrate(queryClient),
  }
}
