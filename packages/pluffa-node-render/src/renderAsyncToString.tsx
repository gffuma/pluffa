import { AppComponent, SkeletonComponent, SSRProvider } from '@pluffa/ssr'
import { WritableStreamBuffer } from 'stream-buffers'
import { render } from './render'
import { GetServerData, ServerData } from './types'

export interface RenderAsyncToStringConfig<Props> {
  App: AppComponent<Props>
  getServerData: GetServerData<Props>
  Skeleton: SkeletonComponent
  url: string
  entrypoints: Record<string, string[]>
}

export async function renderAsyncToString<Props>({
  App,
  Skeleton,
  getServerData,
  url,
  entrypoints,
}: RenderAsyncToStringConfig<Props>) {
  const out = new WritableStreamBuffer()

  let serverData: ServerData<any> | undefined
  if (getServerData) {
    serverData = await getServerData({ url })
  }

  return new Promise<string>((resolve, reject) => {
    render(
      <SSRProvider
        value={{
          App,
          props: serverData?.props,
          url,
          entrypoints,
        }}
      >
        <Skeleton entrypoints={entrypoints} />
      </SSRProvider>,
      out,
      {
        stopOnError: true,
        bootstrapScripts: serverData?.bootstrapModules,
        bootstrapModules: serverData?.bootstrapModules,
        bootstrapScriptContent: serverData?.bootstrapScriptContent,
        injectBeforeHeadClose: serverData?.injectBeforeHeadClose,
        injectBeforeBodyClose: serverData?.injectBeforeBodyClose,
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
