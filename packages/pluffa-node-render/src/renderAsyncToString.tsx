import { ReactNode } from 'react'
import { WritableStreamBuffer } from 'stream-buffers'
import { RenderOptions } from './render'
import { render } from './render'

export class AbortRenderingError extends Error {}

export async function renderAsyncToString(
  children: ReactNode,
  renderOptions: RenderOptions = {},
  signal?: AbortSignal
) {
  const out = new WritableStreamBuffer()
  return new Promise<string>((resolve, reject) => {
    function handleAbort() {
      reactStream.abort()
      reject(new AbortRenderingError())
    }
    const reactStream = render(children, out, {
      ...renderOptions,
      onAllReady() {
        if (signal) {
          if (signal.aborted) {
            return
          } else {
            signal.removeEventListener('abort', handleAbort)
          }
        }
        renderOptions.onAllReady?.()
        out.on('finish', async () => {
          resolve(out.getContentsAsString() || '')
        })
      },
      onError(error) {
        if (signal) {
          if (signal.aborted) {
            return
          } else {
            signal.removeEventListener('abort', handleAbort)
          }
        }
        renderOptions.onError?.(error)
        reject(error)
      },
    })
    if (signal) {
      signal.addEventListener('abort', handleAbort)
    }
  })
}
