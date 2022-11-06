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
export function getScriptsFiles(
  entrypoints: Record<string, string[]>,
  entry = 'main'
) {
  return entrypoints[entry].filter((e) => e.endsWith('.js'))
}

export function getScriptsTags(
  entrypoints: Record<string, string[]>,
  entry = 'main'
) {
  return getScriptsFiles(entrypoints, entry)
    .map((e) => `<script src="/${e}"></script>`)
    .join('')
}

export function getStylesFiles(
  entrypoints: Record<string, string[]>,
  entry = 'main'
) {
  return entrypoints[entry].filter((e) => e.endsWith('.css'))
}

export function getStylesTags(
  entrypoints: Record<string, string[]>,
  entry = 'main'
) {
  return getStylesFiles(entrypoints, entry)
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
