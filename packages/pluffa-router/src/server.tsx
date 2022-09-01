import { RouterManager, RouterManagerContext } from './manager'
import { StaticRouter, StaticRouterProps } from 'react-router-dom/server.js'

interface ServerRouterProps extends StaticRouterProps {
  manager: RouterManager
}

export function ServerRouter({
  manager,
  children,
  ...props
}: ServerRouterProps) {
  return (
    <RouterManagerContext.Provider value={manager}>
      <StaticRouter {...props}>{children}</StaticRouter>
    </RouterManagerContext.Provider>
  )
}

export { RouterManager }
