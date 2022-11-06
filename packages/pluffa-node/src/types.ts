import type { Request } from 'express'
import type { RenderOptions } from '@pluffa/node-render'
import type {
  BundleInformation,
  InstructResponse,
  RequestWrapper,
} from '@pluffa/ssr'

export interface ServerData<Data = any>
  extends Pick<
    RenderOptions,
    | 'bootstrapScripts'
    | 'bootstrapModules'
    | 'bootstrapScriptContent'
    | 'streamTransformers'
    | 'injectBeforeBodyClose'
    | 'injectBeforeHeadClose'
    | 'injectOnEnd'
    | 'injectBeforeEveryScript'
    | 'mode'
    | 'onError'
  > {
  data?: Data
}

export interface GetServerDataConfig {
  bundle: BundleInformation
  request: RequestWrapper<Request>
  response: InstructResponse
  mode: 'server' | 'staticizer'
}

export type GetServerData<Data = any> = (
  config: GetServerDataConfig
) => ServerData<Data> | Promise<ServerData<Data>>
