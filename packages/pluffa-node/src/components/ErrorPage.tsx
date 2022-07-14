export default function ErrorPage({
  title,
  error,
}: {
  title: string
  error: Error
}) {
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
        <h3>{String(error)}</h3>
        <pre>{error.stack}</pre>
      </body>
    </html>
  )
}
