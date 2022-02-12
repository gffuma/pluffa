import { Helmet } from 'react-helmet'

export default function Skeleton({ appHtml, initialData, entrypoints }) {
  const helmet = Helmet.renderStatic()
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {entrypoints
          .filter((e) => e.endsWith('.css'))
          .map((e) => (
            <link key={e} href={`/${e}`} rel="stylesheet" />
          ))}
        {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}
      </head>
      <body>
        <div
          id="root"
          dangerouslySetInnerHTML={{
            __html: appHtml,
          }}
        />
      </body>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__INITIAL_DATA__ = ${JSON.stringify(initialData)};`,
        }}
      />
      {entrypoints
        .filter((e) => e.endsWith('.js'))
        .map((e) => (
          <script key={e} src={`/${e}`} />
        ))}
    </html>
  )
}
