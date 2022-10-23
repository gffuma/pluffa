import { ComponentType } from 'react'

export type ServerComponent = ComponentType<{}>

export type SkeletonComponent = ComponentType<{}>

export interface BundleInformation {
  entrypoints: Record<string, string[]>
  buildPath?: string
}

// Common request interface
// evry runtime can implement more specific request
// Eg:. Node use express Request, CF os CF Request ecc
// This interface is the barebone version of request...
export interface BaseRequest {
  url: string
}

export interface SSRContextType<TRequest extends BaseRequest, Data> {
  bundle: BundleInformation
  request: TRequest
  Server?: ServerComponent
  data?: Data
}
