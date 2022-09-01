import { createContext } from 'react'

export type LinkPrefetchUnion = 'render' | 'never' | 'intent'

export interface PrefetchConfig {
  prefetchLink: LinkPrefetchUnion
}

export const PrefetchConfigContext = createContext<PrefetchConfig>({
  prefetchLink: 'never',
})
