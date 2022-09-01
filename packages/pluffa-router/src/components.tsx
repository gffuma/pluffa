import { forwardRef, useContext } from 'react'
import { useRoutes } from 'react-router'
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
} from 'react-router-dom'
import { usePrefetchHandler } from './hooks'
import { RouterManagerContext } from './manager'
import type { PrefetchConfig } from './prefetchContext'

export function PageRoutes() {
  const manager = useContext(RouterManagerContext)
  return useRoutes(manager.routes)
}

export type LinkProps = RouterLinkProps & Partial<PrefetchConfig>

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ prefetchLink, ...props }, ref) => {
    const prefetchProps = usePrefetchHandler({ ...props, prefetchLink })
    return <RouterLink {...props} {...prefetchProps} ref={ref} />
  }
)

export type NavLinkProps = RouterNavLinkProps & Partial<PrefetchConfig>

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ prefetchLink, ...props }, ref) => {
    const prefetchProps = usePrefetchHandler({ ...props, prefetchLink })
    return <RouterNavLink {...props} {...prefetchProps} ref={ref} />
  }
)
