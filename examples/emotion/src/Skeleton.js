import createEmotionServer from '@emotion/server/create-instance'

export default function Skeleton({ appHtml, entrypoints, cache }) {
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(cache)
  const chunks = extractCriticalToChunks(appHtml)
  const styles = constructStyleTagsFromChunks(chunks)
  const headContent = `
    <meta charSet="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" href="/favicon.ico">
    ${styles}
  `
  return (
    <html>
      <head dangerouslySetInnerHTML={{ __html: headContent }} />
      <body>
        <div
          id="root"
          dangerouslySetInnerHTML={{
            __html: appHtml,
          }}
        />
      </body>
      {entrypoints.main
        .filter((e) => e.endsWith('.js'))
        .map((e) => (
          <script key={e} src={`/${e}`} />
        ))}
    </html>
  )
}
