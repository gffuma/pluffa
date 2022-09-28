import { Root, Scripts, Styles } from '@pluffa/ssr/skeleton'

export default function Skeleton() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <Styles />
      </head>
      <body>
        <div id="root">
          <Root />
        </div>
        <Scripts async />
      </body>
    </html>
  )
}
