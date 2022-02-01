import ReactDOM from 'react-dom'
import { QueryClient, hydrate, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const hydrateRoot = (ReactDOM as any).hydrateRoot

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

hydrate(queryClient, (window as any).__INITIAL_DATA__)
delete (window as any).__INITIAL_DATA__

hydrateRoot(
  document.getElementById('root'),
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
)
