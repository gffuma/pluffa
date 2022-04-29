export default function Skeleton({ appHtml, entrypoints }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {entrypoints.main
          .filter((e) => e.endsWith('.css'))
          .map((e) => (
            <link key={e} href={`/${e}`} rel="stylesheet" />
          ))}
      </head>
      <body>
        {process.env.EXPORT_STATIC_SPA_APP ? (
          <div id="root">
            <noscript>Enable JS Please</noscript>
          </div>
        ) : (
          <div
            id="root"
            dangerouslySetInnerHTML={{
              __html: appHtml,
            }}
          ></div>
        )}
      </body>
      {entrypoints.main
        .filter((e) => e.endsWith('.js'))
        .map((e) => (
          <script key={e} src={`/${e}`} />
        ))}
    </html>
  )
}
