import { Root, Scripts, Styles } from '@pluffa/ssr/skeleton'
import { useSSRData } from '@pluffa/ssr'

export default function Skeleton() {
  const { appType } = useSSRData()
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <Styles entry={appType} />
      </head>
      <body>
        <div id="root">
          <Root />
        </div>
      </body>
      <Scripts entry={appType} />
    </html>
  )
}
