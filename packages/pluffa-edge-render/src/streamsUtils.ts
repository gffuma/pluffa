export function stringToStream(str: string) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(str))
      controller.close()
    },
  })
}

export function createHtmlInjectTransformer(
  token: string,
  inject: () => string
) {
  let injected = false

  return new TransformStream({
    transform(chunk, controller) {
      if (!injected) {
        const content = new TextDecoder().decode(chunk)

        let index
        if ((index = content.indexOf(token)) !== -1) {
          const newContent =
            content.slice(0, index) +
            inject() +
            content.slice(index, content.length)
          injected = true
          controller.enqueue(new TextEncoder().encode(newContent))
          return
        }
      }
      controller.enqueue(chunk)
    },
  })
}