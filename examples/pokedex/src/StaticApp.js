import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { StaticRouter } from 'react-router-dom/server.js'
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
