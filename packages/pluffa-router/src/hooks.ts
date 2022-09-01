import {
  MouseEventHandler,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
} from 'react'
import { To } from 'react-router-dom'
import { RouterManagerContext } from './manager'
import { PrefetchConfig, PrefetchConfigContext } from './prefetchContext'

function composeEventHandlers<EventType extends SyntheticEvent | Event>(
  theirHandler: ((event: EventType) => any) | undefined,
  ourHandler: (event: EventType) => any
): (event: EventType) => any {
  return (event) => {
    theirHandler && theirHandler(event)
    if (!event.defaultPrevented) {
      ourHandler(event)
    }
  }
}

type PrefetchHandlerProps = Partial<PrefetchConfig> & {
  onMouseOver?: MouseEventHandler<Element>
  to: To
}

export function usePrefetchHandler(props: PrefetchHandlerProps) {
  const manager = useContext(RouterManagerContext)
  const globalConfig = useContext(PrefetchConfigContext)
  const prefetchLink = props.prefetchLink ?? globalConfig.prefetchLink

  let url =
    typeof props.to === 'string'
      ? props.to
      : props.to.pathname ?? '' + props.to.search ?? ''

  const prefetchOver = useCallback(() => {
    if (prefetchLink === 'intent') {
      manager.prefetchUrl(url)
    }
  }, [props.to, url, manager])

  useEffect(() => {
    if (prefetchLink === 'render') {
      manager.prefetchUrl(url)
    }
  }, [prefetchLink, manager, url])

  return {
    onMouseOver: composeEventHandlers(props.onMouseOver, prefetchOver),
  }
}
