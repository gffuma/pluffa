import ReactDOM from 'react-dom/client'
import { QueryClient, hydrate, QueryClientProvider } from 'react-query'
import App from './App'
import { PagesManager, PagesManagerProvider, BrowserRouter } from './lib'
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

const manager = new PagesManager(routes, {
  queryClient,
})

hydrate(queryClient, (window as any).__INITIAL_DATA__)
delete (window as any).__INITIAL_DATA__

ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <QueryClientProvider client={queryClient}>
    <PagesManagerProvider manager={manager}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PagesManagerProvider>
  </QueryClientProvider>
)
