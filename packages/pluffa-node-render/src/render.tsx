import { ReactElement, ReactNode } from 'react'
import {
  renderToPipeableStream,
  RenderToPipeableStreamOptions,
  renderToString,
} from 'react-dom/server'
import { compose, Writable, Transform } from 'stream'
import {
  createEndHtmlInjectTransformer,
  createTagHtmlInjectTransformer,
} from './nodeStreamsUtils'

export interface RenderOptions extends RenderToPipeableStreamOptions {
  stopOnError?: boolean
  onFatalError?: (error: unknown) => void
  getClientRenderFallback?: () => ReactElement
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
  injectOnEnd?: () => string
  streamTransformers?: Transform[]
}

export function render(
  children: ReactNode,
  writable: Writable,
  {
    injectBeforeBodyClose,
    injectBeforeHeadClose,
    injectOnEnd,
    onFatalError,
    stopOnError,
    getClientRenderFallback,
    streamTransformers = [],
    ...reactRenderOptions
  }: RenderOptions = {}
) {
  const transfomers: Transform[] = [...streamTransformers]

  if (injectBeforeBodyClose) {
    transfomers.push(
      createTagHtmlInjectTransformer('</body>', injectBeforeBodyClose)
    )
  }

  if (injectBeforeHeadClose) {
    transfomers.push(
      createTagHtmlInjectTransformer('</head>', injectBeforeHeadClose)
    )
  }

  if (injectOnEnd) {
    transfomers.push(
      createEndHtmlInjectTransformer(injectOnEnd)
    )
  }

  let didError = false
  let didShellError = false
  let didStreamPrematureClosed = false
  let writableWrapper: Writable = writable
  if (transfomers.length > 0) {
    writableWrapper = compose(...transfomers, writable)
    writableWrapper.on('error', (error: any) => {
      // NOTE: compose is thinked to consume all the stream
      // so when wrap write stream if an user close the connection
      // this error will be raised ... if not handled make all app to crash
      // unhandled error ...
      // so simply keep trak of them and stop writing to stream
      if (error.code === 'ERR_STREAM_PREMATURE_CLOSE') {
        didStreamPrematureClosed = true
        return
      }
      console.error('Error in writable stream')
      console.error(error)
    })
  }
  const reactStream = renderToPipeableStream(children, {
    ...reactRenderOptions,
    onShellReady() {
      if (didStreamPrematureClosed) {
        return
      }
      reactRenderOptions?.onShellReady?.()
    },
    onAllReady() {
      if (didStreamPrematureClosed) {
        return
      }
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
      if (didStreamPrematureClosed) {
        return
      }
      reactRenderOptions.onShellError?.(error)
      didShellError = true
      if (!getClientRenderFallback && onFatalError) {
        onFatalError(error)
      }
    },
    onError(error) {
      if (didStreamPrematureClosed) {
        return
      }
      didError = true
      reactRenderOptions.onError?.(error)
    },
  })
  return reactStream
}
