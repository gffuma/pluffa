import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import App from './App'

export default function StaticApp({ queryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
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
        retry: false,
        staleTime: Infinity,
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
