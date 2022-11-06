# Pluffa.js

> SSR & SSG For React Apps

- :package: Works out of the box with [Create React App](https://create-react-app.dev).
- :smiling_face_with_three_hearts: The developer experience you deserve: **Fast Refresh**, **HMR** both on client and server.
- :rocket: Use new React **Streaming Server Side Rendering** architecture.
- :gear: Also available for [Cloudflare Workers](https://workers.cloudflare.com).

## Why Pluffa.js?

There are already [Next.js](https://nextjs.org) and [Remix](https://remix.run) why i need **Pluffa**?

- First you can easily add **SSR** or **SSG** to an App built with _Create React App_ with minimal effort.
- In second place **Pluffa** is not a **Framework** is more a **Build Tool**. The spirit of Pluffa is to be a Create React App but for server side rendering, your code, your choice ... but without the overhead of configuring all the build environment.

## Example

An example Pokedex App with **SEO** and **SSR**/**SSG** using Pluffa with:

- [react-router](https://github.com/remix-run/react-router) For routing.
- [@tanstack/react-query](https://github.com/tanstack/query) For Suspense Data Fetching.
- [react-helmet-async](https://www.npmjs.com/package/react-helmet-async) For SEO in Head.

## `Server.tsx`

```tsx
import { useSSRRequest, useSSRData, getScriptsTags } from '@pluffa/ssr'
import { GetServerData } from '@pluffa/node-render'
import {
  dehydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { HelmetData, HelmetProvider } from 'react-helmet-async'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export default function Server() {
  // Get SSR Url of request
  const { url } = useSSRRequest()
  // Get data from getServerData
  const { queryClient, helmetContext } = useSSRData()
  // Init providers with data and use the url for SSR Rouring
  return (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export const getServerData: GetServerData = async ({
  // Current SSR Request
  request,
  // Map of bundler entrypoints such scripts and styles
  entrypoints,
}) => {
  // On every request create a fresh SSR Environment
  // Instance any data fetching store with Suspense support
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        suspense: true,
      },
    },
  })
  // Handle all SEO Head tags during current request
  const helmetContext = {} as HelmetData['context']
  return {
    // Pass to Server Component
    data: {
      queryClient,
      helmetContext,
    },
    // Inject content into Node / Edge stream before </head> tag close
    // Theese callbacks will be called after all Suspense boundaries finish
    injectBeforeHeadClose: () =>
      // Create a string using the collected result of <Helmet /> SEO rendering
      (['title', 'meta', 'link'] as const)
        .map((k) => helmetContext.helmet[k].toString())
        .join(''),
    injectBeforeBodyClose: () =>
      // Serialize Suspense data fetching store data collected during rendering
      // for client hydratation. This must be insered BEFORE App runtime scripts.
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(
        dehydrate(queryClient)
      )};</script>` +
      // Inject client JS of your React App
      getScriptsTags(entrypoints),
  }
}
```

## `Skeleton.tsx`

```tsx
import { Styles, Root } from '@pluffa/ssr/skeleton'

export default function Skeleton() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* Bundled collected style tags */}
        <Styles />
      </head>
      <body>
        <div id="root">
          {/*
            Render the Server component, if Server component
            generate errors don't render anything.
            The Skeleton component is always rendered independently from Server component.
          */}
          <Root />
        </div>
      </body>
    </html>
  )
}
```

## `client.tsx`

```tsx
import './index.css'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import {
  QueryClientProvider,
  QueryClient,
  hydrate,
} from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'

// Create client Suspense store
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})

// Hydrate the store from SSR Data
hydrate(queryClient, (window as any).__INITIAL_DATA__)
// Let Garbage Collector free SSR Data
delete (window as any).__INITIAL_DATA__

// Hydrate SSR React HTML tree
ReactDOM.hydrateRoot(
  document.getElementById('root')!,
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
)
```

## `App.tsx`

```tsx
import { Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import { Route, Routes } from 'react-router-dom'
import Pokedex from './Pokedex'
import Pokemon from './Pokemon'

export default function App() {
  return (
    <>
      <Helmet>
        <title>Pokedex</title>
      </Helmet>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route index element={<Pokedex />} />
          <Route path="/pokemon/:name" element={<Pokemon />} />
        </Routes>
      </Suspense>
    </>
  )
}
```

## `fetch.ts`

```ts
// Create an isomorphic http client
// You can use library such AXIOS that alredy have two different export
// for web and node.
// We use fetch to show an example with minimal runtime overhead.
// ... You can also use this technique to polyfill fetch by setting global.fetch
// in NodeJS env ...
const fetch =
  // Special Pluffa value populated at BUILD time
  // So bundler can strip code in branches
  process.env.IS_PLUFFA_SERVER
    ? // On the server we use the undici fetch implementation
      require('undici').fetch
    : // On the client use built it window fetch
      window.fetch
export default fetch as typeof window.fetch
```

## `Pokedex.tsx`

```tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import fetch from './fetch'

interface Pokemon {
  name: string
}
interface PokemonList {
  results: Pokemon[]
}

// Call the same api on client and server
// with pokemons information
export default function Pokedex() {
  const { data } = useQuery(['pokemons'], () =>
    fetch(`https://pokeapi.co/api/v2/pokemon`).then(
      (r) => r.json() as Promise<PokemonList>
    )
  )
  return (
    <div>
      <h1>Pokedex</h1>
      {data!.results.map((pokemon) => (
        <div key={pokemon.name}>
          <Link to={`/pokemon/${pokemon.name}`}>
            <h2>{pokemon.name}</h2>
          </Link>
        </div>
      ))}
    </div>
  )
}
```

## `Pokemon.tsx`

```tsx
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import fetch from './fetch'

interface PokemonDetail {
  name: string
  sprites: {
    back_default: string
    front_default: string
  }
}

// Use router params to render a speicific pokemon
export default function Pokemon() {
  const { name } = useParams()
  const { data: pokemon } = useQuery(['pokemon', name], () =>
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}/`).then(
      (r) => r.json() as Promise<PokemonDetail>
    )
  )
  return (
    <div>
      {/* Some SEO of our Pokemon */}
      <Helmet>
        <title>{`${pokemon!.name} Pokedex`}</title>
      </Helmet>
      <h1>{pokemon!.name}</h1>
      <h2>
        <Link to="/">{'<'}</Link>
      </h2>
      <img src={pokemon!.sprites.back_default} />
      <br />
      <img src={pokemon!.sprites.front_default} />
    </div>
  )
}
```

## Installation

First install the main Pluffa package.

Yarn:

```sh
yarn add --dev pluffa
```

NPM:

```sh
npm install --save-dev pluffa
```

Then install the **runtime** related package.
The default runtime for Pluffa is **node**.

Yarn:

```sh
yarn add --dev @pluffa/node
```

NPM:

```sh
npm install --save-dev @pluffa/node
```

## Gettining Started

### Comannds

First of all your need to update your `package.json` file to configure the Pluffa
commands:

```json
"scripts": {
  "dev": "pluffa dev",
  "start": "pluffa start",
  "build": "pluffa build",
  "staticize": "pluffa staticize"
}
```

An overview of commands:

#### dev

Starts a dev server on port 7000 with hot reload and fast refresh.

#### build

Build your app for production.

#### start

This command must be runned after the **build** command.
Starts a production server on port 7000.

#### staticize

This command must be runned after the **build** command.
Perform the **Static Site Generating** of your app.

### Basic Configuration

Then you need at least 3 key configuration:
**skeletonComponent**, **serverComponent** and **clientEntry**.

There are [a lot of way](README.md#Configuration) to configure Pluffa, but with start with the basic one.
The `pluffa.json` near to `package.json` file:

```json
{
  "$schema": "https://cdn.giova.fun/pluffa/schema.json",
  "runtime": "node",
  "skeletonComponent": "./src/Skeleton.js",
  "serverComponent": "./src/Server.js",
  "clientEntry": "./src/index.js"
}
```

#### Skeleton Component

Path to your skeleton React component file. The default export of this file
is used as skeleton component.
This component is rendered only on the server and describe the shell of your
React application.

```jsx
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
        <Scripts />
      </body>
    </html>
  )
}
```

To write your skeleton component you can use the pre installed `'@pluffa/ssr/skeleton'` package.
This package contains the building block for your skeleton component.

#### Server Component

Path to your server React component file. The default export of this file
is used as server component.
This component is rendered only on the server and describe the root tree
of your React app.

The server component has a super power that is the **key feature of Pluffa**.
It wait all the [suspense](https://reactjs.org/docs/react-api.html#suspense)
boundaries to finish, so you can use it to do **Server Side Rendering with Suspense**.

```jsx
import App from './App'

export default function Server() {
  return <App />
}
```

The server component alone isn't so special...
But the server component file can also export a special function use to
configure the SSR called `getServerData`.

Signature:

```ts
export interface ServerData<Data> {
  data: Data
  injectBeforeBodyClose?: () => string
  injectBeforeHeadClose?: () => string
}

export interface GetServerDataConfig {
  request: RequestWrapper
  entrypoints: Record<string, string[]>
}

export type GetServerData<Data> = (
  config: GetServerDataConfig
) => ServerData<Data> | Promise<ServerData<Data>>
```

The `getServerData` is called on each request so you can create safe contexts
for the your SSR infrastructure.

You can access the `data` field in your server component with the `useSSRData` hook via `'@pluffa/ssr'` pre installed package.

```tsx
import App from './App'
import { useSSRData } from '@pluffa/ssr'

export default function Server() {
  const { foo } = useSSRData()
  return <App foo={foo} />
}

export const getServerData = async () => {
  const foo = await getFoo()
  return {
    data: {
      foo,
    },
  }
}
```

#### Client Entry

## Typescript

## Templates

If you start from scratch with Pluffa you can create a blank App with:

```sh
yarn create pluffa-app YourAppFolder
```

or

```sh
npx create-pluffa-app YourAppFolder
```

You can also specify a `--template` option, availables are:

- **node**: Base SSR Pluffa node template.
- **node-typescript**: Base SSR Pluffa node template but with TypeScript.

## Data Fetching

## SEO

## SSG

## Configuration

<!-- - `<Styles />`: Render the styles imported in your application.
- `<Scripts />`: Render the scripts imported in your application.
- `<Root />`: Render the component defined in **serverComponent** file. -->
<!-- To getting  -->

<!-- ## Switch from Create React App

Install pluffa and pluffa node bindings.
```sh
yarn remove react-scripts
yarn add --dev pluffa @pluffa/node
```
or
```
npm remove react-scripts
npm install --save-dev pluffa @pluffa/node
```

Update field `"scripts"` in **package.json** ([See](README.MD#Commands) in depth all availables commands):

```json
"scripts": {
  "dev": "pluffa dev",
  "start": "pluffa start",
  "build": "pluffa build",
  "staticize": "pluffa staticize"
},
```

Create a configuration file ([See](README.MD#Configuration) in depth how configuration works):

```sh
touch pluffa.json
```

`pluffa.json`
```json
{
  "$schema": "https://cdn.giova.fun/pluffa/schema.json",
  "runtime": "node",
  "clientEntry": "./src/index.js",
  "serverComponent": "./src/App.js",
  "skeletonComponent": "./src/Skeleton.js"
}
```

The `Skeleton.js` is `index.html` of your SSR App:
`Skeleton.js`

```js
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
        <Scripts />
      </body>
    </html>
  )
}
```

Yeah you did it!
:fire:

```sh
yarn dev
```
> **NOTE:** The above commands works also for TypeScript simple keep your `tsconfig.json` and use `.tsx` extensions.


## Concepts

### Client Entry
The `clientEntry` is your client entrypoint this file will be the


## Commands
 -->

## Configuration

You can configure Pluffa in a lot of way:

In the _package.json_ with a `"pluffa"` key.

A _pluffa.json_ file. To have autocomplete in your editor you can use
the special `"$schema"` key:

```json
{
  "$schema": "https://cdn.giova.fun/pluffa/schema.json"
}
```

You can also use a JavaScript file `pluffa.config.js` for CommonJS, the default
exports is used as configuration:

```js
/**
 * @type {import('@pluffa/node/config').NodeConfig}
 */
module.exports = {
  /* Config Here */
}
```

Or a `pluffa.config.mjs` file for ESM format:

```js
/**
 * @type {import('@pluffa/node/config').NodeConfig}
 */
export default {
  /* Config Here */
}
```

Finally if you need to customize you Pluffa config based on wich command is runned
you can export a function that return the configuration or a configuration Promise:

```js
/**
 * @param {import('pluffa/config').CommandName} cmd
 * @return {Promise<import('@pluffa/node/config').NodeConfig>}
 */
export default async (cmd) => {
  return {
    /* Config Here */
  }
}
```

You can check the configuration methodo picked by inspecting the Pluffa output
in your terminal.

## LICENSE

MIT
