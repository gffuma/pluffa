import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SWRConfig } from 'swr'
import fetcher from './fetcher'
import App from './App'

const cache = new Map(window.__INITIAL_DATA__ ?? [])
delete window.__INITIAL_DATA__

hydrateRoot(
  document.getElementById('root'),
  <SWRConfig
    value={{
      provider: () => cache,
      suspense: true,
      fetcher,
      revalidateOnMount: false,
    }}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SWRConfig>
)
