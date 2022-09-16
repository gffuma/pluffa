import { ReactNode, useContext } from 'react'
import { SSRContext } from './context'
import { SSRContextType } from './types'

export function useSSRContext() {
  return useContext(SSRContext)
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
