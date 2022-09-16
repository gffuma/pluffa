import type { Request, Response } from 'express'
import { SSRProvider, AppComponent, SkeletonComponent } from '@pluffa/ssr'
import { render } from './render'
import type { GetServerData, ServerData } from './types'

export interface ExpressSSRConfig<Props> {
  App: AppComponent<Props>
  getServerData?: GetServerData<Props>
  Skeleton: SkeletonComponent
  entrypoints: Record<string, string[]>
  onFatalError?: (error: unknown) => void
  onError?: (error: unknown) => void
}

export async function renderExpressResponse<Props>(
  req: Request,
  res: Response,
  {
    App,
    Skeleton,
    getServerData,
    entrypoints,
    onError,
    onFatalError,
  }: ExpressSSRConfig<Props>
) {
  let serverData: ServerData<any> | undefined
  if (getServerData) {
    serverData = await getServerData({ url: req.url })
  }
  render(
    <SSRProvider
      value={{
        App,
        props: serverData?.props,
        url: req.url,
        entrypoints,
      }}
    >
      <Skeleton entrypoints={entrypoints} />
    </SSRProvider>,
    res,
    {
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
      onError,
      onFatalError,
    }
  )
}
