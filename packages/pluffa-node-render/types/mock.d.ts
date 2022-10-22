declare module 'mock-res' {
  import type { Response } from 'express'
  import type { Transform } from 'node:stream'
  interface MockRes extends Response, Transform {
    _getString(): string
  }
  interface MockResHack {
    new (): MockRes
  }
  const ExportMockRes: MockResHack
  export default ExportMockRes
}
