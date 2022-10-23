import { RenderToReadableStreamOptions } from 'react-dom/server'
import {
  BundleInformation,
  ServerComponent,
  SkeletonComponent,
  SSRProvider,
} from '@pluffa/ssr'
import { render } from './render'

export interface RenderToEdgeResponseOptions<Data = any>
  extends RenderToReadableStreamOptions {
  Skeleton: SkeletonComponent
  Server: ServerComponent
  data?: Data
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
}

export async function renderToEdgeResponse<Data = any>(
  request: Request,
  {
    Server,
    Skeleton,
    data,
    ...reactRenderOptions
  }: RenderToEdgeResponseOptions<Data>
) {
  // TODO: Maybe for other runtimes this don't exists ....
  // for now keep here maybe make more configurable ...
  const entrypoints = PLUFFA_BUNDLE_ENTRYPOINTS
  const bundle: BundleInformation = {
    entrypoints,
  }

  const stream = await render(
    <SSRProvider
      value={{
        Server,
        bundle,
        request,
        data,
      }}
    >
      <Skeleton />
    </SSRProvider>,
    {
      ...reactRenderOptions,
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
  return new Response(stream, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })
}
