import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import App from './App'

export default function StaticApp({ queryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
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
            retry: false,
            staleTime: Infinity,
            suspense: true,
          },
        },
      }),
    },
  }
}
