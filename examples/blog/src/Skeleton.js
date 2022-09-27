import { Scripts, Root, Styles } from '@pluffa/ssr/skeleton'
// import { Helmet } from 'react-helmet'

export default function Skeleton({ appHtml, initialData, entrypoints }) {
  // const helmet = Helmet.renderStatic()
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <Styles />
        {/* {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()} */}
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
