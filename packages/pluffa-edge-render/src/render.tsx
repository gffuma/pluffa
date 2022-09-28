import { ReactElement, ReactNode } from 'react'
import {
  renderToReadableStream,
  RenderToReadableStreamOptions,
  renderToString,
} from 'react-dom/server'
import { createHtmlInjectTransformer, stringToStream } from './streamsUtils'

export interface RenderOptions extends RenderToReadableStreamOptions {
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
  getClientRenderFallback?: () => ReactElement
}

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

export async function render(
  children: ReactNode,
  {
    injectBeforeBodyClose,
    injectBeforeHeadClose,
    getClientRenderFallback,
    ...reactRenderOptions
  }: RenderOptions = {}
) {
  function transfromStream(stream: ReadableStream) {
    let out = stream
    if (injectBeforeBodyClose) {
      out = out.pipeThrough(
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
      out = out.pipeThrough(
        createHtmlInjectTransformer(
          '</head>',
          wrapInjectorWithErrorHandler(injectBeforeHeadClose, (err) => {
            console.error('Error when calling injectBeforeHeadClose()')
            console.error(err)
          })
        )
      )
    }
    return out
  }

  try {
    const reactStream = await renderToReadableStream(
      children,
      reactRenderOptions
    )
    await reactStream.allReady
    return transfromStream(reactStream)
  } catch (error) {
    // ... Try 2 Switch 2 Client Render ...
    if (getClientRenderFallback) {
      return transfromStream(
        stringToStream(renderToString(getClientRenderFallback()))
      )
    }
    throw error
  }
}
