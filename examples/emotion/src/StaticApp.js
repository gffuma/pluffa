import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import App from './App'

export default function StaticApp({ cache }) {
  return (
    <CacheProvider value={cache}>
      <App />
    </CacheProvider>
  )
}

export function getStaticProps() {
  return {
    props: {
      cache: createCache({ key: 'snext' }),
    },
  }
}

export const getSkeletonProps = (_, { cache }) => {
  return {
    props: {
      cache,
    },
  }
}
