import chalk from 'chalk'
import type { Request, Response } from 'express'
import {
  RenderToNodeResponseConfig,
  renderToNodeResponse,
} from '@pluffa/node-render'
import type { GetServerData, ServerData } from './types'

export type UserLandSSRConfig = Pick<
  RenderToNodeResponseConfig,
  'Server' | 'Skeleton' | 'bundle'
> & {
  getServerData?: GetServerData
}

export interface InternalSSRConfig {
  handleFatalSSRError(error: any, response: Response): void
}

export async function handleSSR(
  request: Request,
  response: Response,
  { Skeleton, Server, bundle, getServerData }: UserLandSSRConfig,
  { handleFatalSSRError }: InternalSSRConfig
) {
  let serverData: ServerData | undefined
  if (getServerData) {
    serverData = await getServerData({ bundle, request })
  }
  renderToNodeResponse(request, response, {
    ...serverData,
    Server,
    Skeleton,
    bundle,
    onError: (error) => {
      console.log(chalk.red('Error during server rendering'))
      console.log(error)
    },
    onFatalError: (error) => {
      // Unrecoverable fatal error during rendering
      handleFatalSSRError(error, response)
    },
  })
}
