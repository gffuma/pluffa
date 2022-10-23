import type { Request, Response } from 'express'
import { RenderOptions } from './render'
import {
  SSRProvider,
  ServerComponent,
  SkeletonComponent,
  BundleInformation,
} from '@pluffa/ssr'
import { render } from './render'

export interface RenderToNodeResponseConfig<Data = any>
  extends Omit<RenderOptions, 'stopOnError' | 'getClientRenderFallback'> {
  Skeleton: SkeletonComponent
  Server: ServerComponent
  bundle: BundleInformation
  data?: Data
}

export function renderToNodeResponse<Props>(
  request: Request,
  response: Response,
  {
    Skeleton,
    Server,
    bundle,
    data,
    ...passOptions
  }: RenderToNodeResponseConfig<Props>
) {
  render(
    <SSRProvider
      value={{
        Server,
        request,
        bundle,
        data,
      }}
    >
      <Skeleton />
    </SSRProvider>,
    response,
    {
      ...passOptions,
      stopOnError: false,
      getClientRenderFallback() {
        return (
          <SSRProvider
            value={{
              request,
              bundle,
              data,
            }}
          >
            <Skeleton />
          </SSRProvider>
        )
      },
    }
  )
}
