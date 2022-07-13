import { hydrateRoot } from 'react-dom/client'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import App from './App'

const cache = createCache({ key: 'pluffa' })
hydrateRoot(
  document.getElementById('root'),
  <CacheProvider value={cache}>
    <App />
  </CacheProvider>
)
