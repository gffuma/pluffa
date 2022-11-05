import { ComponentType } from 'react'

export type ServerComponent = ComponentType<{}>

export type SkeletonComponent = ComponentType<{}>

export interface BundleInformation {
  entrypoints: Record<string, string[]>
  buildPath?: string
}

// Wrap request to have a common surface of common Apis
// between runtimes ... You can call getOriginal() to access
// the low level request object in current runtime
export interface RequestWrapper<TRequest, TBody = any> {
  url: string
  method: string
  headers: Record<string, any>
  body: TBody
  getOriginal(): TRequest
}

// Instruct the response in all envs...
// TODO: Maybe make more compilant \w standatds
export interface InstructResponse {
  status(code: number): void
  setHeader(name: string, value: string): void
  getHeader(name: string): void
  // TODO: Support cookie???
}

export interface SSRContextType<TRequest, Data = any> {
  bundle: BundleInformation
  request: RequestWrapper<TRequest>
  Server?: ServerComponent
  data?: Data
  response?: InstructResponse
}
