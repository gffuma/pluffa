import { RenderToReadableStreamOptions } from 'react-dom/server'
import { ServerComponent, SkeletonComponent, SSRProvider } from '@pluffa/ssr'
import { render } from './render'

export interface ServerData<Data>
  extends Pick<
    RenderToReadableStreamOptions,
    'bootstrapScripts' | 'bootstrapModules' | 'bootstrapScriptContent'
  > {
  data: Data
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
}

export interface GetServerDataConfig {
  url: string
  entrypoints: Record<string, string[]>
}

export type GetServerData<Data = any> = (
  config: GetServerDataConfig
) => ServerData<Data> | Promise<ServerData<Data>>

export interface RenderToEdgeResponseOptions<Data>
  extends Omit<
    RenderToReadableStreamOptions,
    'bootstrapScripts' | 'bootstrapModules' | 'bootstrapScriptContent'
  > {
  Skeleton: SkeletonComponent
  Server: ServerComponent
  getServerData?: GetServerData<Data>
}

export async function renderToEdgeResponse<Data = any>(
  req: Request,
  {
    Server,
    getServerData,
    Skeleton,
    ...reactRenderOptions
  }: RenderToEdgeResponseOptions<Data>
) {
  const urlParsed = new URL(req.url)
  const url = urlParsed.pathname

  // TODO: Maybe for other runtimes this don't exists ....
  // for now keep here maybe make more configurable ...
  const entrypoints = PLUFFA_BUNDLE_ENTRYPOINTS

  let serverData: ServerData<any> | undefined
  if (getServerData) {
    serverData = await getServerData({ url, entrypoints })
  }

  const stream = await render(
    <SSRProvider
      value={{
        Server,
        data: serverData?.data,
        url: url,
        entrypoints,
      }}
    >
      <Skeleton />
    </SSRProvider>,
    {
      ...reactRenderOptions,
      bootstrapScripts: serverData?.bootstrapModules,
      bootstrapModules: serverData?.bootstrapModules,
      bootstrapScriptContent: serverData?.bootstrapScriptContent,
      injectBeforeHeadClose: serverData?.injectBeforeHeadClose,
      injectBeforeBodyClose: serverData?.injectBeforeBodyClose,
      getClientRenderFallback() {
        return (
          <SSRProvider
            value={{
              url: req.url,
              entrypoints,
            }}
          >
            <Skeleton />
          </SSRProvider>
        )
      },
    }
  )
  return new Response(stream, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
}
