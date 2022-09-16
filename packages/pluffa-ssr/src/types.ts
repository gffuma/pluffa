import { ComponentType } from 'react'

export interface AppProps {
  url: string
}

export type AppComponent<Props> = ComponentType<AppProps & Props>

export interface SkeletonProps {
  entrypoints: Record<string, string[]>
}

export type SkeletonComponent = ComponentType<SkeletonProps>

export interface SSRContextType<Props> {
  App?: AppComponent<Props>
  props?: Props
  url: string
  entrypoints: Record<string, string[]>
}
