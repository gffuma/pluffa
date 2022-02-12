import { hydrateRoot } from 'react-dom'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import App from './App'

const cache = createCache({ key: 'snext' })
hydrateRoot(
  document.getElementById('root'),
  <CacheProvider value={cache}>
    <App />
  </CacheProvider>
)
