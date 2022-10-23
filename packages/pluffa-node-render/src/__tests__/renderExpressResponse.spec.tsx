import MockRes from 'mock-res'
import { useSSRData } from '@pluffa/ssr'
import { Root } from '@pluffa/ssr/skeleton'
import { Request } from 'express'
import { renderToNodeResponse } from '../renderToNodeResponse'

export interface Resource<T> {
  read(): T
}

function wrapPromise<T>(promise: Promise<T>): Resource<T> {
  let status: 'pending' | 'success' | 'error' = 'pending'
  let result: T
  let suspender = promise.then(
    (r) => {
      status = 'success'
      result = r
    },
    (e) => {
      status = 'error'
      result = e
    }
  )
  return {
    read() {
      if (status === 'pending') {
        throw suspender
      } else if (status === 'error') {
        throw result
      }
      return result
    },
  }
}

it('should render Skeleton and Server', async () => {
  const req = {
    url: '/',
  } as Request
  const res = new MockRes()
  function Skeleton() {
    return (
      <html>
        <Root />
      </html>
    )
  }
  function Server() {
    return <div>Hello World!</div>
  }
  await renderToNodeResponse(req, res, {
    Skeleton,
    Server,
    bundle: {
      entrypoints: {},
    },
  })
  await new Promise((r) => res.on('finish', r))
  const html = res._getString()
  expect(html).toBe('<!DOCTYPE html><html><div>Hello World!</div></html>')
})

it('should render Server with suspense', async () => {
  const req = {
    url: '/',
  } as Request
  const res = new MockRes()
  function Skeleton() {
    return (
      <html>
        <Root />
      </html>
    )
  }
  let resolve: (v: string) => void
  const p = new Promise<string>((r) => (resolve = r))
  const resource = wrapPromise(p)
  function Server() {
    const v = resource.read()
    return (
      <div>
        Hello <b>{v}</b> World!
      </div>
    )
  }
  await renderToNodeResponse(req, res, {
    Skeleton,
    Server,
    bundle: {
      entrypoints: {},
    },
  })
  resolve!('Async')
  await new Promise((r) => res.on('finish', r))
  const html = res._getString()
  expect(html).toBe(
    '<!DOCTYPE html><html><div>Hello <b>Async</b> World!</div></html>'
  )
})

it('should provide data from to Server component', async () => {
  const req = {
    url: '/',
  } as Request
  const res = new MockRes()
  function Skeleton() {
    return (
      <html>
        <Root />
      </html>
    )
  }
  function Server() {
    const { foo } = useSSRData()
    return (
      <div>
        Hello <i>{foo}</i> World!
      </div>
    )
  }
  await renderToNodeResponse(req, res, {
    Skeleton,
    Server,
    bundle: {
      entrypoints: {},
    },
    data: {
      foo: 'Fuzzy',
    },
  })
  await new Promise((r) => res.on('finish', r))
  const html = res._getString()
  expect(html).toBe(
    '<!DOCTYPE html><html><div>Hello <i>Fuzzy</i> World!</div></html>'
  )
})

it('should inject content before head close', async () => {
  const req = {
    url: '/',
  } as Request
  const res = new MockRes()

  function Skeleton() {
    return (
      <html>
        <head></head>
        <body>
          <Root />
        </body>
      </html>
    )
  }
  function Server() {
    return <div>Hello World!</div>
  }

  await renderToNodeResponse(req, res, {
    Skeleton,
    Server,
    bundle: {
      entrypoints: {},
    },
    injectBeforeHeadClose: () => '<title>Hello</title>',
  })

  await new Promise((r) => res.on('finish', r))
  const html = res._getString()
  expect(html).toBe(
    '<!DOCTYPE html><html><head><title>Hello</title></head><body><div>Hello World!</div></body></html>'
  )
})

it('should inject content before body close', async () => {
  const req = {
    url: '/',
  } as Request
  const res = new MockRes()

  function Skeleton() {
    return (
      <html>
        <body>
          <Root />
        </body>
      </html>
    )
  }
  function Server() {
    return <div>Hello World!</div>
  }

  await renderToNodeResponse(req, res, {
    Skeleton,
    Server,
    bundle: {
      entrypoints: {},
    },
    injectBeforeBodyClose: () => '<script>alert(99);</script>',
  })

  await new Promise((r) => res.on('finish', r))
  const html = res._getString()
  expect(html).toBe(
    '<!DOCTYPE html><html><body><div>Hello World!</div><script>alert(99);</script></body></html>'
  )
})

// // it('should handle error', async () => {
// //   const req = {
// //     url: '/',
// //   } as Request
// //   const res = new MockRes()

// //   function Skeleton() {
// //     return (
// //       <html>
// //         <body>
// //           <Root />
// //         </body>
// //       </html>
// //     )
// //   }
// //   function Boom() {
// //     throw new Error('BooM')
// //     return null
// //   }
// //   function Server() {
// //     return (
// //       <div>
// //         <h1>Boom?</h1>
// //         <p>
// //           <Suspense fallback={<div>X</div>}>
// //             <Boom />
// //           </Suspense>
// //         </p>
// //       </div>
// //     )
// //   }

// //   await renderExpressResponse(req, res as any, {
// //     Skeleton,
// //     Server,
// //     entrypoints: {},
// //   })

// //   await new Promise((r) => res.on('finish', r))
// //   const html = res._getString()
// //   expect(html).toBe(
// //     '<!DOCTYPE html><html><body><div>Hello World!</div><script>alert(99);</script></body></html>'
// //   )
// // })
