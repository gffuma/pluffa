import { GetServerData } from '@pluffa/node-render'
import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { useSSRUrl, useSSRData, getScripts } from '@pluffa/ssr'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import React from 'react'

export default function Server() {
  const url = useSSRUrl()
  const { queryClient } = useSSRData()
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </QueryClientProvider>
    </React.StrictMode>
  )
}

export const getServerData: GetServerData = ({ entrypoints }) => {
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
  return {
    data: {
      queryClient,
    },
    injectBeforeBodyClose: () =>
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
        dehydrate(queryClient)
      )};</script>` + getScripts(entrypoints),
  }
}
