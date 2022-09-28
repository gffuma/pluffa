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
}

export async function renderAsyncToString<Data = any>({
  Skeleton,
  Server,
  getServerData,
  url,
  entrypoints,
}: RenderAsyncToStringConfig<Data>) {
  const out = new WritableStreamBuffer()

  let serverData: ServerData<any> | undefined
  if (getServerData) {
    serverData = await getServerData({ url })
  }

  return new Promise<string>((resolve, reject) => {
    render(
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
          out.on('finish', async () => {
            resolve(out.getContentsAsString() || '')
          })
        },
        onError(error) {
          reject(error)
        },
      }
    )
  })
}
