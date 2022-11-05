import { StrictMode } from 'react'
import type { GetServerData } from '@pluffa/node'
import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { useSSRRequest, useSSRData, getScripts } from '@pluffa/ssr'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export default function Server() {
  const { url } = useSSRRequest()
  const { queryClient } = useSSRData()
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </QueryClientProvider>
    </StrictMode>
  )
}

export const getServerData: GetServerData = ({ bundle, request }) => {
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
        retry: false,
      },
    },
  })

  const mode = request.getOriginal().query['ssr'] === 'seo' ? 'seo' : 'streaming'
  const data = {
    queryClient,
  }
  const getInitialDataJS = () =>
    `window.__INITIAL_DATA__ = ${JSON.stringify(dehydrate(queryClient))};`
  if (mode === 'streaming') {
    return {
      mode,
      data,
      bootstrapScripts: bundle.entrypoints.main.filter((e) =>
        e.endsWith('.js')
      ),
      injectBeforeEveryScript: () =>
        `<script>${getInitialDataJS()}window.__HYDRATE__ && window.__HYDRATE__();</script>`,
    }
  } else {
    return {
      mode,
      data,
      injectBeforeBodyClose: () =>
        `<script>${getInitialDataJS()}</script>${getScripts(
          bundle.entrypoints
        )}`,
    }
  }
}
