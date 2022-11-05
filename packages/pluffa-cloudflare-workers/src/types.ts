import type { RenderOptions } from '@pluffa/edge-render'
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
  response: InstructResponse
  request: RequestWrapper<Request>
}

export type GetServerData<Data = any> = (
  config: GetServerDataConfig
) => ServerData<Data> | Promise<ServerData<Data>>
