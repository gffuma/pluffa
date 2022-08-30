import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { RouteObject, matchRoutes, RouteMatch, useRoutes } from 'react-router'
import { BrowserRouterProps, Router } from 'react-router-dom'
import { BrowserHistory, createBrowserHistory } from 'history'

interface PageRouteMatch extends RouteMatch {
  searchParams: URLSearchParams
}

export interface PageRouteObject<TProps = any> extends RouteObject {
  prefetchPage?(props: TProps, match: PageRouteMatch): any
}

export class PagesManager<TProps = any> {
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
            searchParams,
          })
        )
        .filter(Boolean) as Promise<unknown>[]
      await Promise.all(prefectPromises)
    }
  }
}

const PagesManagerContext = createContext<PagesManager>(null as never)

export function PageRoutes() {
  const manager = useContext(PagesManagerContext)
  return useRoutes(manager.routes)
}

export function PagesManagerProvider({
  manager,
  children,
}: {
  manager: PagesManager
  children: ReactNode
}) {
  return (
    <PagesManagerContext.Provider value={manager}>
      {children}
    </PagesManagerContext.Provider>
  )
}

export function BrowserRouter({
  basename,
  children,
  window,
}: BrowserRouterProps) {
  const historyRef = useRef<BrowserHistory>()
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window })
  }

  const history = historyRef.current
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  })

  const manager = useContext(PagesManagerContext)

  useLayoutEffect(
    () =>
      history.listen((update) => {
        const url = `${update.location.pathname}${update.location.search}`
        manager.prefetchUrl(url)
        update.location.pathname
        setState(update)
      }),
    [history, manager]
  )

  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  )
}
