import { Transform } from 'stream'

export function createTagHtmlInjectTransformer(
  token: string,
  oneTime: boolean,
  inject: () => string
) {
  let injected = false

  return new Transform({
    transform(chunk: Buffer, encoding, callback) {
      if (!oneTime || !injected) {
        const content = chunk.toString()
        let index
        if ((index = content.indexOf(token)) !== -1) {
          const newContent =
            content.slice(0, index) +
            inject() +
            content.slice(index, content.length)
          injected = true
          callback(null, Buffer.from(newContent, 'utf-8'))
          return
        }
      }
      callback(null, chunk)
    },
  })
}

export function createEndHtmlInjectTransformer(inject: () => string) {
  return new Transform({
    flush(callback) {
      callback(null, Buffer.from(inject(), 'utf-8'))
    },
    transform(chunk: Buffer, encoding, callback) {
      callback(null, chunk)
    },
  })
}
