import { createContext } from 'react'
import { SSRContextType } from './types'

export const SSRContext = createContext<SSRContextType<any, any>>(null as never)
