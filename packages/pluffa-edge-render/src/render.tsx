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
        createHtmlInjectTransformer('</body>', injectBeforeBodyClose)
      )
    }
    if (injectBeforeHeadClose) {
      out = out.pipeThrough(
        createHtmlInjectTransformer('</head>', injectBeforeHeadClose)
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
