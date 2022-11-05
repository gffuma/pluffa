import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { useSSRData, getScripts } from '@pluffa/ssr'
import App from './App'

export default function Server() {
  const { queryClient } = useSSRData()
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

export const getServerData = ({ bundle, response, request }) => {
  // console.log('URL', request.url)
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
  // console.log(request.headers)
  // console.log('X', crypto.randomUUID())
  // response.setHeader('X-GIOVA', 'Awesome!')
  // response.setHeader('Set-Cookie', 'giova=23;rinne=9;')
  return {
    data: {
      queryClient,
    },
    mode: 'streaming',
    bootstrapScripts: bundle.entrypoints['main'].filter((s) => s.endsWith('.js')),
    // injectOnEnd: () => getScripts(bundle.entrypoints),
    injectBeforeEveryScript: () =>
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
        dehydrate(queryClient)
      )};</script>`,
    // injectBeforeBodyClose: () =>
    //   `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
    //     dehydrate(queryClient)
    //   )};</script>`,
  }
}
