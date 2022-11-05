import { InstructResponse, RequestWrapper } from '@pluffa/ssr'
import { Request, Response } from 'express'

export class InstructNodeResponse implements InstructResponse {
  _res: Response

  constructor(res: Response) {
    this._res = res
  }

  status(code: number) {
    if (!this._res.headersSent) {
      this._res.status(code)
    }
  }

  getStatus() {
    return this._res.statusCode
  }

  getHeaders() {
    return this._res.getHeaders()
  }

  setHeader(name: string, value: string) {
    this._res.setHeader(name, value)
  }

  getHeader(name: string) {
    return this._res.getHeader(name)
  }
}

export class NodeRequestWrapper implements RequestWrapper<Request> {
  _request: Request

  constructor(request: Request) {
    this._request = request
  }

  get body() {
    return this._request.body
  }

  get headers() {
    return this._request.headers
  }

  get method() {
    return this._request.method
  }

  get url() {
    return this._request.url
  }

  getOriginal(): Request {
    return this._request
  }
}
