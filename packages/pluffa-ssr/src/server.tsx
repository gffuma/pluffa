import { ReactNode, useContext } from 'react'
import { SSRContext } from './context'
import { SSRContextType } from './types'

export function useSSRContext<TRequest = any, Data = any>(): SSRContextType<
  TRequest,
  Data
> {
  return useContext(SSRContext)
}

export function useSSRRequest<TRequest>() {
  return useSSRContext<TRequest>().request
}

export function useSSRData<Data = any>(): Data {
  return useSSRContext<any, Data>().data!
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

export function SSRProvider<TRequest, Data>({
  value,
  children,
}: {
  value: SSRContextType<TRequest, Data>
  children: ReactNode
}) {
  return <SSRContext.Provider value={value}>{children}</SSRContext.Provider>
}
