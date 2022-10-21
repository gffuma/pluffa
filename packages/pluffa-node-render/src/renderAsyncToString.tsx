import { ServerComponent, SkeletonComponent, SSRProvider } from '@pluffa/ssr'
import { WritableStreamBuffer } from 'stream-buffers'
import { render } from './render'
import { GetServerData, ServerData } from './types'

export interface RenderAsyncToStringConfig<Data> {
  Skeleton: SkeletonComponent
  Server: ServerComponent
  getServerData: GetServerData<Data>
  url: string
  entrypoints: Record<string, string[]>
  signal?: AbortSignal
}

export class AbortRenderingError extends Error {}

export async function renderAsyncToString<Data = any>({
  Skeleton,
  Server,
  getServerData,
  url,
  entrypoints,
  signal,
}: RenderAsyncToStringConfig<Data>) {
  const out = new WritableStreamBuffer()

  let serverData: ServerData<any> | undefined
  if (getServerData) {
    serverData = await getServerData({ url, entrypoints })
  }

  return new Promise<string>((resolve, reject) => {
    function handleAbort() {
      reactStream.abort()
      reject(new AbortRenderingError())
    }
    const reactStream = render(
      <SSRProvider
        value={{
          Server,
          data: serverData?.data,
          url,
          entrypoints,
        }}
      >
        <Skeleton />
      </SSRProvider>,
      out,
      {
        stopOnError: true,
        bootstrapScripts: serverData?.bootstrapModules,
        bootstrapModules: serverData?.bootstrapModules,
        bootstrapScriptContent: serverData?.bootstrapScriptContent,
        injectBeforeHeadClose: serverData?.injectBeforeHeadClose,
        injectBeforeBodyClose: serverData?.injectBeforeBodyClose,
        streamTransformers: serverData?.streamTransformers,
        onAllReady() {
          if (signal) {
            if (signal.aborted) {
              return
            } else {
              signal.removeEventListener('abort', handleAbort)
            }
          }
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
          reject(error)
        },
      }
    )
    if (signal) {
      signal.addEventListener('abort', handleAbort)
    }
  })
}
