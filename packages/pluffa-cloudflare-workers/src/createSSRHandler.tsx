import { render, RenderOptions } from '@pluffa/edge-render'
import cookie from 'cookie'
import {
  BundleInformation,
  ServerComponent,
  SkeletonComponent,
  SSRContextType,
  SSRProvider,
  InstructResponse,
  RequestWrapper,
} from '@pluffa/ssr'
import { GetServerData } from './types'

class InstructResponseCFResponse implements InstructResponse {
  _status: number
  _headers: Record<string, string>

  constructor() {
    this._status = 200
    this._headers = {}
  }

  status(code: number) {
    this._status = code
  }

  getStatus() {
    return this._status
  }

  getHeaders() {
    return this._headers
  }

  setHeader(name: string, value: string) {
    this._headers[name] = value
  }

  getHeader(name: string) {
    return this._headers[name]
  }
}

class EdgeRequestWrapper implements RequestWrapper<Request> {
  _request: Request
  _headers: Record<string, string>
  _url: string
  _cookies: Record<string, string> | null

  constructor(request: Request) {
    this._request = request
    this._headers = Object.fromEntries(request.headers)
    const url = new URL(request.url)
    this._url = url.pathname + url.search
    // Parse lazy...
    this._cookies = null
  }

  get body() {
    throw new Error('Not implemented.')
  }

  get headers() {
    return this._headers
  }

  get cookies() {
    if (!this._cookies) {
      this._cookies = cookie.parse(this._headers['cookie'] || '')
    }
    return this._cookies
  }

  get method() {
    return this._request.method
  }

  get url() {
    return this._url
  }

  getOriginal(): Request {
    return this._request
  }
}

export interface UserLandCFSSRConfig<Data = any> {
  Skeleton: SkeletonComponent
  Server: ServerComponent
  getServerData?: GetServerData<Data>
}

export function createSSRHandler<Data = any>({
  Server,
  Skeleton,
  getServerData,
}: UserLandCFSSRConfig<Data>) {
  return async function handleSSR(edgeRequest: Request) {
    const entrypoints = PLUFFA_BUNDLE_ENTRYPOINTS
    const bundle: BundleInformation = {
      entrypoints,
    }
    const request = new EdgeRequestWrapper(edgeRequest)
    const response = new InstructResponseCFResponse()

    const ctx: SSRContextType<Request, Data> = {
      bundle,
      response,
      request,
    }
    let providedRenderOptions: RenderOptions | undefined
    if (getServerData) {
      const { data, ...passDownRenderOptions } = await getServerData({
        bundle,
        response,
        request,
        mode: 'server',
      })
      providedRenderOptions = passDownRenderOptions
      ctx.data = data
    }
    const stream = await render(
      <SSRProvider
        value={{
          ...ctx,
          response,
          Server,
        }}
      >
        <Skeleton />
      </SSRProvider>,
      {
        ...providedRenderOptions,
        getClientRenderFallback() {
          return (
            <SSRProvider value={ctx}>
              <Skeleton />
            </SSRProvider>
          )
        },
      }
    )
    return new Response(stream, {
      status: response.getStatus(),
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        ...response.getHeaders(),
      },
    })
  }
}
