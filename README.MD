# SNext.js

Build static sites with React

[![npm version](https://badge.fury.io/js/snext.svg)](https://badge.fury.io/js/snext)

### Next.js + react-snap = SNext.js

## What is this?

This is an experimental library based on [new React 18 server capabilities](https://github.com/reactwg/react-18/discussions/37) that combine the spirit of [Next.js](https://github.com/vercel/next.js) with the idea behinded [react-snap](https://github.com/stereobooster/react-snap) of creating a static site by crawling all links.

To do this instead of using [puppeter](https://github.com/puppeteer/puppeteer) and wait to all request to finsh we use the output of your server side rendered application to crawl all the links. Thanks to React 18 we can execute all side effects of React tree using Suspense.

SNext is an experimental project and is based on ogoing React 18 RC apis but by tests seems working like a charm 🎸 🎸 🎸

## Getting started

Create a SNext App:

```sh
yarn create snext-app [app_folder]
```

or

```
npx create-snext-app [app_folder]
```

This create a bare minimum SNext project, if you want Typescript add the `--typescript` flag.

If your looking into the generated `package.json`:

```json
{
  "snext": {
    "clientEntry": "./src/index.js",
    "serverComponent": "./src/StaticApp.js",
    "skeletonComponent": "./src/Skeleton.js"
  }
}
```

You have **3 main configurations points**:

- `serverComponent`: The path of your component rendered **ONLY** in node.
- `clientEntry`: The path of your client side entry point.
- `skeletonComponent`: The path of your html shell component rendered **ONLY** in node **after the server component render**.

SNext try to be more unopinated possibile and let you use the tools you love without the configuration boilerplate.

What is the idea behind Snext?

First we render the `serverComponent` in node with the current _crawling / requested_ `url` as prop, thanks to React 18 the tree rendered by the server component can use suspense to fetch its data dependencies.

When the server component render finish we take the html string generated and we pass it as prop to the render of `skeletonComponent` (rendered with the old `renderToString`). The final render output of skeleton is usded as _content of your site / http response in dev server_.

We use some special exported functions in `serverComponent` to inject props both in server and skeleton component.
So the skeleton component can inject in the html document the initial data collected during the server component render.

Finally in the `clientEntry` we use the injected data to correctly hydrate the react tree and the its data dependencies.

Ok, let's see an example.

> NOTE
> For show a real example we use [react-query](https://github.com/tannerlinsley/react-query) library to handle suspense data fetching and the [react-router](https://github.com/remix-run/react-router) library to handle routing. You can use your own routing and suspense data fetching libraries.

### `serverComponent`

The `serverComponent` is the path of your component rendered **ONLY** in node.
Here we use a data fetching library to have a way to dump al collected rederning data.

The Server Component receive the `url` prop from the server.

The Server Component file can export two special functions:

- `getStaticProps`: Called in node **before** each server component render used to inject extra props in server component.
- `getSkeletonProps`: Called **after** the server component render with props from `getStaticProps` used to inject collected rendering data into skeleton props.

```jsx
import { dehydrate, QueryClient, QueryClientProvider } from 'react-query'
import { StaticRouter } from 'react-router-dom/server.js'
import App from './App'

// This Component render in node tpically the inner app performs
// side effect during render both on server and client
// here we can inject the cache provider with a value created from
// server.
// Also here we use the url of server request to render the correc tree.
export default function StaticApp({ queryClient, url }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </QueryClientProvider>
  )
}

// Create the query client on the server
// Tipically you need a mutable cache to write, this is function
// can be used to create them.
// you can also perform other side effects and return them as props
// (the original Next.js getStaticProps)
export const getStaticProps = async ({ url }) => {
  return {
    props: {
      queryClient: new QueryClient({
        defaultOptions: {
          queries: {
            cacheTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchInterval: false,
            refetchIntervalInBackground: false,
            refetchOnMount: false,
            staleTime: Infinity,
            suspense: true,
          },
        },
      }),
    },
  }
}

// Here as second argument you have the props injected before
// you can use this function to dump the values write in the cache
// into a serializable format
export const getSkeletonProps = async ({ url }, { queryClient }) => {
  return {
    props: {
      initialData: dehydrate(queryClient),
    },
  }
}
```

### `skeletonComponent`

The `skeletonComponent` is the component used to provide a shell to your server render app.
The skeleton component is rendered after the server component has finish all side effects and we have its output.

The server component props are:

- `appHtml`: The html string of Server Component rendered,
- `entrypoints`: Strings of scripts or styles paths generated by the compilation step.

Plus all the props injected by `getSkeletonProps`.

```jsx
export default function Skeleton({ appHtml, initialData, entrypoints }) {
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
```

### `clientEntry`

The `clientEntry` is the path for your browser entry point.
Here we use the initial data injected by the Skeleton to hydrate the state of our app.

```jsx
import { hydrateRoot } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

hydrate(queryClient, window.__INITIAL_DATA__)
delete window.__INITIAL_DATA__

hydrateRoot(
  document.getElementById('root'),
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
)
```

You can find the complete example [here](./examples/pokedex).

## Commands

- `dev` command starts a dev server on port _7000_ with fast refresh and hot module reload so you can try
  both your client and server code.

- `build` command generate a intermediate folder with a production build of your client and node code.

- `staticize` command use the production code of `build` command to render your app using node and crawling your links to generate a static site with all of your routes.

## Running node specific code

You can run specefic node code wherever you want using `process.env.IS_SNEXT_SERVER`.
This special expression in statically replaced with `true` in node environment and `false` on
client.
Note, all node native modules are empty modules in client javascript.

```js
// Empty module in client
import fs from 'fs'

// Removed in production client bundle by tree shaking
function readMy() {
  return fs.readFileSync('something.json', 'utf-8')
}

if (process.env.IS_SNEXT_SERVER) {
  // Never shipped to client bundle
  readMy()
}
```

## Running isomorphic universal code

Most of server render framework let you run isomorphic in the "page" context for
example next.js use the `getStaticProps` function.

> What does it mean isomorphic lol?

When you visit the page _A_ this function is executed in node.
Later when you visit another page _B_ with the client side push state the data for the
_B_ page are atuomatically fetched over the network.

Instead of using the "page" context SNext give you a low level api to run isomorphic code
wherever you want! 🤠

### Hello `statik()`

Instead of writing a function near to the component we decouple all isomorphic
code like an API.

First you need to configure you `registerStatik` file in your `package.json`:

```json
{
  "snext": {
    "registerStatik": "./src/registerStatik.js"
  }
}
```

An example of `./src/registerStatik.js`:

```js
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import showdown from 'showdown'

export default function registerStatik(router) {
  router.get('/posts', async () => {
    const ls = await fs.readdir(path.resolve(process.cwd(), 'content/posts'))
    const posts = []
    for (const pathname of ls) {
      const md = await fs.readFile(
        path.resolve(process.cwd(), 'content/posts', pathname),
        'utf-8'
      )
      const content = matter(md)
      posts.push(content.data)
    }
    return posts
  })

  router.get('/posts/:slug', async ({ params }) => {
    const { slug } = params
    const md = await fs.readFile(
      path.resolve(process.cwd(), 'content/posts', `${slug}.md`),
      'utf-8'
    )
    const parsed = matter(md)
    const converter = new showdown.Converter({
      strikethrough: true,
    })
    const html = converter.makeHtml(parsed.content)
    return {
      ...parsed.data,
      html,
    }
  })
}
```

The `router` act like an http router but instead of returning a response you
can alredy return serializable data.

To access _statik_ endpoints you have to use the `statik()` helper from `snext/statik`:

```jsx
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import statik from 'snext/statik'

export default function Post() {
  const { slug } = useParams()
  const { data: post } = useQuery(['post', slug], () =>
    statik(`/posts/${slug}`)
  )

  return (
    <div>
      <Link to="/">Back</Link>
      <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
    </div>
  )
}
```

The `statik` function is your hammer to build isomorphic stuff!
When called from node it simply run your corresponding node code.
When called form browser it perform a network call associated with your code.
Both in client and server `statik` returns a `Promise` of your data.
The `statik` API mimic the `fetch` but supports only: `url`, `method`, `body` (No need to `JSON.stringify` the body).

The cherry on the cake 🍒

When you run the `staticize` command all GET calls are write to disk as `json` files and the production browser
code of `statik` automatic points to these files.

You can control the static folder of these files with the `statikDataDir` option in `package.json`
(pass `false` to skip writing):

```json
{
  "snext": {
    "statikDataDir": "mydata"
  }
}
```

You can find an example of `statik` usage [here](./examples/blog).

## Node ESM

The SNext package itself is [pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
also your code is compiled as node ESM, however you can omit file extension in relative import cause your code will be bundled
as a single file, on the other hand you have to write explicit extension for _node_modules_ import for example:

```js
import { StaticRouter } from 'react-router-dom/server.js'
```

You can also compile your code as commonJS, if you want, with:

```json
{
  "snext": {
    "compileNodeCommonJS": true
  }
}
```

With commonJS the hot reload of node code is a litte bit faster (the implementation is more tricky) and you
can omit file extension for _node_modules_ dependency but you can't import pure ESM modules.

## No Javascript

If your website has no interaction except for links you can decide to ship
it without **ANY** Javascript.

With SNext doing it's simple, hack you Skeleton Component:

```jsx
export default function Skeleton({ appHtml, initialData, entrypoints }) {
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
      </head>
      <body>
        <div
          id="root"
          dangerouslySetInnerHTML={{
            __html: appHtml,
          }}
        />
      </body>
      {/* In DEV we use javascript for hot reload =) */}
      {process.env.NODE_ENV !== 'production' && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__INITIAL_DATA__ = ${JSON.stringify(
                initialData
              )};`,
            }}
          />
          {entrypoints
            .filter((e) => e.endsWith('.js'))
            .map((e) => (
              <script key={e} src={`/${e}`} />
            ))}
        </>
      )}
    </html>
  )
}
```

## Crawling

When running `staticize` all `<a>` with a relative `href` will be crawled,
we `crawl` also the `data-crawl-url` for case where you can't render a link
for example table rows.

The default starting point of crawling is `/` you can customize the urls to start:

```json
{
  "snext": {
    "urls": ["/", "/blog", "/about"]
  }
}
```

You can also tweak crawling concurrency with:

```json
{
  "snext": {
    "crawlConcurrency": 1
  }
}
```

## Proxy

To add an url to proxy:

```json
{
  "snext": {
    "proxy": "http://somehost"
  }
}
```

Note that when crawling we are not running an http server so proxy wont
works so you can have something like this in your code:

```js
export const API_URL = process.env.IS_SNEXT_SERVER ? 'https://somehost' : ''
```

## Configure

Here all the available snext options with their defaults:

```json
{
  "snext": {
    "clientEntry": "./path/to/file",
    "serverComponent": "./path/to/file",
    "skeletonComponent": "./path/to/file",
    "port": 7000,
    "outputDir": "build",
    "publicDir": "public",
    "compileNodeCommonJS": false,
    "urls": ["/"],
    "crawlConcurrency": 4,
    "proxy": null,
    "statikDataDir": "snextdata",
    "registerStatik": null
  }
}
```

## [EXAMPLES](./examples)

## TODO:

- [ ] Post CSS
- [ ] CSS preprocessor(s)
- [ ] Generic file loader
- [ ] Add Helmet example in blog example
- [ ] Custom env ecc
- [ ] Configure Babel
- [ ] Emotion example (for to show set up with css in js)

## LICENSE

MIT
