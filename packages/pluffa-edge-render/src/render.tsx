import { ReactElement, ReactNode } from 'react'
import {
  renderToReadableStream,
  RenderToReadableStreamOptions,
  renderToString,
} from 'react-dom/server'
import {
  createTagHtmlInjectTransformer,
  createEndHtmlInjectTransformer,
  stringToStream,
} from './streamsUtils'

export type RenderingMode = 'seo' | 'streaming'

export interface RenderOptions extends RenderToReadableStreamOptions {
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
  injectOnEnd?: () => string
  injectBeforeEveryScript?: () => string
  mode?: RenderingMode
  getClientRenderFallback?: () => ReactElement
}

export async function render(
  children: ReactNode,
  {
    injectBeforeBodyClose,
    injectBeforeHeadClose,
    injectBeforeEveryScript,
    injectOnEnd,
    getClientRenderFallback,
    mode = 'seo',
    ...reactRenderOptions
  }: RenderOptions = {}
) {
  function transfromStream(stream: ReadableStream) {
    let out = stream
    if (injectBeforeBodyClose) {
      out = out.pipeThrough(
        createTagHtmlInjectTransformer('</body>', true, injectBeforeBodyClose)
      )
    }
    if (injectBeforeHeadClose) {
      out = out.pipeThrough(
        createTagHtmlInjectTransformer('</head>', true, injectBeforeHeadClose)
      )
    }
    if (injectBeforeEveryScript) {
      out = out.pipeThrough(
        createTagHtmlInjectTransformer(
          '<script>',
          false,
          injectBeforeEveryScript
        )
      )
    }
    if (injectOnEnd) {
      out = out.pipeThrough(
        createEndHtmlInjectTransformer(injectOnEnd)
      )
    }
    return out
  }

  try {
    const reactStream = await renderToReadableStream(
      children,
      reactRenderOptions
    )
    if (mode === 'seo') {
      await reactStream.allReady
    }
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
