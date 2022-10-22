/**
 * Credit: Howard Abrams <howard.abrams@gmail.com>
 *
 * Based on node-mocks-http:
 * https://github.com/howardabrams/node-mocks-http/blob/master/lib/mockRequest.js
 */

import { Request } from 'express'
import url from 'url'
import typeis from 'type-is'
import accepts from 'accepts'
import parseRange from 'range-parser'
import { EventEmitter } from 'events'

function convertKeysToLowerCase<T>(map: Record<string, T>): Record<string, T> {
  const newMap: Record<string, T> = {}
  for (const key in map) {
    newMap[key.toLocaleLowerCase()] = map[key]
  }
  return newMap
}

function parseQs(raw: string) {
  const s = new URLSearchParams(raw)
  const result: Record<string, string | string[]> = {}
  for (const [key, value] of s.entries()) {
    if (result[key] && !Array.isArray(result[key])) {
      result[key] = [result[key] as string]
    }
    if (Array.isArray(result[key])) {
      ;(result[key] as string[]).push(value)
    } else {
      result[key] = value
    }
  }
  return result
}

export type CreateRequestOptions = Partial<
  Pick<
    Request,
    | 'method'
    | 'url'
    | 'originalUrl'
    | 'baseUrl'
    | 'path'
    | 'params'
    | 'cookies'
    | 'headers'
    | 'body'
    | 'query'
    | 'ip'
    | 'protocol'
  >
>

export default function createRequest(options?: CreateRequestOptions): Request {
  if (!options) {
    options = {}
  }

  // create mockRequest
  const mockRequest = Object.create(EventEmitter.prototype) as Request
  EventEmitter.call(mockRequest)

  mockRequest.method = options.method ? options.method : 'GET'
  mockRequest.url = options.url || options.path || ''
  mockRequest.originalUrl = options.originalUrl || mockRequest.url
  mockRequest.baseUrl = options.baseUrl || mockRequest.url
  mockRequest.path =
    options.path || (options.url ? url.parse(options.url).pathname || '' : '')
  mockRequest.params = options.params ? options.params : {}
  mockRequest.cookies = options.cookies ? options.cookies : {}
  mockRequest.headers = options.headers
    ? convertKeysToLowerCase(options.headers)
    : {}
  mockRequest.body = options.body ? options.body : {}
  mockRequest.query = options.query ? options.query : {}
  mockRequest.socket = {} as any

  mockRequest.ip = options.ip || '127.0.0.1'
  mockRequest.ips = [mockRequest.ip]

  mockRequest.protocol = options.protocol || 'http'
  mockRequest.httpVersion = '1.1'
  mockRequest.httpVersionMajor = 1
  mockRequest.httpVersionMinor = 1

  mockRequest._destroy = () => {}
  mockRequest._destroy = () => {}
  mockRequest._read = () => {}

  mockRequest.app = {} as any

  mockRequest.stale = true
  mockRequest.fresh = false

  //parse query string from url to object
  if (Object.keys(mockRequest.query).length === 0) {
    mockRequest.query = parseQs(mockRequest.url.split('?')[1])

    if (!mockRequest.query.hasOwnProperty) {
      Object.defineProperty(mockRequest.query, 'hasOwnProperty', {
        enumerable: false,
        value: Object.hasOwnProperty.bind(mockRequest.query),
      })
    }
  }

  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     mockRequest.get('Content-Type');
   *     // => "text/plain"
   *
   *     mockRequest.get('content-type');
   *     // => "text/plain"
   *
   *     mockRequest.get('Something');
   *     // => undefined
   *
   * Aliased as `mockRequest.header()`.
   *
   * @param {String} name
   * @return {String}
   * @api public
   */
  mockRequest.get = mockRequest.header = function (name: string) {
    name = name.toLowerCase()
    switch (name) {
      case 'referer':
      case 'referrer':
        return mockRequest.headers.referrer || mockRequest.headers.referer
      default:
        return mockRequest.headers[name]
    }
  } as Request['get']

  /**
   * Function: is
   *
   *   Checks for matching content types in the content-type header.
   *   Requires a request body, identified by transfer-encoding or content-length headers
   *
   * Examples:
   *
   *     mockRequest.headers['content-type'] = 'text/html';
   *     mockRequest.headers['transfer-encoding'] = 'chunked';
   *     mockRequest.headers['content-length'] = '100';
   *
   *     mockRequest.is('html');
   *     // => "html"
   *
   *     mockRequest.is('json');
   *     // => false
   *
   *     mockRequest.is(['json', 'html', 'text']);
   *     // => "html"
   */
  mockRequest.is = function (types: string | string[]) {
    if (!Array.isArray(types)) {
      types = [].slice.call(arguments)
    }
    return typeis(mockRequest, types)
  }

  /**
   * Function: accepts
   *
   *   Checks for matching content types in the Accept header.
   *
   * Examples:
   *
   *     mockRequest.headers['accept'] = 'application/json'
   *
   *     mockRequest.accepts('json');
   *     // => 'json'
   *
   *     mockRequest.accepts('html');
   *     // => false
   *
   *     mockRequest.accepts(['html', 'json']);
   *     // => 'json'
   *
   */
  mockRequest.accepts = function (types: string[]) {
    var Accepts = accepts(mockRequest)
    return Accepts.type(types)
  } as Request['accepts']

  /**
   * Check if the given `encoding`s are accepted.
   *
   */
  mockRequest.acceptsEncodings = function (encodings: string | string[]) {
    if (!Array.isArray(encodings)) {
      encodings = [].slice.call(arguments)
    }

    var accept = accepts(mockRequest)
    return accept.encodings(encodings)
  } as Request['acceptsEncodings']

  /**
   * Check if the given `charset`s are acceptable,
   * otherwise you should respond with 406 "Not Acceptable".
   */
  mockRequest.acceptsCharsets = function (charsets?: string | string[]) {
    if (!Array.isArray(charsets)) {
      charsets = [].slice.call(arguments)
    }

    var accept = accepts(mockRequest)
    return accept.charsets(charsets)
  } as Request['acceptsCharsets']

  /**
   * Check if the given `lang`s are acceptable,
   * otherwise you should respond with 406 "Not Acceptable".
   */
  mockRequest.acceptsLanguages = function (languages: string | string[]) {
    if (!Array.isArray(languages)) {
      languages = [].slice.call(arguments)
    }

    var accept = accepts(mockRequest)
    return accept.languages(languages)
  } as Request['acceptsLanguages']

  /**
   * Function: range
   *
   * Parse Range header field, capping to the given `size`.
   *
   * Unspecified ranges such as "0-" require knowledge of your resource length. In
   * the case of a byte range this is of course the total number of bytes. If the
   * Range header field is not given `undefined` is returned, `-1` when unsatisfiable,
   * and `-2` when syntactically invalid.
   *
   * When ranges are returned, the array has a "type" property which is the type of
   * range that is required (most commonly, "bytes"). Each array element is an object
   * with a "start" and "end" property for the portion of the range.
   *
   * The "combine" option can be set to `true` and overlapping & adjacent ranges
   * will be combined into a single range.
   *
   * NOTE: remember that ranges are inclusive, so for example "Range: users=0-3"
   * should respond with 4 users when available, not 3.
   */
  mockRequest.range = function (size: number, opts: any) {
    var range = mockRequest.get('Range')
    if (!range) {
      return
    }
    return parseRange(size, range, opts)
  }

  /**
   * Function: param
   *
   *   Return the value of param name when present.
   *   Lookup is performed in the following order:
   *   - req.params
   *   - req.body
   *   - req.query
   */
  mockRequest.param = function (parameterName: string, defaultValue: any) {
    if (mockRequest.params.hasOwnProperty(parameterName)) {
      return mockRequest.params[parameterName]
    } else if (mockRequest.body.hasOwnProperty(parameterName)) {
      return mockRequest.body[parameterName]
    } else if (mockRequest.query.hasOwnProperty(parameterName)) {
      return mockRequest.query[parameterName]
    }
    return defaultValue
  }

  /**
   * Function: hostname
   *
   * If Hostname is not set explicitly, then derive it from the Host header without port information
   *
   */
  if (!mockRequest.hostname) {
    mockRequest.hostname = (function () {
      if (!mockRequest.headers.host) {
        return ''
      }

      var hostname = mockRequest.headers.host.split(':')[0].split('.')
      return hostname.join('.')
    })()
  }

  /**
   * Function: subdomains
   *
   *    Subdomains are the dot-separated parts of the host before the main domain of the app.
   *
   */
  mockRequest.subdomains = (function () {
    if (!mockRequest.headers.host) {
      return []
    }

    var offset = 2
    var subdomains = mockRequest.headers.host.split('.').reverse()

    return subdomains.slice(offset)
  })()

  return mockRequest
}
