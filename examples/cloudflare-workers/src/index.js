import { hydrateRoot } from 'react-dom/client'
import { QueryClient, hydrate, QueryClientProvider } from 'react-query'
import App from './App'

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

hydrate(queryClient, window.__INITIAL_DATA__)
delete window.__INITIAL_DATA__

hydrateRoot(
  document.getElementById('root'),
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
