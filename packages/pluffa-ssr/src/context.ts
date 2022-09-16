import { createContext } from 'react'
import { SSRContextType } from './types'

export const SSRContext = createContext<SSRContextType<any>>(null as never)
