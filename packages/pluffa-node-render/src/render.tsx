import { ReactElement, ReactNode } from 'react'
import {
  renderToPipeableStream,
  RenderToPipeableStreamOptions,
  renderToString,
} from 'react-dom/server'
import { compose, Writable, Transform } from 'stream'
import { createHtmlInjectTransformer } from './nodeStreamsUtils'

function wrapInjectorWithErrorHandler(
  injector: () => string,
  erorrHandler: (err: unknown) => void
) {
  return () => {
    try {
      return injector()
    } catch (err) {
      erorrHandler(err)
      return ''
    }
  }
}

export interface RenderOptions extends RenderToPipeableStreamOptions {
  stopOnError?: boolean
  onFatalError?: (error: unknown) => void
  getClientRenderFallback?: () => ReactElement
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
}

export function render(
  children: ReactNode,
  writable: Writable,
  {
    injectBeforeBodyClose,
    injectBeforeHeadClose,
    onFatalError,
    stopOnError,
    getClientRenderFallback,
    ...reactRenderOptions
  }: RenderOptions = {}
) {
  const transfomers: Transform[] = []

  if (injectBeforeBodyClose) {
    transfomers.push(
      createHtmlInjectTransformer(
        '</body>',
        wrapInjectorWithErrorHandler(injectBeforeBodyClose, (err) => {
          console.error('Error when calling injectBeforeBodyClose()')
          console.error(err)
        })
      )
    )
  }

  if (injectBeforeHeadClose) {
    transfomers.push(
      createHtmlInjectTransformer(
        '</head>',
        wrapInjectorWithErrorHandler(injectBeforeHeadClose, (err) => {
          console.error('Error when calling injectBeforeHeadClose()')
          console.error(err)
        })
      )
    )
  }

  let writableWrapper: Writable = writable
  if (transfomers.length > 0) {
    writableWrapper = compose(...transfomers, writable)
  }
  let didError = false
  let didShellError = false
  const reactStream = renderToPipeableStream(children, {
    ...reactRenderOptions,
    onAllReady() {
      reactRenderOptions.onAllReady?.()
      if (didError && stopOnError) {
        return
      }
      if (didShellError) {
        // Nothing to do
        if (!getClientRenderFallback) {
          return
        }
        // Try 2 Switch to client rendering on shell error
        let html = ''
        try {
          html = renderToString(getClientRenderFallback())
        } catch (err) {
          // Giving up show 500 ...
          if (onFatalError) {
            onFatalError(err)
            return
          }
          throw err
        }
        writableWrapper.write(`<!DOCTYPE html>${html}`)
        writableWrapper.end()
      } else {
        // Stream react when all ok all we have a recoverable error ...
        reactStream.pipe(writableWrapper)
      }
    },
    onShellError(error) {
      reactRenderOptions.onShellError?.(error)
      didShellError = true
      if (!getClientRenderFallback && onFatalError) {
        onFatalError(error)
      }
    },
    onError(error) {
      didError = true
      reactRenderOptions.onError?.(error)
    },
  })
}
