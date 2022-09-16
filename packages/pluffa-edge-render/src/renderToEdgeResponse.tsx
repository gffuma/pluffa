import { RenderToReadableStreamOptions } from 'react-dom/server'
import {
  AppComponent,
  AppProps,
  SkeletonComponent,
  SSRProvider,
} from '@pluffa/ssr'
import { render } from './render'

export interface ServerData<Props>
  extends Pick<
    RenderToReadableStreamOptions,
    'bootstrapScripts' | 'bootstrapModules' | 'bootstrapScriptContent'
  > {
  props: Props
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
}

export type GetServerData<Props = any> = (
  props: AppProps
) => ServerData<Props> | Promise<ServerData<Props>>

export interface RenderToEdgeResponseOptions<Props>
  extends Omit<
    RenderToReadableStreamOptions,
    'bootstrapScripts' | 'bootstrapModules' | 'bootstrapScriptContent'
  > {
  App: AppComponent<Props>
  getServerData: GetServerData<Props>
  Skeleton: SkeletonComponent
}

export async function renderToEdgeResponse<Props>(
  req: Request,
  {
    App,
    getServerData,
    Skeleton,
    ...reactRenderOptions
  }: RenderToEdgeResponseOptions<Props>
) {
  const urlParsed = new URL(req.url)
  const url = urlParsed.pathname

  let serverData: ServerData<any> | undefined
  if (getServerData) {
    serverData = await getServerData({ url: url })
  }
  // TODO: Maybe for other runtimes this don't exists ....
  // for now keep here maybe make more configurable ...
  const entrypoints = PLUFFA_BUNDLE_ENTRYPOINTS

  const stream = await render(
    <SSRProvider
      value={{
        App,
        props: serverData?.props,
        url: url,
        entrypoints,
      }}
    >
      <Skeleton entrypoints={entrypoints} />
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
            <Skeleton entrypoints={entrypoints} />
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
