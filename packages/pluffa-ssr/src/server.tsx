import { ReactNode, useContext } from 'react'
import { SSRContext } from './context'
import { SSRContextType, BaseRequest } from './types'

export function useSSRContext<
  Request extends BaseRequest = BaseRequest,
  Data = any
>(): SSRContextType<Request, Data> {
  return useContext(SSRContext)
}

export function useSSRRequest<Request extends BaseRequest = BaseRequest>() {
  return useSSRContext<Request, any>().request
}

export function useSSRData<Data = any>(): Data {
  return useSSRContext<BaseRequest, Data>().data!
}

export function useSSRBundleInfo() {
  return useSSRContext().bundle
}
export function getScripts(
  entrypoints: Record<string, string[]>,
  entry = 'main'
) {
  return entrypoints[entry]
    .filter((e) => e.endsWith('.js'))
    .map((e) => `<script src="/${e}"></script>`)
    .join('')
}

export function getStyles(
  entrypoints: Record<string, string[]>,
  entry = 'main'
) {
  return entrypoints[entry]
    .filter((e) => e.endsWith('.css'))
    .map((e) => `<link href="/${e} rel="stylesheet" />`)
    .join('')
}

export function SSRProvider<TRequest extends BaseRequest, Data>({
  value,
  children,
}: {
  value: SSRContextType<TRequest, Data>
  children: ReactNode
}) {
  return <SSRContext.Provider value={value}>{children}</SSRContext.Provider>
}
