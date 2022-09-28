import ReactDOM from 'react-dom/client'
import { QueryClient, hydrate, QueryClientProvider } from 'react-query'
import { RouterManager, ClientRouter } from '@pluffa/router/client'
import App from './App'
import { routes } from './routes'

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

const routerManager = new RouterManager(routes, {
  queryClient,
})

hydrate(queryClient, (window as any).__INITIAL_DATA__)
delete (window as any).__INITIAL_DATA__

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <QueryClientProvider client={queryClient}>
    <ClientRouter manager={routerManager} prefetchLink='never'>
      <App />
    </ClientRouter>
  </QueryClientProvider>
)
