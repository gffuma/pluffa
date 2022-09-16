import { AppProps } from '@pluffa/ssr/*'
import { RenderToPipeableStreamOptions } from 'react-dom/server'

export interface ServerData<Props>
  extends Pick<
    RenderToPipeableStreamOptions,
    'bootstrapScripts' | 'bootstrapModules' | 'bootstrapScriptContent'
  > {
  props: Props
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
}

export type GetServerData<Props = any> = (
  props: AppProps
) => ServerData<Props> | Promise<ServerData<Props>>