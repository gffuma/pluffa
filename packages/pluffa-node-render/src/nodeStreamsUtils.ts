import { Transform } from 'stream'

export function createHtmlInjectTransformer(
  token: string,
  inject: () => string
) {
  let injected = false

  return new Transform({
    transform(chunk: Buffer, encoding, callback) {
      if (!injected) {
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
