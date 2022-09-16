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

export const getServerData = () => {
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
        retry: false,
        suspense: true,
      },
    },
  })
  return {
    props: {
      queryClient,
    },
    injectBeforeBodyClose: () =>
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
        dehydrate(queryClient)
      )};</script>`,
  }
}
