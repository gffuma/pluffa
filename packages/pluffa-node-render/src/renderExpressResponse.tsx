import type { Request, Response } from 'express'
import { SSRProvider, ServerComponent, SkeletonComponent } from '@pluffa/ssr'
import { render } from './render'
import type { GetServerData, ServerData } from './types'

export interface ExpressSSRConfig<Data> {
  Skeleton: SkeletonComponent
  Server: ServerComponent
  getServerData?: GetServerData<Data>
  entrypoints: Record<string, string[]>
  onFatalError?: (error: unknown) => void
  onError?: (error: unknown) => void
}

export async function renderExpressResponse<Props>(
  req: Request,
  res: Response,
  {
    Skeleton,
    Server,
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
        Server,
        data: serverData?.data,
        url: req.url,
        entrypoints,
      }}
    >
      <Skeleton />
    </SSRProvider>,
    res,
    {
      bootstrapScripts: serverData?.bootstrapModules,
      bootstrapModules: serverData?.bootstrapModules,
      bootstrapScriptContent: serverData?.bootstrapScriptContent,
      injectBeforeHeadClose: serverData?.injectBeforeHeadClose,
      injectBeforeBodyClose: serverData?.injectBeforeBodyClose,
      streamTransformers: serverData?.streamTransformers,
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
      onError,
      onFatalError,
    }
  )
}
