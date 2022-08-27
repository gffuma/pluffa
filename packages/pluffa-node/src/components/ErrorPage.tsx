import Convert from 'ansi-to-html'

export default function ErrorPage({
  title,
  error,
}: {
  title: string
  error: Error
}) {
  const convert = new Convert({
    newline: true,
    escapeXML: true,
  })
  const errorHtml = convert.toHtml(String(error))
  const stackHtml = convert.toHtml(error.stack || '')
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <style
          type="text/css"
          dangerouslySetInnerHTML={{
            __html: `
          html {
            font-family: monospace;
            background-color: #092530;
            color: white;
          }
          h1 {
            color: hotpink;
          }
          `,
          }}
        />
      </head>
      <body>
        <h1>Pluffa.js 💔</h1>
        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{ __html: errorHtml }} />
        <br />
        <div dangerouslySetInnerHTML={{ __html: stackHtml }} />
      </body>
    </html>
  )
}
