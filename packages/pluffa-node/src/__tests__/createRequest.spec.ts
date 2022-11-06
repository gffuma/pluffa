import createRequest from '../createRequest'

it('should create a good fake request', () => {
  const req = createRequest({
    url: '/?giova=23&giova=k&rinne=a',
    headers: {
      host: 'giova.fun:9000'
    }
  })

  expect(req.path).toBe('/')
  expect(req.url).toBe('/?giova=23&giova=k&rinne=a')
  expect(req.hostname).toBe('giova.fun')
  expect(req.get('host')).toBe('giova.fun:9000')
  expect(req.query).toEqual({
    giova: ['23', 'k'],
    rinne: 'a'
  })
  expect(req.param('rinne')).toBe('a')
  expect(req.param('xd', 99)).toBe(99)
  expect(req.protocol).toBe('http')
  expect(req.body).toEqual({})
  expect(req.httpVersion).toBe('1.1')
})
