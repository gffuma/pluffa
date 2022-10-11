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
  url: string
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

## Configuration

## Commands
 -->

## LICENSE

MIT
