import type { Request } from 'express'
import type { RenderOptions } from '@pluffa/node-render'
import type { BundleInformation } from '@pluffa/ssr'

export interface ServerData<Data = any>
  extends Pick<
    RenderOptions,
    | 'bootstrapScripts'
    | 'bootstrapModules'
    | 'bootstrapScriptContent'
    | 'streamTransformers'
    | 'injectBeforeBodyClose'
    | 'injectBeforeHeadClose'
  > {
  data: Data
}

export interface GetServerDataConfig {
  bundle: BundleInformation
  request: Request
}

export type GetServerData<Data = any> = (
  config: GetServerDataConfig
) => ServerData<Data> | Promise<ServerData<Data>>
