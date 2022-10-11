import { createContext } from 'react'
import { matchRoutes, RouteMatch, RouteObject } from 'react-router-dom'

export type PageRouteObject<TProps = any> = RouteObject & {
  prefetchPage?(props: TProps, match: PageRouteMatch): any
  children?: PageRouteObject[]
}

export type PrefetchHandler<T = any> = (props: T, match: PageRouteMatch) => any

export interface PageRouteMatch extends RouteMatch {
  url: string
  searchParams: URLSearchParams
}

export class RouterManager<TProps = any> {
  readonly routes: PageRouteObject<TProps>[]
  readonly props?: TProps

  constructor(routes: PageRouteObject<TProps>[], props?: TProps) {
    this.routes = routes
    this.props = props
  }

  async prefetchUrl(url: string): Promise<void> {
    const match = matchRoutes(this.routes, url)
    if (match) {
      const searchParams = new URLSearchParams(new URL(`http://x${url}`).search)
      const prefectPromises = match
        .map((m) =>
          (m.route as PageRouteObject)?.prefetchPage?.(this.props, {
            ...m,
            url,
            searchParams,
          })
        )
        .filter(Boolean) as Promise<unknown>[]
      await Promise.all(prefectPromises)
    }
  }
}

export const RouterManagerContext = createContext<RouterManager>(null as never)
