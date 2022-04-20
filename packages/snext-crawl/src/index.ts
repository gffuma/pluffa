import { createContext, useContext, useId } from 'react'

export type CrawlSession = {
  register(id: string, source: CrawlSoruce): void
  rewind(): Promise<string[]>
}

export const SnextCrawlContext = createContext<null | CrawlSession>(null)

export type CrawlSoruce = string | string[] | (() => Promise<string[]>)

export function createCrawlSession(): CrawlSession {
  const sources = new Map<string, CrawlSoruce>()

  return {
    register(id: string, source: CrawlSoruce) {
      sources.set(id, source)
    },

    async rewind() {
      const promisePaths = Array.from(sources.values()).map((source) => {
        if (typeof source === 'string') {
          return Promise.resolve([source])
        } else if (Array.isArray(source)) {
          return Promise.resolve(source)
        } else {
          return source()
        }
      })
      sources.clear()
      const nestedPaths = await Promise.all(promisePaths)
      return nestedPaths.reduce((flat, paths) => {
        flat.push(...paths)
        return flat
      }, [] as string[])
    },
  }
}

export function useCrawl(source: CrawlSoruce): void {
  const id = useId()
  const ctx = useContext(SnextCrawlContext)
  if (ctx) {
    ctx.register(id, source)
  }
}
