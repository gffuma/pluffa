import { ReactNode, useContext } from 'react'
import { SSRContext } from './context'
import { SSRContextType } from './types'

export function useSSRContext<Data = any>(): SSRContextType<Data> {
  return useContext(SSRContext)
}

export function useSSRUrl() {
  return useSSRContext().url
}

export function useSSRData<Data = any>(): Data {
  return useSSRContext<Data>().data!
}

export function useSSRBundleEntrypoints() {
  return useSSRContext().entrypoints
}

export function SSRProvider({
  value,
  children,
}: {
  value: SSRContextType<any>
  children: ReactNode
}) {
  return <SSRContext.Provider value={value}>{children}</SSRContext.Provider>
}
