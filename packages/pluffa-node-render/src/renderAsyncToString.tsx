import {
  ServerComponent,
  SkeletonComponent,
  SSRProvider,
  BundleInformation,
} from '@pluffa/ssr'
import type { Request } from 'express'
import { WritableStreamBuffer } from 'stream-buffers'
import { RenderOptions } from './render'
import { render } from './render'

export interface RenderAsyncToStringConfig<Data = any>
  extends Omit<RenderOptions, 'stopOnError' | 'ssrMode'> {
  Skeleton: SkeletonComponent
  Server: ServerComponent
  bundle: BundleInformation
  data?: Data
  signal?: AbortSignal
}

export class AbortRenderingError extends Error {}

export async function renderAsyncToString<Data = any>(
  request: Request,
  {
    Skeleton,
    Server,
    bundle,
    data,
    signal,
    ...passOptions
  }: RenderAsyncToStringConfig<Data>
) {
  const out = new WritableStreamBuffer()

  return new Promise<string>((resolve, reject) => {
    function handleAbort() {
      reactStream.abort()
      reject(new AbortRenderingError())
    }
    const reactStream = render(
      <SSRProvider
        value={{
          Server,
          data,
          request,
          bundle,
        }}
      >
        <Skeleton />
      </SSRProvider>,
      out,
      {
        ...passOptions,
        stopOnError: true,
        ssrMode: 'seo',
        onAllReady() {
          if (signal) {
            if (signal.aborted) {
              return
            } else {
              signal.removeEventListener('abort', handleAbort)
            }
          }
          passOptions.onAllReady?.()
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
          passOptions.onError?.(error)
          reject(error)
        },
      }
    )
    if (signal) {
      signal.addEventListener('abort', handleAbort)
    }
  })
}
