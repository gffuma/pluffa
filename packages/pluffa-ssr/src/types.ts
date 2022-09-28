import { ComponentType } from 'react'

export type ServerComponent = ComponentType<{}>

export type SkeletonComponent = ComponentType<{}>

export interface SSRContextType<Data> {
  Server?: ServerComponent
  data?: Data
  url: string
  entrypoints: Record<string, string[]>
}
