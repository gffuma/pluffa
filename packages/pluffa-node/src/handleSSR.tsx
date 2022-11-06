import { render, RenderOptions } from '@pluffa/node-render'
import {
  BundleInformation,
  ServerComponent,
  SkeletonComponent,
  SSRContextType,
  SSRProvider,
} from '@pluffa/ssr'
import chalk from 'chalk'
import type { Request, Response } from 'express'
import { InstructNodeResponse, NodeRequestWrapper } from './httpWrappers'
import type { GetServerData } from './types'

export interface UserLandSSRConfig<Data = any> {
  Skeleton: SkeletonComponent
  Server: ServerComponent
  bundle: BundleInformation
  getServerData?: GetServerData<Data>
}

export interface InternalSSRConfig {
  handleFatalSSRError(error: any, response: Response): void
}

export async function handleSSR<Data = any>(
  nodeRequest: Request,
  nodeResponse: Response,
  { Skeleton, Server, bundle, getServerData }: UserLandSSRConfig<Data>,
  { handleFatalSSRError }: InternalSSRConfig
) {
  const request = new NodeRequestWrapper(nodeRequest)
  const response = new InstructNodeResponse(nodeResponse)

  const ssrCtx: SSRContextType<Request, Data> = {
    bundle,
    request,
    response,
  }
  let providedRenderOptions: RenderOptions | undefined
  if (getServerData) {
    const { data, ...passDownRenderOptions } = await getServerData({
      bundle,
      request,
      response,
      mode: 'server',
    })
    ssrCtx.data = data
    providedRenderOptions = passDownRenderOptions
  }
  render(
    <SSRProvider
      value={{
        ...ssrCtx,
        Server,
      }}
    >
      <Skeleton />
    </SSRProvider>,
    nodeResponse,
    {
      ...providedRenderOptions,
      stopOnError: false,
      getClientRenderFallback: () => (
        <SSRProvider value={ssrCtx}>
          <Skeleton />
        </SSRProvider>
      ),
      onError: (error) => {
        console.log(chalk.red('Error during server rendering'))
        console.log(error)
      },
      onFatalError: (error) => {
        // Unrecoverable fatal error during rendering
        handleFatalSSRError(error, nodeResponse)
      },
    }
  )
}
