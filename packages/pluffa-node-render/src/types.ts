import { AppProps } from '@pluffa/ssr'
import type { Transform } from 'node:stream'
import { RenderToPipeableStreamOptions } from 'react-dom/server'

export interface ServerData<Props>
  extends Pick<
    RenderToPipeableStreamOptions,
    'bootstrapScripts' | 'bootstrapModules' | 'bootstrapScriptContent'
  > {
  props: Props
  streamTransformers?: Transform[]
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
}

export type GetServerData<Props = any> = (
  props: AppProps
) => ServerData<Props> | Promise<ServerData<Props>>

export { AppProps }