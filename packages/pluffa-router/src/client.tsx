import { BrowserHistory, createBrowserHistory } from 'history'
import {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { BrowserRouterProps, Router } from 'react-router-dom'
import { RouterManager, RouterManagerContext } from './manager'
import { LinkPrefetchUnion, PrefetchConfigContext } from './prefetchContext'

function BrowserRouter({
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

  const manager = useContext(RouterManagerContext)

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

interface ClientRouterProps extends BrowserRouterProps {
  manager: RouterManager
  prefetchLink?: LinkPrefetchUnion
}

export function ClientRouter({
  manager,
  children,
  prefetchLink = 'never',
  ...props
}: ClientRouterProps) {
  return (
    <RouterManagerContext.Provider value={manager}>
      <PrefetchConfigContext.Provider
        value={useMemo(
          () => ({
            prefetchLink,
          }),
          [prefetchLink]
        )}
      >
        <BrowserRouter {...props}>{children}</BrowserRouter>
      </PrefetchConfigContext.Provider>
    </RouterManagerContext.Provider>
  )
}

export { RouterManager }
