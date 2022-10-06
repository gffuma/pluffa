import type { Transform } from 'node:stream'
import { RenderToPipeableStreamOptions } from 'react-dom/server'

export interface ServerData<Data = any>
  extends Pick<
    RenderToPipeableStreamOptions,
    'bootstrapScripts' | 'bootstrapModules' | 'bootstrapScriptContent'
  > {
  data: Data
  streamTransformers?: Transform[]
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
